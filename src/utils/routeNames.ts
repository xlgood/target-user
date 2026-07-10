export const routeBaseName = (name: unknown): string => {
  const raw = String(name || '')
  return raw.endsWith('-locale') ? raw.slice(0, -'-locale'.length) : raw
}
