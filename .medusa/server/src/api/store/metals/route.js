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
        const storeSettings = {
            gold_sell_margin: dbSettings.gold_sell_margin !== undefined ? Number(dbSettings.gold_sell_margin) : 800,
            gold_buy_margin: dbSettings.gold_buy_margin !== undefined ? Number(dbSettings.gold_buy_margin) : -200,
            k18_buy_price: dbSettings.k18_buy_price !== undefined ? Number(dbSettings.k18_buy_price) : 10590,
            k14_buy_price: dbSettings.k14_buy_price !== undefined ? Number(dbSettings.k14_buy_price) : 7942,
            pt_sell_margin: 1500,
            pt_buy_margin: -500,
            ag_sell_margin: 40,
            ag_buy_margin: -20
        };
        const queryDays = req.query?.days;
        const days = parseInt(queryDays || "7");
        const takeCount = days * 24;
        const historyData = await metalsModuleService.listMetalPrices({}, { order: { fetch_timestamp: "DESC" }, take: takeCount });
        if (historyData && historyData.length > 0) {
            const processedData = historyData.map((record) => {
                // 💡 終極修復：強制把資料庫實體轉成「純物件」，這樣自訂的欄位就不會被系統過濾掉了！
                const plainRecord = JSON.parse(JSON.stringify(record));
                // 下面全部改用 plainRecord 來取值
                const rawGold = Number(plainRecord.base_gold_twd_qian) || Number(plainRecord.gold_price_qian) || 0;
                const rawPt = Number(plainRecord.base_platinum_twd_qian) || Number(plainRecord.platinum_price_qian) || 0;
                const rawAg = Number(plainRecord.base_silver_twd_qian) || Number(plainRecord.silver_price_qian) || 0;
                const storeGoldBuy = rawGold + storeSettings.gold_buy_margin;
                // 組合資料並回傳
                return {
                    ...plainRecord,
                    store_gold_sell: rawGold + storeSettings.gold_sell_margin,
                    store_gold_buy: storeGoldBuy,
                    store_18k_buy: storeSettings.k18_buy_price,
                    store_14k_buy: storeSettings.k14_buy_price,
                    store_platinum_sell: rawPt + storeSettings.pt_sell_margin,
                    store_platinum_buy: rawPt + storeSettings.pt_buy_margin,
                    store_silver_sell: rawAg + storeSettings.ag_sell_margin,
                    store_silver_buy: rawAg + storeSettings.ag_buy_margin,
                };
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21ldGFscy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGtCQStEQztBQWpFRCxxREFBbUQ7QUFFNUMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILE1BQU0sbUJBQW1CLEdBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUQsTUFBTSxXQUFXLEdBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRXpELE1BQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQy9FLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxJQUFJLEVBQUUsQ0FBQTtRQUU1RCxNQUFNLGFBQWEsR0FBRztZQUNwQixnQkFBZ0IsRUFBRSxVQUFVLENBQUMsZ0JBQWdCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7WUFDdkcsZUFBZSxFQUFFLFVBQVUsQ0FBQyxlQUFlLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUc7WUFDckcsYUFBYSxFQUFFLFVBQVUsQ0FBQyxhQUFhLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO1lB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