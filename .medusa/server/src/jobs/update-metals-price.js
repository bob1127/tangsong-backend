"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = updateMetalsPrice;
const utils_1 = require("@medusajs/framework/utils");
async function updateMetalsPrice(container) {
    const logger = container.resolve("logger");
    const cacheModule = container.resolve(utils_1.Modules.CACHE);
    const metalsModuleService = container.resolve("metals");
    const apiKey = process.env.METALS_API_KEY;
    if (!apiKey)
        return;
    try {
        logger.info("🔄 開始向 Metals-API 獲取最新國際盤價...");
        const res = await fetch(`https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=XAU,XPT,XAG,XPD,TWD`);
        const data = await res.json();
        if (!data.success)
            throw new Error("API 失敗");
        const rawRates = data.rates;
        const usdToTwd = rawRates.TWD;
        // 國際現貨價 (美元 / 金衡盎司)
        const goldOzUsd = 1 / rawRates.XAU;
        const platinumOzUsd = 1 / rawRates.XPT;
        const silverOzUsd = 1 / rawRates.XAG;
        const palladiumOzUsd = rawRates.XPD ? (1 / rawRates.XPD) : null;
        // 本地成本基準價 (台幣 / 台錢)
        const goldQian = Math.round((goldOzUsd * usdToTwd) / 8.2944);
        const platQian = Math.round((platinumOzUsd * usdToTwd) / 8.2944);
        const silverQian = Math.round((silverOzUsd * usdToTwd) / 8.2944);
        // 🌟 修復 1：計算鈀金的基準價
        const palladiumQian = palladiumOzUsd ? Math.round((palladiumOzUsd * usdToTwd) / 8.2944) : null;
        const cleanRates = {
            XAU: rawRates.XAU,
            XPT: rawRates.XPT,
            XAG: rawRates.XAG,
            XPD: rawRates.XPD,
            TWD: rawRates.TWD
        };
        const marketData = {
            updated_at: new Date().toISOString(),
            exchange_rate_usd_twd: usdToTwd,
            gold_price_qian: goldQian,
            platinum_price_qian: platQian,
            silver_price_qian: silverQian,
            // 🌟 修復 2：寫入快取給前端抓取
            palladium_price_qian: palladiumQian,
        };
        // 軌道 1：寫入快取
        await cacheModule.set("latest_metals_price", marketData, 86400);
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
        });
        logger.info(`✅ 金價已更新！快取與資料庫儲存成功 (今日黃金每錢成本: ${goldQian})`);
    }
    catch (error) {
        logger.error(`❌ 更新失敗: ${error?.message || error}`);
    }
}
exports.config = {
    name: "update-metals-price-job",
    schedule: "0 * * * *",
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLW1ldGFscy1wcmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9qb2JzL3VwZGF0ZS1tZXRhbHMtcHJpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsb0NBMkVDO0FBN0VELHFEQUFtRDtBQUVwQyxLQUFLLFVBQVUsaUJBQWlCLENBQUMsU0FBYztJQUM1RCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBUSxDQUFBO0lBQ2pELE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRXBELE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN2RCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQTtJQUV6QyxJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU07SUFFbkIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO1FBQzVDLE1BQU0sR0FBRyxHQUFHLE1BQU0sS0FBSyxDQUFDLGdEQUFnRCxNQUFNLHVDQUF1QyxDQUFDLENBQUE7UUFDdEgsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDN0IsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUU1QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1FBQzNCLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUE7UUFFN0Isb0JBQW9CO1FBQ3BCLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFBO1FBQ2xDLE1BQU0sYUFBYSxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsR0FB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