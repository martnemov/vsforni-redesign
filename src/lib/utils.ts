export function mediaUrl(path: string): string {
  if (!path) return path;
  const base = import.meta.env.PUBLIC_MEDIA_BASE_URL;
  if (base && path.startsWith('/uploads/')) {
    let rest: string;
    if (path.startsWith('/uploads/catalog/')) {
      // /uploads/catalog/foo.jpg → catalog/foo.jpg
      rest = path.slice('/uploads/'.length);
    } else {
      // /uploads/img/info-section/1.jpg → info-section/1.jpg
      // /uploads/media/video.mp4 → video.mp4
      rest = path.replace(/^\/uploads\/[^/]+\//, '');
    }
    return `${base.replace(/\/$/, '')}/${rest}`;
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

