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
        const res = await fetch(`https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=XAU,XPT,XAG,XPD,TWD`);
        const data = await res.json();
        if (!data.success)
            throw new Error("API 失敗");
        const rawRates = data.rates;
        const usdToTwd = rawRates.TWD;
        const goldOzUsd = 1 / rawRates.XAU;
        const platinumOzUsd = 1 / rawRates.XPT;
        const silverOzUsd = 1 / rawRates.XAG;
        const palladiumOzUsd = rawRates.XPD ? (1 / rawRates.XPD) : null;
        const goldQian = Math.round((goldOzUsd * usdToTwd) / 8.2944);
        const platQian = Math.round((platinumOzUsd * usdToTwd) / 8.2944);
        const silverQian = Math.round((silverOzUsd * usdToTwd) / 8.2944);
        const palladiumQian = palladiumOzUsd ? Math.round((palladiumOzUsd * usdToTwd) / 8.2944) : null;
        const cleanRates = { XAU: rawRates.XAU, XPT: rawRates.XPT, XAG: rawRates.XAG, XPD: rawRates.XPD, TWD: rawRates.TWD };
        const marketData = {
            updated_at: new Date().toISOString(),
            exchange_rate_usd_twd: usdToTwd,
            gold_price_qian: goldQian,
            platinum_price_qian: platQian,
            silver_price_qian: silverQian,
            palladium_price_qian: palladiumQian,
        };
        await cacheModule.set("latest_metals_price", marketData, 86400);
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
        });
        logger.info(`✅ 金價已更新！(今日鈀金每錢: ${palladiumQian})`);
    }
    catch (error) {
        logger.error(`❌ 更新失敗: ${error?.message || error}`);
    }
}
exports.config = {
    name: "update-metals-price-job",
    schedule: "0 * * * *", // 測試用，測完記得改回 0 * * * *
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlLW1ldGFscy1wcmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9qb2JzL3VwZGF0ZS1tZXRhbHMtcHJpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsb0NBd0RDO0FBMURELHFEQUFtRDtBQUVwQyxLQUFLLFVBQVUsaUJBQWlCLENBQUMsU0FBYztJQUM1RCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBUSxDQUFBO0lBQ2pELE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3BELE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUN2RCxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQTtJQUV6QyxJQUFJLENBQUMsTUFBTTtRQUFFLE9BQU07SUFFbkIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsZ0RBQWdELE1BQU0sdUNBQXVDLENBQUMsQ0FBQTtRQUN0SCxNQUFNLElBQUksR0FBRyxNQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBRTVDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7UUFDM0IsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQTtRQUU3QixNQUFNLFNBQVMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQTtRQUNsQyxNQUFNLGFBQWEsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQTtRQUN0QyxNQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FB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