import { Resend } from 'resend';

let cachedClient: Resend | null = null;
let cachedApiKey: string | null = null;

function getResendApiKey(): string | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  return apiKey ? apiKey : null;
}

export function getResendClient(): Resend | null {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    cachedClient = null;
    cachedApiKey = null;
    return null;
  }

  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new Resend(apiKey);
    cachedApiKey = apiKey;
  }

  return cachedClient;
}
