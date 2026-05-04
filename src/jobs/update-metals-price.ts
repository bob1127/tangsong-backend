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
    // 網址參數已經有 XPD (鈀金) 了，非常棒！
    const res = await fetch(`https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=XAU,XPT,XAG,XPD,TWD`)
    const data = await res.json()
    if (!data.success) throw new Error("API 失敗")

    const rawRates = data.rates
    const usdToTwd = rawRates.TWD
    
    // 國際現貨價 (美元 / 金衡盎司)
    const goldOzUsd = 1 / rawRates.XAU
    const platinumOzUsd = 1 / rawRates.XPT
    const silverOzUsd = 1 / rawRates.XAG
    const palladiumOzUsd = rawRates.XPD ? (1 / rawRates.XPD) : 0 // 容錯處理

    // 本地成本基準價 (台幣 / 台錢)
    const goldQian = Math.round((goldOzUsd * usdToTwd) / 8.2944)
    const platQian = Math.round((platinumOzUsd * usdToTwd) / 8.2944)
    const silverQian = Math.round((silverOzUsd * usdToTwd) / 8.2944)
    // 🚀 關鍵補上：算出鈀金的台幣台錢基準價！
    const palladiumQian = palladiumOzUsd > 0 ? Math.round((palladiumOzUsd * usdToTwd) / 8.2944) : 0

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
      palladium_price_qian: palladiumQian, // 🚀 補上：存入快取給前端讀取
    }

    // ==========================================
    // 🚀 雙軌寫入機制啟動
    // ==========================================
    
    // 軌道 1：寫入快取 (給首頁的戰情室看板「秒讀」使用)
    await cacheModule.set("latest_metals_price", marketData, 86400)

    // 軌道 2：寫入實體資料庫 (對應我們剛剛更新的全新資料表結構)
    await metalsModuleService.createMetalPrices({
      fetch_timestamp: new Date(),
      raw_rates_data: cleanRates,            
      
      spot_gold_usd_oz: goldOzUsd,           
      spot_silver_usd_oz: silverOzUsd,
      spot_platinum_usd_oz: platinumOzUsd,
      spot_palladium_usd_oz: palladiumOzUsd, // 現貨價 (你原本已經寫對了)
      
      exchange_rate_usd_twd: usdToTwd,       
      
      base_gold_twd_qian: goldQian,          
      base_silver_twd_qian: silverQian,
      base_platinum_twd_qian: platQian,
      base_palladium_twd_qian: palladiumQian, // 🚀 補上：存進資料庫的欄位！
    })

    logger.info(`✅ 金價已更新！快取與資料庫儲存成功 (今日黃金每錢成本: ${goldQian}, 鈀金: ${palladiumQian})`)
  } catch (error: any) { 
    logger.error(`❌ 更新失敗: ${error?.message || error}`)
  }
}

export const config = {
  name: "update-metals-price-job",
  // ⚠️ 為了測試，我們先改回每分鐘執行一次。
  // 成功看到終端機印出綠字後，請務必記得改回 "0 * * * *" 喔！
  schedule: "* * * * *", 
}