"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const utils_1 = require("@medusajs/framework/utils");
async function GET(req, res) {
    try {
        const cacheModule = req.scope.resolve(utils_1.Modules.CACHE);
        const metalsModuleService = req.scope.resolve("metals");
        // 1. 優先從「快取」拿資料 (速度最快)
        // ⚠️ 注意：如果你之前有舊結構的快取，這裡可能會拿到 undefined 的 gold_price_qian，
        // 所以我們在重啟開發伺服器時，最好能確保快取是乾淨的，或是在開發階段暫時跳過快取。
        const cachedData = await cacheModule.get("latest_metals_price");
        if (cachedData && cachedData.base_gold_twd_qian) {
            // 確認快取裡有「新」的欄位名稱才回傳
            return res.json({ success: true, data: cachedData });
        }
        // 2. 改從「資料庫」撈最新的一筆
        const historyData = await metalsModuleService.listMetalPrices({}, {
            order: { fetch_timestamp: "DESC" }, // 換成我們新定義的 fetch_timestamp
            take: 1,
        });
        if (historyData && historyData.length > 0) {
            const dbRecord = historyData[0];
            // ✅ 重點：這裡必須使用我們剛剛建好的「全新欄位名稱」
            const marketData = {
                fetch_timestamp: dbRecord.fetch_timestamp,
                exchange_rate_usd_twd: dbRecord.exchange_rate_usd_twd,
                // 台灣銀樓牌告基準價 (台錢)
                base_gold_twd_qian: dbRecord.base_gold_twd_qian,
                base_platinum_twd_qian: dbRecord.base_platinum_twd_qian,
                base_silver_twd_qian: dbRecord.base_silver_twd_qian,
                // 國際現貨價 (美金/盎司)，順便傳給前端備用
                spot_gold_usd_oz: dbRecord.spot_gold_usd_oz,
                spot_platinum_usd_oz: dbRecord.spot_platinum_usd_oz,
                spot_silver_usd_oz: dbRecord.spot_silver_usd_oz,
            };
            // 將最新的結構存入快取
            await cacheModule.set("latest_metals_price", marketData, 3600);
            return res.json({ success: true, data: marketData });
        }
        // 3. 如果資料庫真的沒東西
        res.status(404).json({ success: false, message: "目前尚無金價紀錄，請等待排程更新" });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "伺服器內部錯誤",
            error: error?.message
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21ldGFscy9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLGtCQTJEQztBQTlERCxxREFBbUQ7QUFHNUMsS0FBSyxVQUFVLEdBQUcsQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQy9ELElBQUksQ0FBQztRQUNILE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNwRCxNQUFNLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBRXZELHVCQUF1QjtRQUN2QiwwREFBMEQ7UUFDMUQsMkNBQTJDO1FBQzNDLE1BQU0sVUFBVSxHQUFHLE1BQU0sV0FBVyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1FBRS9ELElBQUksVUFBVSxJQUFLLFVBQWtCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUN6RCxvQkFBb0I7WUFDcEIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQTtRQUN0RCxDQUFDO1FBRUQsbUJBQW1CO1FBQ25CLE1BQU0sV0FBVyxHQUFHLE1BQU0sbUJBQW1CLENBQUMsZUFBZSxDQUMzRCxFQUFFLEVBQ0Y7WUFDRSxLQUFLLEVBQUUsRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLEVBQUUsMkJBQTJCO1lBQy9ELElBQUksRUFBRSxDQUFDO1NBQ1IsQ0FDRixDQUFBO1FBRUQsSUFBSSxXQUFXLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFFL0IsNkJBQTZCO1lBQzdCLE1BQU0sVUFBVSxHQUFHO2dCQUNqQixlQUFlLEVBQUUsUUFBUSxDQUFDLGVBQWU7Z0JBQ3pDLHFCQUFxQixFQUFFLFFBQVEsQ0FBQyxxQkFBcUI7Z0JBRXJELGlCQUFpQjtnQkFDakIsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLGtCQUFrQjtnQkFDL0Msc0JBQXNCLEVBQUUsUUFBUSxDQUFDLHNCQUFzQjtnQkFDdkQsb0JBQW9CLEVBQUUsUUFBUSxDQUFDLG9CQUFvQjtnQkFFbkQseUJBQXlCO2dCQUN6QixnQkFBZ0IsRUFBRSxRQUFRLENBQUMsZ0JBQWdCO2dCQUMzQyxvQkFBb0IsRUFBRSxRQUFRLENBQUMsb0JBQW9CO2dCQUNuRCxrQkFBa0IsRUFBRSxRQUFRLENBQUMsa0JBQWtCO2FBQ2hELENBQUE7WUFFRCxhQUFhO1lBQ2IsTUFBTSxXQUFXLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUU5RCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO1FBQ3RELENBQUM7UUFFRCxnQkFBZ0I7UUFDaEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxDQUFDLENBQUE7SUFFdkUsQ0FBQztJQUFDLE9BQU8sS0FBVSxFQUFFLENBQUM7UUFDcEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDbkIsT0FBTyxFQUFFLEtBQUs7WUFDZCxPQUFPLEVBQUUsU0FBUztZQUNsQixLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU87U0FDdEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztBQUNILENBQUMifQ==