import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const metalsModuleService: any = req.scope.resolve("metals")
    const storeModule: any = req.scope.resolve(Modules.STORE)
    
    const stores = await storeModule.listStores({}, { select: ["id", "metadata"] })
    const dbSettings = stores[0]?.metadata?.metal_settings || {}

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

        const parsePrice = (val: any) => {
          if (val === undefined || val === null || val === "") return undefined;
          return Number(val);
        };

        return {
          ...plainRecord, // 🚀 這裡會自動把 base_palladium_twd_qian 送出去
          
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

      res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate')
      return res.json({ success: true, data: processedData }) 
    }
    res.status(404).json({ success: false, message: "目前尚無金價紀錄" })
  } catch (error: any) {
    res.status(500).json({ success: false, message: "伺服器內部錯誤" })
  } 
}