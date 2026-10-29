import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

const logger = pino({ level: 'silent' });
const AUTH_DIR = path.join(process.cwd(), 'auth');

let sock: any = null;
let qrDataUrl: string | null = null;
let connectionStatus = 'disconnected';
let lastQr: string | null = null;

export function getStatus() {
  return { status: connectionStatus, qr: qrDataUrl };
}

export async function startWhatsApp() {
  if (sock) return { status: connectionStatus, qr: qrDataUrl };

  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['WACRM-Custom', 'Chrome', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update: any) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      lastQr = qr;
      try {
        qrDataUrl = await QRCode.toDataURL(qr);
      } catch {
        qrDataUrl = null;
      }
      connectionStatus = 'qr';
    }
    if (connection === 'close') {
      const code = (lastDisconnect?.error as any)?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        sock = null;
        qrDataUrl = null;
        connectionStatus = 'disconnected';
        setTimeout(() => startWhatsApp(), 2000);
      } else {
        sock = null;
        qrDataUrl = null;
        connectionStatus = 'logged_out';
      }
    }
    if (connection === 'open') {
      qrDataUrl = null;
      connectionStatus = 'connected';
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }: any) => {
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

  return { status: connectionStatus, qr: qrDataUrl };
}

export function getSocket() {
  return sock;
}
