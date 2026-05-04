"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    try {
        const metalsModuleService = req.scope.resolve("metals");
        const storeModule = req.scope.resolve(utils_1.Modules.STORE);
        const stores = await storeModule.listStores({}, { select: ["id", "metadata"] });
        const dbSettings = stores[0]?.metadata?.metal_settings || {};
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
        };
        const queryDays = req.query?.days;
        const days = parseInt(queryDays || "7");
        const takeCount = days * 24;
        const historyData = await metalsModuleService.listMetalPrices({}, { order: { fetch_timestamp: "DESC" }, take: takeCount });
        if (historyData && historyData.length > 0) {
            const processedData = historyData.map((record) => {
                // 強制把資料庫實體轉成「純物件」
                const plainRecord = JSON.parse(JSON.stringify(record));
                // 2. 把各種金屬的原始資料抓出來
                const rawGold = Number(plainRecord.base_gold_twd_qian) || Number(plainRecord.gold_price_qian) || 0;
                const rawPt = Number(plainRecord.base_platinum_twd_qian) || Number(plainRecord.platinum_price_qian) || 0;
                const rawAg = Number(plainRecord.base_silver_twd_qian) || Number(plainRecord.silver_price_qian) || 0;
                // 🚀 新增：抓出剛寫進資料庫的鈀金基礎價
                const rawPd = Number(plainRecord.base_palladium_twd_qian) || Number(plainRecord.palladium_price_qian) || 0;
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
                };
            });
            // 設定這個 API 不被前端死死快取住
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            return res.json({ success: true, data: processedData });
        }
        res.status(404).json({ success: false, message: "目前尚無金價紀錄" });
    }
    catch (error) {
        console.error("❌ 金價 API 錯誤:", error);
        res.status(500).json({ success: false, message: "伺服器內部錯誤" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21ldGFscy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGtCQXdFQztBQTFFRCxxREFBbUQ7QUFFNUMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILE1BQU0sbUJBQW1CLEdBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUQsTUFBTSxXQUFXLEdBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRXpELE1BQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQy9FLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxJQUFJLEVBQUUsQ0FBQTtRQUU1RCxlQUFlO1FBQ2YsTUFBTSxhQUFhLEdBQUc7WUFDcEIsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLGdCQUFnQixLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO1lBQ3ZHLGVBQWUsRUFBRSxVQUFVLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO1lBQ3JHLGFBQWEsRUFBRSxVQUFVLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENB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