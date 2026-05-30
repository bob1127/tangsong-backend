import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import {
  normalizeHeroCarouselPayload,
  resolveHeroCarouselImages,
} from "../../../lib/hero-carousel"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const storeModule: any = req.scope.resolve(Modules.STORE)
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    const store = stores[0]

    if (!store) {
      return res.status(404).json({ error: "找不到商店設定" })
    }

    const configured = store.metadata?.hero_carousel_images
    const images = resolveHeroCarouselImages(configured)

    res.json({
      images,
      configured: Array.isArray(configured) ? configured : [],
    })
  } catch (error: any) {
    console.error("[hero-carousel GET] 失敗:", error?.message || error)
    res.status(500).json({ error: "無法讀取輪播設定", details: error?.message })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const storeModule: any = req.scope.resolve(Modules.STORE)
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    const store = stores[0]

    if (!store) {
      return res.status(404).json({ error: "找不到商店設定" })
    }

    const configured = normalizeHeroCarouselPayload(req.body)
    const updatedMetadata = {
      ...(store.metadata || {}),
      hero_carousel_images: configured,
    }

    await storeModule.updateStores({ id: store.id }, { metadata: updatedMetadata })

    res.json({
      success: true,
      message: "首頁輪播圖已儲存",
      images: resolveHeroCarouselImages(configured),
    })
  } catch (error: any) {
    console.error("[hero-carousel POST] 失敗:", error?.message || error)
    res.status(500).json({ error: "儲存輪播設定失敗", details: error?.message })
  }
}
