import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const metalsModuleService: any = req.scope.resolve("metals")
    const storeModule: any = req.scope.resolve(Modules.STORE)
    
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    const dbSettings = stores[0]?.metadata?.metal_settings || {}
    
    // 1. 設定門市的利潤空間
    const storeSettings = {
      gold_sell_margin: dbSettings.gold_sell_margin !== undefined ? Number(dbSettings.gold_sell_margin) : 800,
      gold_buy_margin: dbSettings.gold_buy_margin !== undefined ? Number(dbSettings.gold_buy_margin) : -200,
      k18_buy_price: dbSettings.k18_buy_price !== undefined ? Number(dbSettings.k18_buy_price) : 10590, 
      k14_buy_price: dbSettings.k14_buy_price !== undefined ? Number(dbSettings.k14_buy_price) : 7942,  
      pt_sell_margin: 1500,        
      pt_buy_margin: -500,         
      ag_sell_margin: 40,          
      ag_buy_margin: -20,
      // 🚀 新增：鈀金預設加減價設定
      pd_sell_margin: 1500,
      pd_buy_margin: -500
    }

    const queryDays = req.query?.days as string
    const days = parseInt(queryDays || "7")
    const takeCount = days * 24

    const historyData = await metalsModuleService.listMetalPrices(
      {}, { order: { fetch_timestamp: "DESC" }, take: takeCount }
    )

    if (historyData && historyData.length > 0) {
      const processedData = historyData.map((record: any) => {
        // 強制把資料庫實體轉成「純物件」
        const plainRecord = JSON.parse(JSON.stringify(record))

        // 2. 把各種金屬的原始資料抓出來
        const rawGold = Number(plainRecord.base_gold_twd_qian) || Number(plainRecord.gold_price_qian) || 0
        const rawPt = Number(plainRecord.base_platinum_twd_qian) || Number(plainRecord.platinum_price_qian) || 0
        const rawAg = Number(plainRecord.base_silver_twd_qian) || Number(plainRecord.silver_price_qian) || 0
        // 🚀 新增：抓出剛寫進資料庫的鈀金基礎價
        const rawPd = Number(plainRecord.base_palladium_twd_qian) || Number(plainRecord.palladium_price_qian) || 0

        const storeGoldBuy = rawGold > 0 ? rawGold + storeSettings.gold_buy_margin : 0;

        // 3. 組合資料並回傳給前端
        return {
          ...plainRecord, // 這行會把 base_palladium_twd_qian 等原始資料一起傳給前端
          store_gold_sell: rawGold > 0 ? rawGold + storeSettings.gold_sell_margin : 0,
          store_gold_buy: storeGoldBuy,
          store_18k_buy: storeSettings.k18_buy_price,
          store_14k_buy: storeSettings.k14_buy_price,
          store_platinum_sell: rawPt > 0 ? rawPt + storeSettings.pt_sell_margin : 0,
          store_platinum_buy: rawPt > 0 ? rawPt + storeSettings.pt_buy_margin : 0,
          store_silver_sell: rawAg > 0 ? rawAg + storeSettings.ag_sell_margin : 0,
          store_silver_buy: rawAg > 0 ? rawAg + storeSettings.ag_buy_margin : 0,
          // 🚀 新增：算出鈀金門市的賣出與回收價
          store_palladium_sell: rawPd > 0 ? rawPd + storeSettings.pd_sell_margin : 0,
          store_palladium_buy: rawPd > 0 ? rawPd + storeSettings.pd_buy_margin : 0,
        }
      })

      // 設定這個 API 不被前端死死快取住
      res.setHeader('Cache-Control', 'no-store, max-age=0')
      return res.json({ success: true, data: processedData }) 
    }

    res.status(404).json({ success: false, message: "目前尚無金價紀錄" })
  } catch (error: any) {
    console.error("❌ 金價 API 錯誤:", error)
    res.status(500).json({ success: false, message: "伺服器內部錯誤" })
  }
}