import { Modules } from "@medusajs/framework/utils"

export default async function updateMetalsPrice(container: any) {
  const logger = container.resolve("logger") as any
  const cacheModule = container.resolve(Modules.CACHE)
  
  // 🌟 呼叫我們剛剛建立的 metals 模組服務
  const metalsModuleService = container.resolve("metals")
  
  const apiKey = process.env.METALS_API_KEY

  if (!apiKey) return

  try {
    logger.info("🔄 開始向 Metals-API 獲取最新國際盤價...")
    // 網址參數補上了 XPD (鈀金)
    const res = await fetch(`https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=XAU,XPT,XAG,XPD,TWD`)
    const data = await res.json()
    if (!data.success) throw new Error("API 失敗")

    const rawRates = data.rates
    const usdToTwd = rawRates.TWD
    
    // 國際現貨價 (美元 / 金衡盎司)
    const goldOzUsd = 1 / rawRates.XAU
    const platinumOzUsd = 1 / rawRates.XPT
    const silverOzUsd = 1 / rawRates.XAG
    const palladiumOzUsd = rawRates.XPD ? (1 / rawRates.XPD) : null // 容錯處理

    // 本地成本基準價 (台幣 / 台錢)
    const goldQian = Math.round((goldOzUsd * usdToTwd) / 8.2944)
    const platQian = Math.round((platinumOzUsd * usdToTwd) / 8.2944)
    const silverQian = Math.round((silverOzUsd * usdToTwd) / 8.2944)

    // 瘦身後的 JSON，避免 Supabase 空間爆掉
    const cleanRates = {
      XAU: rawRates.XAU,
      XPT: rawRates.XPT,
      XAG: rawRates.XAG,
      XPD: rawRates.XPD,
      TWD: rawRates.TWD
    }

    const marketData = {
      updated_at: new Date().toISOString(),
      exchange_rate_usd_twd: usdToTwd,
      // 為了相容你原本首頁的戰情室看板，這三個快取欄位名稱保持不變
      gold_price_qian: goldQian,
      platinum_price_qian: platQian,
      silver_price_qian: silverQian,
    }

    // ==========================================
    // 🚀 雙軌寫入機制啟動
    // ==========================================
    
    // 軌道 1：寫入快取 (給首頁的戰情室看板「秒讀」使用)
    await cacheModule.set("latest_metals_price", marketData, 86400)

    // 軌道 2：寫入實體資料庫 (對應我們剛剛更新的全新資料表結構)
    await metalsModuleService.createMetalPrices({
      fetch_timestamp: new Date(),
      raw_rates_data: cleanRates,            // 只存 5 筆過濾後的 JSON，非常省空間
      
      spot_gold_usd_oz: goldOzUsd,           // 存入國際現貨價
      spot_silver_usd_oz: silverOzUsd,
      spot_platinum_usd_oz: platinumOzUsd,
      spot_palladium_usd_oz: palladiumOzUsd, // 存入鈀金現貨價
      
      exchange_rate_usd_twd: usdToTwd,       // 存入即時匯率
      
      base_gold_twd_qian: goldQian,          // 存入換算後的本地基準價
      base_silver_twd_qian: silverQian,
      base_platinum_twd_qian: platQian,
    })

    logger.info(`✅ 金價已更新！快取與資料庫儲存成功 (今日黃金每錢成本: ${goldQian})`)
  } catch (error: any) { 
    logger.error(`❌ 更新失敗: ${error?.message || error}`)
  }
}

export const config = {
  name: "update-metals-price-job",
  // ⚠️ 為了測試，我們先改回每分鐘執行一次。
  // 成功看到終端機印出綠字後，請務必記得改回 "0 * * * *" 喔！
  schedule: "0 * * * *", 
}