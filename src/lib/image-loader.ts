export const supabaseLoader = ({ src, width, quality }: { src: string, width: number, quality?: number }) => {
  // If no source, return placeholder
  if (!src) return '/images/placeholder.jpg';

  // If it's already an optimized Next.js path or local, skip
  if (src.startsWith('/') || src.startsWith('_next')) return src;

  // Force transformation for Supabase URLs
  if (src.includes('supabase.co')) {
    const url = new URL(src);
    // This part transforms the URL from a "fetch" link to a "resize" link
    url.pathname = url.pathname.replace('/object/public/', '/render/image/public/');
    url.searchParams.set('width', width.toString());
    url.searchParams.set('quality', (quality || 75).toString());
    return url.toString();
  }

  return src;
};