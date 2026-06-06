export function mediaUrl(path: string): string {
  if (!path) return path;
  const base = import.meta.env.PUBLIC_MEDIA_BASE_URL;
  if (base && path.startsWith('/uploads/media/')) {
    return `${base.replace(/\/$/, '')}/${path.slice('/uploads/media/'.length)}`;
  }
  return path;
}

export function catalogUrl(categorySlug: string): string {
  return `/katalog-oborudovaniya-vs-forni/${categorySlug}/`;
}

export function groupUrl(categorySlug: string, groupSlug: string): string {
  return `/katalog-oborudovaniya-vs-forni/${categorySlug}/${groupSlug}/`;
}

export function productUrl(astroUri: string): string {
  return `/${astroUri}`;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function siteUrl(path: string, site: URL | string): string {
  const base = typeof site === 'string' ? site : site.href;
  return new URL(path.replace(/^\//, ''), base.endsWith('/') ? base : base + '/').href;
}
