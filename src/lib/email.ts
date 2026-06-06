import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host:   import.meta.env.SMTP_HOST ?? 'smtp.yandex.ru',
    port:   Number(import.meta.env.SMTP_PORT ?? 465),
    secure: import.meta.env.SMTP_SECURE !== 'false',
    auth: {
      user: import.meta.env.SMTP_USER,
      pass: import.meta.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(subject: string, html: string): Promise<void> {
  const to   = import.meta.env.SMTP_TO ?? import.meta.env.SMTP_USER;
  const from = import.meta.env.SMTP_USER;

  if (!from || !import.meta.env.SMTP_PASS) {
    console.warn('[email] SMTP credentials not configured — skipping send');
    return;
  }

  const transport = createTransport();
  await transport.sendMail({ from, to, subject, html });
}

export function buildHtml(title: string, fields: Record<string, string | undefined>): string {
  const rows = Object.entries(fields)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#666;white-space:nowrap">${k}</td><td style="padding:6px 12px;font-weight:600">${v}</td></tr>`)
    .join('');
  return `<h2>${title}</h2><table style="border-collapse:collapse">${rows}</table>`;
}
