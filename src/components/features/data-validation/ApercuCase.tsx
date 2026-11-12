"use client";

/**
 * Gros plan d'une case de la photo, affiché juste au-dessus de sa saisie : le
 * valideur compare sans quitter la valeur des yeux. Simple recadrage CSS de la
 * photo déjà chargée (aucun appel serveur) ; la case est entourée, avec un peu
 * de contexte autour (cases voisines) pour s'y retrouver si la zone est
 * légèrement décalée.
 */
import React from 'react';
import type { ZoneImage } from '@/services/validation-mapping';

export interface ImagePage {
  src: string;
  /** Dimensions naturelles (px) de la photo. */
  w: number;
  h: number;
}

interface ApercuCaseProps {
  image: ImagePage | null;
  /** Zone de la case, [ymin, xmin, ymax, xmax] en 0..1000. */
  zone: ZoneImage | null;
  /** true si `zone` est une case ; false si ce n'est que la ligne entière. */
  estCase: boolean;
  libelle: string;
  language: string;
}

const HAUTEUR_MAX_PX = 150;

/** Zone élargie autour de la case (contexte), bornée à l'image. */
function avecContexte([ymin, xmin, ymax, xmax]: ZoneImage, estCase: boolean): ZoneImage {
  const margeX = estCase ? Math.max(20, (xmax - xmin) * 0.6) : 5;
  const margeY = Math.max(10, (ymax - ymin) * 0.8);
  return [
    Math.max(0, ymin - margeY),
    Math.max(0, xmin - margeX),
    Math.min(1000, ymax + margeY),
    Math.min(1000, xmax + margeX),
  ];
}

export default function ApercuCase({ image, zone, estCase, libelle, language }: Readonly<ApercuCaseProps>) {
  const fr = language === 'fr';
  if (!image || !zone) return null;

  const cadre = avecContexte(zone, estCase);
  const [cy0, cx0, cy1, cx1] = cadre;
  const fw = (cx1 - cx0) / 1000;
  const fh = (cy1 - cy0) / 1000;
  if (fw <= 0 || fh <= 0) return null;
  // Proportions réelles (px) du cadre : la photo n'est jamais déformée.
  const ratio = (fw * image.w) / (fh * image.h);
  const pct = (v: number) => `${v * 100}%`;

  return (
    <figure className="mb-3">
      <div
        className="relative overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
        style={{ aspectRatio: ratio, width: `min(100%, ${Math.round(HAUTEUR_MAX_PX * ratio)}px)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URL présignée MinIO éphémère, recadrage CSS */}
        <img
          src={image.src}
          alt={fr ? `Photo : ${libelle}` : `Photo: ${libelle}`}
          draggable={false}
          className="pointer-events-none absolute max-w-none select-none"
          style={{
            width: pct(1 / fw),
            height: pct(1 / fh),
            left: pct(-(cx0 / 1000) / fw),
            top: pct(-(cy0 / 1000) / fh),
          }}
        />
        <div
          className="pointer-events-none absolute rounded-sm border-2 border-amber-500 shadow-[0_0_0_9999px_rgba(255,255,255,0.35)]"
          style={{
            left: pct((zone[1] - cx0) / (cx1 - cx0)),
            top: pct((zone[0] - cy0) / (cy1 - cy0)),
            width: pct((zone[3] - zone[1]) / (cx1 - cx0)),
            height: pct((zone[2] - zone[0]) / (cy1 - cy0)),
          }}
        />
      </div>
      {!estCase && (
        <figcaption className="mt-1 text-[11px] text-gray-400">
          {fr
            ? "Ligne entière : la position des colonnes n'est pas connue pour cette page (relancer l'OCR pour l'obtenir)."
            : 'Whole row: column positions are unknown for this page (re-run OCR to get them).'}
        </figcaption>
      )}
    </figure>
  );
}
