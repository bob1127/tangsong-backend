import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { resolveHeroCarouselImages } from "../../../lib/hero-carousel"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const storeModule: any = req.scope.resolve(Modules.STORE)
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    const store = stores[0]
    const configured = store?.metadata?.hero_carousel_images
    const images = resolveHeroCarouselImages(configured)

    res.setHeader("Cache-Control", "no-store, max-age=0, must-revalidate")
    res.json({
      success: true,
      images,
    })
  } catch (error: any) {
    console.error("[store/hero-carousel GET] 失敗:", error?.message || error)
    res.status(500).json({ error: "無法讀取輪播設定", details: error?.message })
  }
}
