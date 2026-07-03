import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getPrimaryStore } from "../../../lib/get-primary-store"
import { resolveStorePricesUpdatedAt } from "../../../lib/metal-settings"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const store = await getPrimaryStore(req.scope)

    if (!store) {
      return res.status(404).json({ success: false, message: "找不到商店設定" })
    }

    const storeMetadata = (store.metadata || {}) as Record<string, unknown>
    const settings = storeMetadata.metal_settings || {}
    const updatedAt = resolveStorePricesUpdatedAt(
      storeMetadata,
      store.updated_at
    )

    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate")
    res.json({
      success: true,
      settings,
      updated_at: updatedAt,
      store_prices_updated_at: updatedAt,
    })
  } catch (error: any) {
    console.error("[store/metal-settings GET] 失敗:", error?.message || error)
    res.status(500).json({
      success: false,
      message: "無法讀取牌告價設定",
      details: error?.message,
    })
  }
}
