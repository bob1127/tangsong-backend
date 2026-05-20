import { Modules } from "@medusajs/framework/utils"

export default async function updateMetalsPrice(container: any) {
  const logger = container.resolve("logger") as any
  const cacheModule = container.resolve(Modules.CACHE)
  const metalsModuleService = container.resolve("metals")
  const apiKey = process.env.METALS_API_KEY

  if (!apiKey) return

  try {
    const res = await fetch(`https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=XAU,XPT,XAG,XPD,TWD`)
    const data = await res.json()
    if (!data.success) throw new Error("API 失敗")

    const rawRates = data.rates
    const usdToTwd = rawRates.TWD
    
    const goldOzUsd = 1 / rawRates.XAU
    const platinumOzUsd = 1 / rawRates.XPT
    const silverOzUsd = 1 / rawRates.XAG
    const palladiumOzUsd = rawRates.XPD ? (1 / rawRates.XPD) : null

    const goldQian = Math.round((goldOzUsd * usdToTwd) / 8.2944)
    const platQian = Math.round((platinumOzUsd * usdToTwd) / 8.2944)
    const silverQian = Math.round((silverOzUsd * usdToTwd) / 8.2944)
    const palladiumQian = palladiumOzUsd ? Math.round((palladiumOzUsd * usdToTwd) / 8.2944) : null

    const cleanRates = { XAU: rawRates.XAU, XPT: rawRates.XPT, XAG: rawRates.XAG, XPD: rawRates.XPD, TWD: rawRates.TWD }
    const marketData = {
      updated_at: new Date().toISOString(),
      exchange_rate_usd_twd: usdToTwd,
      gold_price_qian: goldQian,
      platinum_price_qian: platQian,
      silver_price_qian: silverQian,
      palladium_price_qian: palladiumQian,
    }
    await cacheModule.set("latest_metals_price", marketData, 86400)

    // 🚀 直球對決：直接寫入實體欄位，名稱跟 Model 保持完全一致
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
      base_palladium_twd_qian: palladiumQian, // 統一叫做 base_palladium_twd_qian
    })

    logger.info(`✅ 金價已更新！(今日鈀金每錢: ${palladiumQian})`)
  } catch (error: any) { 
    logger.error(`❌ 更新失敗: ${error?.message || error}`)
  }
}

export const config = {
  name: "update-metals-price-job",
  schedule: "0 * * * *", // 測試用，測完記得改回 0 * * * *
}