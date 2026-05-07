import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function productSlug(name: string, id: string): string {
  return `${slugify(name)}-${id.toLowerCase()}`;
}

// Extract the Firestore document ID from a slug like "carrier-bag-abc123xyz789abc"
// Firestore IDs are 20 alphanumeric chars and contain no hyphens.
// We store them lowercased, so they appear as the last hyphen-separated segment.
export function idFromSlug(slug: string): string | null {
  if (!slug) return null;
  const parts = slug.split('-');
  const last = parts[parts.length - 1];
  // Firestore auto-IDs are 20 chars of [a-zA-Z0-9]
  if (last && last.length >= 15 && /^[a-z0-9]+$/i.test(last)) return last;
  // Legacy p#### format
  const match = slug.match(/-?(p\d+)$/i);
  return match ? match[1].toUpperCase() : null;
}
