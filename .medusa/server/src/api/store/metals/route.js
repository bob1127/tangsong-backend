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
        const queryDays = req.query?.days;
        const days = parseInt(queryDays || "7");
        const takeCount = days * 24;
        const historyData = await metalsModuleService.listMetalPrices({}, { order: { fetch_timestamp: "DESC" }, take: takeCount });
        if (historyData && historyData.length > 0) {
            const processedData = historyData.map((record) => {
                const plainRecord = JSON.parse(JSON.stringify(record));
                const rawAg = Number(plainRecord.base_silver_twd_qian) || Number(plainRecord.silver_price_qian) || 0;
                const parsePrice = (val) => {
                    if (val === undefined || val === null || val === "")
                        return undefined;
                    return Number(val);
                };
                return {
                    ...plainRecord, // 🚀 這裡會自動把 base_palladium_twd_qian 送出去
                    gold_sell: parsePrice(dbSettings.gold_sell),
                    gold_buy: parsePrice(dbSettings.gold_buy),
                    gold_bullion_buy: parsePrice(dbSettings.gold_bullion_buy),
                    k18_buy: parsePrice(dbSettings.k18_buy),
                    k14_buy: parsePrice(dbSettings.k14_buy),
                    pt950_sell: parsePrice(dbSettings.pt950_sell),
                    pt950_buy: parsePrice(dbSettings.pt950_buy),
                    pd_sell: parsePrice(dbSettings.pd_sell),
                    pd_buy: parsePrice(dbSettings.pd_buy),
                    silver_buy: parsePrice(dbSettings.silver_buy),
                    store_silver_sell: rawAg > 0 ? rawAg + 40 : 0,
                    store_silver_buy: parsePrice(dbSettings.silver_buy) ??
                        (rawAg > 0 ? rawAg - 20 : 0),
                };
            });
            res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
            return res.json({ success: true, data: processedData });
        }
        res.status(404).json({ success: false, message: "目前尚無金價紀錄" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "伺服器內部錯誤" });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21ldGFscy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGtCQXNEQztBQXhERCxxREFBbUQ7QUFFNUMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILE1BQU0sbUJBQW1CLEdBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUQsTUFBTSxXQUFXLEdBQVEsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRXpELE1BQU0sTUFBTSxHQUFHLE1BQU0sV0FBVyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQy9FLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsY0FBYyxJQUFJLEVBQUUsQ0FBQTtRQUU1RCxNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQWMsQ0FBQTtRQUMzQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZDLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7UUFFM0IsTUFBTSxXQUFXLEdBQUcsTUFBTSxtQkFBbUIsQ0FBQyxlQUFlLENBQzNELEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQzVELENBQUE7UUFFRCxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzFDLE1BQU0sYUFBYSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtnQkFDcEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7Z0JBQ3RELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsb0JBQW9CLENBQUMsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUVwRyxNQUFNLFVBQVUsR0FBRyxDQUFDLEdBQVEsRUFBRSxFQUFFO29CQUM5QixJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssRUFBRTt3QkFBRSxPQUFPLFNBQVMsQ0FBQztvQkFDdEUsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLENBQUMsQ0FBQztnQkFFRixPQUFPO29CQUNMLEdBQUcsV0FBVyxFQUFFLHdDQUF3QztvQkFFeEQsU0FBUyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDO29CQUMzQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7b0JBQ3pDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUM7b0JBQ3pELE9BQU8sRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztvQkFDdkMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO29CQUN2QyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7b0JBQzdDLFNBQVMsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQztvQkFDM0MsT0FBTyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO29CQUN2QyxNQUFNLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7b0JBQ3JDLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztvQkFFN0MsaUJBQWlCLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0MsZ0JBQWdCLEVBQ2QsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUM7d0JBQ2pDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvQixDQUFBO1lBQ0gsQ0FBQyxDQUFDLENBQUE7WUFFRixHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFBO1lBQ3RFLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUE7UUFDekQsQ0FBQztRQUNELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDOUQsQ0FBQztBQUNILENBQUMifQ==