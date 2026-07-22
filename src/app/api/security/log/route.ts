import { NextRequest, NextResponse } from 'next/server';
import { forwardSecurityEventToWebhook, SecurityEvent } from '@/utils/securityMonitor';
import { logError, getSafeErrorMessage } from '@/utils/errorHandler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const sanitizedType = sanitizeString(body?.type) as SecurityEvent['type'] | undefined;
    const event: SecurityEvent = {
      type: sanitizedType ?? 'UNKNOWN',
      message: sanitizeString(body?.message) || 'Événement de sécurité',
      severity: sanitizeSeverity(body?.severity),
      context: sanitizeString(body?.context),
      source: sanitizeSource(body?.source),
      metadata: sanitizeMetadata(body?.metadata),
    };

    await forwardSecurityEventToWebhook(event);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'Security log route');
    return NextResponse.json(
      { error: getSafeErrorMessage(error, 'Impossible d\'enregistrer l\'événement') },
      { status: 500 }
    );
  }
}

function sanitizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  return value.slice(0, 500);
}

function sanitizeSeverity(value: unknown): SecurityEvent['severity'] {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return 'medium';
}

function sanitizeSource(value: unknown): SecurityEvent['source'] {
  if (value === 'client' || value === 'server' || value === 'proxy') {
    return value;
  }
  return 'client';
}

function sanitizeMetadata(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const result: Record<string, unknown> = {};

  Object.entries(value as Record<string, unknown>).forEach(([key, val]) => {
    if (typeof key !== 'string' || key.length > 100) {
      return;
    }

    if (typeof val === 'object' && val !== null) {
      result[key] = sanitizeMetadata(val as Record<string, unknown>) ?? null;
    } else if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      result[key] = val;
    }
  });

  return result;
}
