export async function POST(request) {
  try {
    const payload = await request.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env variable.');
    }

    const text = Object.entries(payload || {})
      .map(([key, value]) => `${key}: ${value ?? ''}`)
      .join('\n');

    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!telegramResponse.ok) {
      const telegramErrorText = await telegramResponse.text();
      throw new Error(telegramErrorText || 'Telegram API request failed.');
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
