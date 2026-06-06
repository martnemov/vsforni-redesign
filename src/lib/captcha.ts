export async function verifyCaptcha(token: string | undefined): Promise<boolean> {
  const serverKey = import.meta.env.SMARTCAPTCHA_SERVER_KEY;

  // If no key configured — skip check (dev/staging without captcha)
  if (!serverKey) return true;
  if (!token) return false;

  try {
    const res = await fetch('https://smartcaptcha.yandexcloud.net/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: serverKey, token }),
    });
    const json = await res.json() as { status: string };
    return json.status === 'ok';
  } catch {
    // Network error — fail open so forms still work if Yandex is down
    console.warn('[captcha] Verification request failed — passing');
    return true;
  }
}
