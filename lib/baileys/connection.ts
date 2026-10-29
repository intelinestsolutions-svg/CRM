import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import type { ConnectionState, WAMessage, MessageUpsertType } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

const logger = pino({ level: process.env.WHATSAPP_LOG_LEVEL || 'silent' });
const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR || path.join(process.cwd(), 'auth');

let sock: any = null;
let qrDataUrl: string | null = null;
let connectionStatus = 'disconnected';
let lastQr: string | null = null;
let lastError: string | null = null;
let starting = false;
let reconnectTimer: NodeJS.Timeout | null = null;

export function getStatus() {
  return { status: connectionStatus, qr: qrDataUrl, error: lastError };
}

function clearAuthDir() {
  try {
    if (!fs.existsSync(AUTH_DIR)) return;
    for (const entry of fs.readdirSync(AUTH_DIR)) {
      fs.rmSync(path.join(AUTH_DIR, entry), { force: true, recursive: true });
    }
  } catch (e) {
    console.error('failed to clear auth dir', e);
  }
}

export function resetSession() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  try {
    sock?.end?.(undefined);
  } catch {
    // ignore
  }
  sock = null;
  qrDataUrl = null;
  lastQr = null;
  lastError = null;
  starting = false;
  connectionStatus = 'disconnected';
  clearAuthDir();
  return getStatus();
}

async function resolveVersion() {
  try {
    const result = await Promise.race([
      fetchLatestBaileysVersion(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('fetchLatestBaileysVersion timed out')), 5000),
      ),
    ]);
    return result.version;
  } catch (e) {
    console.warn('could not fetch latest Baileys version, using bundled default:', e);
    return undefined;
  }
}

export async function startWhatsApp() {
  if (sock || starting) return getStatus();

  starting = true;
  lastError = null;

  try {
    if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const version = await resolveVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ['WACRM-Custom', 'Chrome', '1.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        lastQr = qr;
        try {
          qrDataUrl = await QRCode.toDataURL(qr);
        } catch (e) {
          console.error('failed to render QR', e);
          qrDataUrl = null;
        }
        connectionStatus = 'qr';
        console.log('WhatsApp QR ready');
      }

      if (connection === 'connecting') {
        connectionStatus = qrDataUrl ? 'qr' : 'connecting';
      }

      if (connection === 'close') {
        const code = (lastDisconnect?.error as any)?.output?.statusCode;
        const reason =
          (lastDisconnect?.error as any)?.message ||
          (lastDisconnect?.error as any)?.output?.payload?.message ||
          'connection closed';
        sock = null;
        qrDataUrl = null;
        console.error('WhatsApp connection closed', { code, reason });

        if (code === DisconnectReason.loggedOut) {
          connectionStatus = 'logged_out';
          lastError = 'This WhatsApp session was logged out. Reset the session and scan again.';
        } else if (code === DisconnectReason.badSession) {
          connectionStatus = 'error';
          lastError = 'WhatsApp rejected the session. Reset the session and scan again.';
        } else if (code === DisconnectReason.connectionReplaced) {
          connectionStatus = 'error';
          lastError = 'This session was opened somewhere else. Close the other session first.';
        } else {
          // 428/408/515 are routine: the QR expired, the socket went idle, or
          // WhatsApp asked for a restart. Reconnect quietly and issue a new QR
          // instead of showing the user a scary error.
          const routine =
            code === DisconnectReason.connectionClosed ||
            code === DisconnectReason.connectionLost ||
            code === DisconnectReason.timedOut ||
            code === DisconnectReason.restartRequired;

          connectionStatus = routine ? 'connecting' : 'error';
          if (!routine) {
            lastError = `Connection closed (${code ?? 'unknown'}: ${reason})`;
          }

          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              startWhatsApp().catch((e) => console.error('reconnect failed', e));
            }, routine ? 1000 : 2000);
          }
        }
      }

      if (connection === 'open') {
        qrDataUrl = null;
        lastError = null;
        connectionStatus = 'connected';
        console.log('WhatsApp connected');
      }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }: { messages: WAMessage[]; type: MessageUpsertType }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (msg.key.fromMe) continue;
        const from = msg.key.remoteJid;
        if (!from || from.includes('@g.us')) continue;
        const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        if (!body) continue;
        try {
          const { handleIncomingMessage } = await import('./handler');
          await handleIncomingMessage(sock, from, body, msg);
        } catch (e) {
          console.error('handler error', e);
        }
      }
    });

    return getStatus();
  } catch (e) {
    sock = null;
    qrDataUrl = null;
    connectionStatus = 'error';
    lastError = e instanceof Error ? e.message : String(e);
    console.error('failed to start WhatsApp', e);
    throw e;
  } finally {
    starting = false;
  }
}

export function getSocket() {
  return sock;
}
