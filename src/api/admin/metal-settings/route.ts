import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const storeModule: any = req.scope.resolve(Modules.STORE)
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    const store = stores[0]

    res.json({ settings: store?.metadata?.metal_settings || {} })
  } catch (error) {
    res.status(500).json({ error: "無法讀取設定" })
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    console.log("\n🚀 [Admin POST] 開始執行儲存程序...")
    const payloadSettings = req.body
    console.log("📦 1. 收到老闆傳來的新設定:", payloadSettings)

    const storeModule: any = req.scope.resolve(Modules.STORE)
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    const store = stores[0]
    console.log("🏪 2. 找到商店實體 ID:", store.id)

    const updatedMetadata = {
      ...(store.metadata || {}),
      metal_settings: payloadSettings
    }
    console.log("📝 3. 準備寫入的新 Metadata:", updatedMetadata)

    // 💡 終極防呆語法：把 ID 包成物件 { id: store.id }，確保資料庫絕對看得懂！
    await storeModule.updateStores(
      { id: store.id }, 
      { metadata: updatedMetadata }
    )

    console.log("✅ 4. 儲存成功！\n")
    res.json({ success: true, message: "金價設定已成功儲存至資料庫" })

  } catch (error: any) {
    // 💡 終極除錯雷達：如果真的還錯，這裡會印出最真實的兇手！
    console.error("\n🔥 [致命錯誤] 儲存設定失敗！")
    console.error("錯誤訊息:", error.message)
    console.error("錯誤細節:", error)
    console.error("------------------------\n")
    
    res.status(500).json({ error: "儲存設定失敗", details: error.message })
  }
}