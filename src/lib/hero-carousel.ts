export const DEFAULT_HERO_CAROUSEL_IMAGES = [
  "/images/e48dcfbd-a446-4d95-98e0-1e92f6a16047.png",
  "/images/0001.jpg",
  "/images/18e59f52-18b7-413b-a783-ff21e3c51ad3.png",
  "/images/0002.jpg",
] as const

export const HERO_CAROUSEL_SLOT_COUNT = DEFAULT_HERO_CAROUSEL_IMAGES.length

export function resolveHeroCarouselImages(configured: unknown): string[] {
  const items = Array.isArray(configured) ? configured : []

  return DEFAULT_HERO_CAROUSEL_IMAGES.map((fallback, index) => {
    const url = items[index]
    return typeof url === "string" && url.trim() ? url.trim() : fallback
  })
}

export function normalizeHeroCarouselPayload(body: unknown): string[] {
  const raw = Array.isArray(body)
    ? body
    : typeof body === "object" &&
        body !== null &&
        Array.isArray((body as { images?: unknown }).images)
      ? (body as { images: unknown[] }).images
      : []

  return DEFAULT_HERO_CAROUSEL_IMAGES.map((_, index) => {
    const url = raw[index]
    return typeof url === "string" ? url.trim() : ""
  })
}
