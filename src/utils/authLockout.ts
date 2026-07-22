import { logSecurityEventClient } from './securityMonitor';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const STORAGE_KEY = 'osiris_auth_lockout';

interface LockoutState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

export function getLockoutState(): LockoutState {
  if (typeof window === 'undefined') {
    return { failedAttempts: 0, lockoutUntil: null };
  }

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { failedAttempts: 0, lockoutUntil: null };

  try {
    return JSON.parse(data);
  } catch {
    return { failedAttempts: 0, lockoutUntil: null };
  }
}

function saveLockoutState(state: LockoutState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export function isLockedOut(): boolean {
  const state = getLockoutState();
  if (!state.lockoutUntil) return false;

  const now = Date.now();
  if (now > state.lockoutUntil) {
    // Le temps est écoulé, on reset
    saveLockoutState({ failedAttempts: 0, lockoutUntil: null });
    return false;
  }

  return true;
}

export function recordFailedLoginAttempt(username: string) {
  const state = getLockoutState();
  state.failedAttempts += 1;

  if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    state.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    // Loguer l'événement de sécurité (brute force potentielle)
    logSecurityEventClient({
      type: 'AUTH_FAILURE',
      message: `Multiple failed login attempts for user: ${username}`,
      severity: 'high',
      context: 'Client Login Form',
      metadata: { failedAttempts: state.failedAttempts },
    });
  }

  saveLockoutState(state);
  return state;
}

export function resetFailedLoginAttempts() {
  saveLockoutState({ failedAttempts: 0, lockoutUntil: null });
}
