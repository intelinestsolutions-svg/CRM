// Shared, in-memory diagnostic state for the WhatsApp connection.
// Imported by both connection.ts and handler.ts to avoid circular deps.
export const waDebug = {
  messagesUpsertEvents: 0,
  lastUpsertType: null as string | null,
  lastUpsertCount: 0,
  lastRemoteJids: [] as string[],
  lastInboundAt: null as string | null,
  lastInboundFrom: null as string | null,
  lastInboundBody: null as string | null,
  lastHandlerError: null as string | null,
  lastReplyAt: null as string | null,
  lastReplyError: null as string | null,
  lastSendError: null as string | null,
};
