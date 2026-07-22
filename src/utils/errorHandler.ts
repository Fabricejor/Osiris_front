import { logger } from './logger';
import { env } from './env';

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isOperational?: boolean;
}

export function logError(error: unknown, context: string = 'Application') {
  if (error instanceof Error) {
    logger.error(`[${context}] ${error.message}`, error.stack);
  } else {
    logger.error(`[${context}] An unknown error occurred`, error);
  }
}

export function getSafeErrorMessage(error: unknown, fallbackMessage = 'Une erreur inattendue est survenue'): string {
  // En dev, on peut renvoyer plus de détails
  if (env.isDevelopment && error instanceof Error) {
    return error.message;
  }

  // En prod, on filtre pour éviter de fuiter des infos sensibles
  if (error instanceof Error) {
    const appError = error as AppError;
    if (appError.isOperational) {
      return appError.message;
    }
  }

  return fallbackMessage;
}
