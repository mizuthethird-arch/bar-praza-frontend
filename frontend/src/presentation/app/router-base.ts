// The router's base path, from Vite's base URL: '' at the root, '/project' when deployed under a path.
export function routerBasename(baseUrl: string): string {
  return baseUrl.replace(/\/$/, '')
}
