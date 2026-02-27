/**
 * URL base del API.
 * Local: http://localhost:4000
 * Producción: https://zapato-flex-back.vercel.app
 * Se puede sobreescribir con VITE_API_BASE_URL en .env
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (import.meta.env.DEV ? 'http://localhost:4000' : 'https://zapato-flex-back.vercel.app')
