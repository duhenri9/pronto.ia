export const MARIA_WHATSAPP_NUMBER = '5511950377457';

export const MARIA_WHATSAPP_BASE_URL = `https://wa.me/${MARIA_WHATSAPP_NUMBER}`;

export function createMariaWhatsAppUrl(message?: string) {
  if (!message) {
    return MARIA_WHATSAPP_BASE_URL;
  }

  return `${MARIA_WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
