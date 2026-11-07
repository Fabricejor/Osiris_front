"use client";

/**
 * Paramètres : profil réel de l'utilisateur connecté (`/auth/me`, rafraîchi par
 * AuthGuard), langue de l'interface et changement de mot de passe.
 *
 * Nom, e-mail et téléphone ne sont pas modifiables ici : seul un administrateur
 * peut les changer (écran Utilisateurs).
 */
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar, CheckCircle2, Globe, KeyRound, Loader2, Lock, Mail, Phone, Shield, User } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AvatarInitiales from '@/components/ui/AvatarInitiales';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/auth.service';
import { ApiError } from '@/services/apiErrors';
import { formatDateHeure } from '@/services/sessions.service';
import type { Language } from '@/store/useLanguageStore';
import type { TranslationKey } from '@/utils/translations';

const ROLE_KEYS: Record<string, TranslationKey> = {
  AGENT_TERRAIN: 'role_agent_terrain',
  VALIDEUR_MEDICAL: 'role_valideur_medical',
  ADMIN: 'role_admin',
  SUPERADMIN: 'role_superadmin',
};

const LONGUEUR_MIN = 12;

function Info({ icon: Icon, label, valeur }: Readonly<{ icon: React.ComponentType<{ className?: string }>; label: string; valeur: React.ReactNode }>) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
        <div className="text-sm font-bold text-gray-900 break-words">{valeur}</div>
      </div>
    </div>
  );
}

function ChangementMotDePasse({ identifiant }: Readonly<{ identifiant: string }>) {
  const { t } = useTranslation();
  const [actuel, setActuel] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const erreur =
    nouveau && nouveau.length < LONGUEUR_MIN ? t('password_min_length')
    : confirmation && nouveau !== confirmation ? t('passwords_mismatch')
    : nouveau && actuel && nouveau === actuel ? t('password_same_as_current')
    : null;
  const pret = Boolean(actuel && nouveau && confirmation) && !erreur;

  const mutation = useMutation({
    mutationFn: () => AuthService.changePassword(identifiant, actuel, nouveau),
    onSuccess: () => {
      toast.success(t('password_changed'));
      setActuel('');
      setNouveau('');
      setConfirmation('');
    },
    onError: (err: Error) =>
      toast.error(err instanceof ApiError && err.status === 401 ? t('wrong_current_password') : err.message),
  });

  const champ = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65b741]/20 focus:border-[#65b741]';
  return (
    <form
      className="grid gap-4 md:grid-cols-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (pret) mutation.mutate();
      }}
    >
      <div className="space-y-1">
        <label htmlFor="mdp-actuel" className="text-xs font-semibold text-gray-600">{t('current_password')}</label>
        <input id="mdp-actuel" type="password" autoComplete="current-password" value={actuel} onChange={(e) => setActuel(e.target.value)} className={champ} />
      </div>
      <div className="space-y-1">
        <label htmlFor="mdp-nouveau" className="text-xs font-semibold text-gray-600">{t('new_password')}</label>
        <input id="mdp-nouveau" type="password" autoComplete="new-password" minLength={LONGUEUR_MIN} value={nouveau} onChange={(e) => setNouveau(e.target.value)} className={champ} />
        <p className="text-[11px] text-gray-400">{t('password_min_length')}</p>
      </div>
      <div className="space-y-1">
        <label htmlFor="mdp-confirmation" className="text-xs font-semibold text-gray-600">{t('confirm_password')}</label>
        <input id="mdp-confirmation" type="password" autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={champ} />
      </div>
      <div className="md:col-span-3 flex items-center justify-end gap-3">
        {erreur && <span className="mr-auto text-sm text-red-600">{erreur}</span>}
        <button
          type="submit"
          disabled={!pret || mutation.isPending}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#65b741] text-white rounded-lg text-sm font-bold hover:bg-[#5aa43a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
          {t('change_password')}
        </button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const nom = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || '';
  const roleKey = user ? ROLE_KEYS[user.role] : undefined;
  const actif = user?.status === 'ACTIF';

  return (
    <div className="h-full flex flex-col p-6 bg-[#f8f9fa] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      <PageHeader title={t("settings")} />

      {!user ? (
        <div className="max-w-5xl w-full mx-auto mt-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {t('profile_load_error')}
        </div>
      ) : (
        <div className="max-w-5xl w-full mx-auto space-y-6 mt-2">
          {/* En-tête du profil */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex items-center gap-6">
            <AvatarInitiales nom={nom} className="w-20 h-20 text-2xl" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{nom}</h1>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {roleKey && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
                    <Shield className="w-3.5 h-3.5" /> {t(roleKey)}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${actif ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> {actif ? t('status_active_user') : t('status_inactive')}
                </span>
              </div>
            </div>
          </div>

          {/* Détails */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t("profile_details")}</h2>
            <p className="text-xs text-gray-500 mb-6">{t('profile_managed_by_admin')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-8">
              <Info icon={User} label={t('full_name')} valeur={nom} />
              <Info icon={Mail} label={t('email_label')} valeur={user.email} />
              <Info icon={Phone} label={t('phone')} valeur={user.phone || <span className="font-normal text-gray-400">{t('not_provided')}</span>} />
              <Info icon={Shield} label={t('role')} valeur={roleKey ? t(roleKey) : user.role} />
              <Info icon={CheckCircle2} label={t('account_status')} valeur={actif ? t('status_active_user') : t('status_inactive')} />
              <Info icon={Calendar} label={t('member_since')} valeur={formatDateHeure(user.createdAt)} />
            </div>
          </div>

          {/* Préférences */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">{t('preferences')}</h2>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <label htmlFor="langue" className="text-sm font-semibold text-gray-700">{t('interface_language')}</label>
              <select
                id="langue"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="ml-2 py-1.5 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#65b741]/20"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Sécurité */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-400" /> {t('security')}
            </h2>
            <ChangementMotDePasse identifiant={user.email} />
          </div>
        </div>
      )}
    </div>
  );
}
