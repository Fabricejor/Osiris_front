import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fonction utilitaire 'cn' pour fusionner les classes Tailwind CSS de manière optimale.
 * Elle combine 'clsx' (pour appliquer des classes conditionnellement) et 'tailwind-merge' 
 * (pour résoudre les conflits de classes, ex: 'p-4 p-2' devient 'p-2').
 * 
 * Très utile lors de la création de composants UI réutilisables.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
