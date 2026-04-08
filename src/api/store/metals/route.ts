import { Modules } from "@medusajs/framework/utils"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const metalsModuleService = req.scope.resolve("metals")
    
    const queryDays = req.query?.days as string
    const days = parseInt(queryDays || "7")
    const takeCount = days * 24

    // 💡 [除錯雷達] 印在你的 VS Code 後端終端機
    console.log(`\n🔍 [金價 API] 收到請求: 準備抓取近 ${days} 天，最多 ${takeCount} 筆資料...`)

    // 暫時完全跳過 Cache，直接對決資料庫
    const historyData = await metalsModuleService.listMetalPrices(
      {}, 
      {
        order: { fetch_timestamp: "DESC" }, 
        take: takeCount, 
      }
    )

    // 💡 [除錯雷達] 看看資料庫到底給了幾筆
    console.log(`✅ [金價 API] 從資料庫實際撈出: ${historyData?.length || 0} 筆資料！\n`)

    if (historyData && historyData.length > 0) {
      // 為了避免瀏覽器偷偷快取，我們在 Header 加上禁止快取的指令
      res.setHeader('Cache-Control', 'no-store, max-age=0')
      return res.json({ success: true, data: historyData })
    }

    res.status(404).json({ success: false, message: "目前尚無金價紀錄" })

  } catch (error: any) {
    console.error("❌ 金價 API 錯誤:", error)
    res.status(500).json({ 
      success: false, 
      message: "伺服器內部錯誤",
      error: error?.message 
    })
  }
}