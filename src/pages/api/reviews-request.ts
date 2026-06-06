import type { APIRoute } from 'astro';
import { reviewsRequestSchema } from '../../lib/validators';
import { sendEmail, buildHtml } from '../../lib/email';
import { verifyCaptcha } from '../../lib/captcha';
import { logFormSubmission } from '../../lib/logger';
import { sendTelegram, fmt } from '../../lib/telegram';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }

  const parsed = reviewsRequestSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, errors: parsed.error.flatten().fieldErrors }, 422);

  const { name, phone, company, hp } = parsed.data;
  if (hp) return json({ ok: true });

  if (!(await verifyCaptcha((body as Record<string, unknown>)['captchaToken'] as string | undefined))) {
    return json({ ok: false, error: 'Captcha failed' }, 400);
  }

  const fields = { Имя: name, Телефон: phone, Компания: company };
  const subject = 'Запрос отзывов — VS FORNI';

  await Promise.allSettled([
    sendEmail(subject, buildHtml(subject, fields)),
    sendTelegram(fmt(subject, fields)),
  ]);

  logFormSubmission('reviews-request', { name, phone, company });

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
