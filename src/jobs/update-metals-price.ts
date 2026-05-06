import { Modules } from "@medusajs/framework/utils"

export default async function updateMetalsPrice(container: any) {
  const logger = container.resolve("logger") as any
  const cacheModule = container.resolve(Modules.CACHE)
  
  const metalsModuleService = container.resolve("metals")
  const apiKey = process.env.METALS_API_KEY

  if (!apiKey) return

  try {
    logger.info("🔄 開始向 Metals-API 獲取最新國際盤價...")
    const res = await fetch(`https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=XAU,XPT,XAG,XPD,TWD`)
    const data = await res.json()
    if (!data.success) throw new Error("API 失敗")

    const rawRates = data.rates
    const usdToTwd = rawRates.TWD
    
    // 國際現貨價 (美元 / 金衡盎司)
    const goldOzUsd = 1 / rawRates.XAU
    const platinumOzUsd = 1 / rawRates.XPT
    const silverOzUsd = 1 / rawRates.XAG
    const palladiumOzUsd = rawRates.XPD ? (1 / rawRates.XPD) : null

    // 本地成本基準價 (台幣 / 台錢)
    const goldQian = Math.round((goldOzUsd * usdToTwd) / 8.2944)
    const platQian = Math.round((platinumOzUsd * usdToTwd) / 8.2944)
    const silverQian = Math.round((silverOzUsd * usdToTwd) / 8.2944)
    // 🌟 修復 1：計算鈀金的基準價
    const palladiumQian = palladiumOzUsd ? Math.round((palladiumOzUsd * usdToTwd) / 8.2944) : null

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
      gold_price_qian: goldQian,
      platinum_price_qian: platQian,
      silver_price_qian: silverQian,
      // 🌟 修復 2：寫入快取給前端抓取
      palladium_price_qian: palladiumQian,
    }
    
    // 軌道 1：寫入快取
    await cacheModule.set("latest_metals_price", marketData, 86400)

    // 軌道 2：寫入實體資料庫
    await metalsModuleService.createMetalPrices({
      fetch_timestamp: new Date(),
      raw_rates_data: cleanRates,
      
      spot_gold_usd_oz: goldOzUsd,
      spot_silver_usd_oz: silverOzUsd,
      spot_platinum_usd_oz: platinumOzUsd,
      spot_palladium_usd_oz: palladiumOzUsd,
      
      exchange_rate_usd_twd: usdToTwd,
      
      base_gold_twd_qian: goldQian,
      base_silver_twd_qian: silverQian,
      base_platinum_twd_qian: platQian,
      // 🌟 修復 3：寫入新建立的 DB 欄位
      base_palladium_twd_qian: palladiumQian,
    })

    logger.info(`✅ 金價已更新！快取與資料庫儲存成功 (今日黃金每錢成本: ${goldQian})`)
  } catch (error: any) { 
    logger.error(`❌ 更新失敗: ${error?.message || error}`)
  }
}

export const config = {
  name: "update-metals-price-job",
  schedule: "0 * * * *", 
}