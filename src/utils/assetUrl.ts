/**
 * Build a URL for a file served out of `public/`.
 *
 * Hard-coded absolute paths ("/foo.jpg") break whenever the app is not served
 * from the domain root — e.g. GitHub Pages, which serves it from
 * /coopering_app/. BASE_URL is baked in at build time ('/' for native builds,
 * '/coopering_app/' for the Pages build).
 */
export function assetUrl(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
