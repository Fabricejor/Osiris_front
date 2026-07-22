import { env } from './env';
import { logger } from './logger';

export interface SecurityEvent {
  type: 'AUTH_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY' | 'CSRF_FAILURE' | 'UNKNOWN';
  message: string;
  severity: 'low' | 'medium' | 'high';
  context?: string;
  source: 'client' | 'server' | 'proxy';
  metadata?: Record<string, unknown>;
}

export async function forwardSecurityEventToWebhook(event: SecurityEvent) {
  logger.warn(`[SECURITY EVENT] ${event.type}: ${event.message}`, event);

  if (!env.SECURITY_WEBHOOK_URL) {
    // Si pas de webhook configuré, on ne fait rien de plus que le log serveur
    return;
  }

  try {
    const payload = {
      content: `🚨 **Alerte de sécurité Osiris** 🚨`,
      embeds: [
        {
          title: `Événement : ${event.type}`,
          description: event.message,
          color: event.severity === 'high' ? 16711680 : event.severity === 'medium' ? 16753920 : 65280,
          fields: [
            { name: 'Gravité', value: event.severity, inline: true },
            { name: 'Source', value: event.source, inline: true },
            { name: 'Contexte', value: event.context || 'N/A', inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await fetch(env.SECURITY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    logger.error('Erreur lors de l\'envoi au webhook de sécurité', error);
  }
}

export async function logSecurityEventClient(event: Omit<SecurityEvent, 'source'>) {
  try {
    await fetch('/api/security/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...event, source: 'client' }),
    });
  } catch (error) {
    logger.error('Impossible d\'envoyer le log de sécurité au serveur', error);
  }
}
