import { logSecurityEventClient } from './securityMonitor';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  // 1. Check size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    logSecurityEventClient({
      type: 'SUSPICIOUS_ACTIVITY',
      message: `File size exceeded limit: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`,
      severity: 'low',
      context: 'File Upload Validation',
    });
    return { isValid: false, error: `La taille du fichier ne doit pas dépasser ${MAX_FILE_SIZE_MB} MB.` };
  }

  // 2. Check MIME type (extension spoofing basic check)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    logSecurityEventClient({
      type: 'SUSPICIOUS_ACTIVITY',
      message: `Invalid MIME type detected: ${file.name} (${file.type})`,
      severity: 'medium',
      context: 'File Upload Validation',
    });
    return { isValid: false, error: `Type de fichier non autorisé. Types acceptés : ${ALLOWED_MIME_TYPES.join(', ')}` };
  }

  return { isValid: true };
}
