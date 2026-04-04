import { Modules } from "@medusajs/framework/utils"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const cacheModule = req.scope.resolve(Modules.CACHE)
    const metalsModuleService = req.scope.resolve("metals")
    
    // 1. 優先從「快取」拿資料 (速度最快)
    // ⚠️ 注意：如果你之前有舊結構的快取，這裡可能會拿到 undefined 的 gold_price_qian，
    // 所以我們在重啟開發伺服器時，最好能確保快取是乾淨的，或是在開發階段暫時跳過快取。
    const cachedData = await cacheModule.get("latest_metals_price")
    
    if (cachedData && (cachedData as any).base_gold_twd_qian) {
      // 確認快取裡有「新」的欄位名稱才回傳
      return res.json({ success: true, data: cachedData })
    }

    // 2. 改從「資料庫」撈最新的一筆
    const historyData = await metalsModuleService.listMetalPrices(
      {}, 
      {
        order: { fetch_timestamp: "DESC" }, // 換成我們新定義的 fetch_timestamp
        take: 1, 
      }
    )

    if (historyData && historyData.length > 0) {
      const dbRecord = historyData[0]
      
      // ✅ 重點：這裡必須使用我們剛剛建好的「全新欄位名稱」
      const marketData = {
        fetch_timestamp: dbRecord.fetch_timestamp,
        exchange_rate_usd_twd: dbRecord.exchange_rate_usd_twd,
        
        // 台灣銀樓牌告基準價 (台錢)
        base_gold_twd_qian: dbRecord.base_gold_twd_qian,
        base_platinum_twd_qian: dbRecord.base_platinum_twd_qian,
        base_silver_twd_qian: dbRecord.base_silver_twd_qian,
        
        // 國際現貨價 (美金/盎司)，順便傳給前端備用
        spot_gold_usd_oz: dbRecord.spot_gold_usd_oz,
        spot_platinum_usd_oz: dbRecord.spot_platinum_usd_oz,
        spot_silver_usd_oz: dbRecord.spot_silver_usd_oz,
      }

      // 將最新的結構存入快取
      await cacheModule.set("latest_metals_price", marketData, 3600)

      return res.json({ success: true, data: marketData })
    }

    // 3. 如果資料庫真的沒東西
    res.status(404).json({ success: false, message: "目前尚無金價紀錄，請等待排程更新" })

  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: "伺服器內部錯誤",
      error: error?.message 
    })
  }
}