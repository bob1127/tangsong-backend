export function resolveStorePricesUpdatedAt(
  storeMetadata: Record<string, unknown> | null | undefined,
  storeUpdatedAt?: string | Date | null
): string | null {
  const metadata = storeMetadata || {}
  const dbSettings = (metadata.metal_settings || {}) as Record<string, unknown>

  const explicit =
    metadata.metal_settings_updated_at ?? dbSettings.updated_at

  if (typeof explicit === "string" && explicit) {
    return explicit
  }

  const hasStoreSettings = Object.entries(dbSettings).some(
    ([key, value]) =>
      key !== "updated_at" &&
      value !== undefined &&
      value !== null &&
      value !== ""
  )

  if (hasStoreSettings && storeUpdatedAt) {
    const parsed = new Date(storeUpdatedAt)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  return null
}
