export async function sendTelegram(text: string): Promise<void> {
  const token  = import.meta.env.TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (e) {
    console.warn('[telegram] Send failed:', e);
  }
}

export function fmt(title: string, fields: Record<string, string | undefined>): string {
  const lines = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `<b>${k}:</b> ${v}`);
  return `<b>${title}</b>\n\n${lines.join('\n')}`;
}
