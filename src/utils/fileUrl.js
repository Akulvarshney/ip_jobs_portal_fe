/**
 * Helper utility to normalize and format asset/document URLs
 * (Cloudflare R2, backend proxy endpoints, local storage, external links)
 */
export const getFileUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Cloudflare R2 S3 internal endpoint URL -> convert to backend proxy stream
  if (trimmed.includes('.r2.cloudflarestorage.com/')) {
    const key = trimmed.split('.r2.cloudflarestorage.com/')[1];
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
    return `${baseUrl}/api/upload/file/${key}`;
  }

  // Backend relative proxy path
  if (trimmed.startsWith('/api/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
    return `${baseUrl}${trimmed}`;
  }

  // Direct data URI or blob
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Standard absolute HTTP/HTTPS URL (e.g. Google avatar, external PDF link)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Relative path fallback
  if (trimmed.startsWith('/')) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
    return `${baseUrl}${trimmed}`;
  }

  return trimmed;
};

export default getFileUrl;
