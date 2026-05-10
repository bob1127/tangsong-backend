import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    console.log("\n==========================================")
    console.log("🟢 [Store GET] 前端正在請求最新金價資料...")
    
    const metalsModuleService: any = req.scope.resolve("metals")
    const storeModule: any = req.scope.resolve(Modules.STORE)
    
    // 強制從資料庫拉取 Store 實體與 metadata
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    
    // 取得資料庫中的設定
    const dbSettings = stores[0]?.metadata?.metal_settings || {}
    console.log("🔍 [Store GET] 從資料庫解析出的設定:", dbSettings)
    console.log("==========================================\n")

    const queryDays = req.query?.days as string
    const days = parseInt(queryDays || "7")
    const takeCount = days * 24

    const historyData = await metalsModuleService.listMetalPrices(
      {}, { order: { fetch_timestamp: "DESC" }, take: takeCount }
    )

    if (historyData && historyData.length > 0) {
      const processedData = historyData.map((record: any) => {
        const plainRecord = JSON.parse(JSON.stringify(record))
        const rawAg = Number(plainRecord.base_silver_twd_qian) || Number(plainRecord.silver_price_qian) || 0

        // 🚀 防彈級轉換器：確保 0 不會被當成空值，字串能精準轉成數字
        const parsePrice = (val: any) => {
          if (val === undefined || val === null || val === "") return undefined;
          return Number(val);
        };

        return {
          ...plainRecord, 
          gold_sell: parsePrice(dbSettings.gold_sell),
          gold_buy: parsePrice(dbSettings.gold_buy),
          k18_buy: parsePrice(dbSettings.k18_buy),
          k14_buy: parsePrice(dbSettings.k14_buy),
          pt950_sell: parsePrice(dbSettings.pt950_sell),
          pt950_buy: parsePrice(dbSettings.pt950_buy),
          pd_sell: parsePrice(dbSettings.pd_sell),
          pd_buy: parsePrice(dbSettings.pd_buy),
          
          store_silver_sell: rawAg > 0 ? rawAg + 40 : 0,
          store_silver_buy: rawAg > 0 ? rawAg - 20 : 0,
        }
      })

      // 嚴格禁止瀏覽器快取這支 API
      res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate')
      return res.json({ success: true, data: processedData }) 
    }

    res.status(404).json({ success: false, message: "目前尚無金價紀錄" })
  } catch (error: any) {
    console.error("❌ [Store GET] 金價 API 錯誤:", error)
    res.status(500).json({ success: false, message: "伺服器內部錯誤" })
  }
}