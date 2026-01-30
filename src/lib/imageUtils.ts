/**
 * Utility functions for handling image paths that work in both development and production
 * Vite automatically provides import.meta.env.BASE_URL based on the base config
 */

/**
 * Get the base URL for public assets
 * In development: '/'
 * In production: '/coffee-caffeine-cop/'
 */
export const getBaseUrl = (): string => {
  return import.meta.env.BASE_URL;
};

/**
 * Get a public asset path that works in both dev and production
 * @param path - Path relative to public folder (e.g., 'lovable-uploads/poster.png')
 * @returns Full path with base URL
 */
export const getPublicPath = (path: string): string => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const base = getBaseUrl();
  // Remove trailing slash from base if present, then add path
  const baseClean = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${baseClean}/${cleanPath}`;
};

/**
 * Get icon path for coffee category icons
 */
export const getIconPath = (iconName: string): string => {
  return getPublicPath(`icons/${iconName}`);
};

/**
 * Get lovable uploads path
 */
export const getLovableUploadPath = (filename: string): string => {
  return getPublicPath(`lovable-uploads/${filename}`);
};
