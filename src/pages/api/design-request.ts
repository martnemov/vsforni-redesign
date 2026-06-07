import type { APIRoute } from 'astro';
import { designRequestSchema } from '@/lib/validators';
import { sendEmail, buildHtml } from '@/lib/email';
import { verifyCaptcha } from '@/lib/captcha';
import { logFormSubmission } from '@/lib/logger';
import { sendTelegram, fmt } from '@/lib/telegram';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try { body = await request.json(); } catch { return json({ ok: false }, 400); }

  const parsed = designRequestSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, errors: parsed.error.flatten().fieldErrors }, 422);

  const { name, phone, email, message, hp } = parsed.data;
  if (hp) return json({ ok: true });

  if (!(await verifyCaptcha((body as Record<string, unknown>)['captchaToken'] as string | undefined))) {
    return json({ ok: false, error: 'Captcha failed' }, 400);
  }

  const fields = { Имя: name, Телефон: phone, Email: email, 'Описание проекта': message };
  const subject = 'Заявка на проектирование — VS FORNI';

  await Promise.allSettled([
    sendEmail(subject, buildHtml(subject, fields)),
    sendTelegram(fmt(subject, fields)),
  ]);

  logFormSubmission('design-request', { name, phone, email, message });

  return json({ ok: true });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
