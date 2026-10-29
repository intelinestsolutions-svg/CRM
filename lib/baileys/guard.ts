/**
 * Safety guard for outgoing WhatsApp messages.
 *
 * This app must only ever send one-to-one messages. Groups, channels,
 * status broadcasts, and broadcast lists are rejected at the lowest send
 * layer so no future feature (or a bad request) can turn the linked number
 * into a broadcast/spam sender, which is the fastest way to get banned.
 */

const BLOCKED_JID_PARTS = ['@g.us', '@broadcast', '@newsletter'];

/** True only for a single-person chat (phone number or LID). */
export function isDirectChatJid(jid: string | null | undefined): jid is string {
  if (!jid) return false;
  const value = jid.trim().toLowerCase();
  if (!value || value === 'status@broadcast') return false;
  if (BLOCKED_JID_PARTS.some((part) => value.includes(part))) return false;
  // A direct chat is a non-empty numeric id on the user (PN) or LID domain.
  return /^[0-9]+@(s\.whatsapp\.net|lid)$/.test(value);
}

/**
 * Normalise a recipient into a direct-chat JID, or throw.
 * Accepts a bare number, `+number`, `number@s.whatsapp.net`, or `id@lid`.
 */
export function toDirectJid(to: string): string {
  const raw = (to ?? '').trim();
  if (!raw) throw new Error('Recipient is required.');

  const jid = raw.includes('@')
    ? raw
    : `${raw.replace(/\D/g, '')}@s.whatsapp.net`;

  if (!isDirectChatJid(jid)) {
    throw new Error(
      'Broadcast sending is disabled. Messages can only be sent to a single contact — groups, channels, status updates, and broadcast lists are blocked.',
    );
  }

  return jid;
}
