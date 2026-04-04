"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
async function GET(req, res) {
    try {
        // 呼叫我們剛剛建立的 metals 模組服務
        const metalsModuleService = req.scope.resolve("metals");
        // Medusa V2 魔法：使用自動生成的 listMetalPrices 功能
        // 我們設定：依據建立時間 (created_at) 倒序排列，並抓取最近的 30 筆紀錄
        const historyData = await metalsModuleService.listMetalPrices({}, // 這裡可以放篩選條件，留空代表全抓
        {
            order: { created_at: "DESC" },
            take: 30, // 抓取最近 30 筆
        });
        // 成功回傳給前端！
        res.json({
            success: true,
            data: historyData
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "無法取得歷史金價",
            error: error?.message
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL21ldGFscy9oaXN0b3J5L3JvdXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsa0JBMkJDO0FBM0JNLEtBQUssVUFBVSxHQUFHLENBQUMsR0FBUSxFQUFFLEdBQVE7SUFDMUMsSUFBSSxDQUFDO1FBQ0gsd0JBQXdCO1FBQ3hCLE1BQU0sbUJBQW1CLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7UUFFdkQsMENBQTBDO1FBQzFDLDhDQUE4QztRQUM5QyxNQUFNLFdBQVcsR0FBRyxNQUFNLG1CQUFtQixDQUFDLGVBQWUsQ0FDM0QsRUFBRSxFQUFFLG1CQUFtQjtRQUN2QjtZQUNFLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7WUFDN0IsSUFBSSxFQUFFLEVBQUUsRUFBRSxZQUFZO1NBQ3ZCLENBQ0YsQ0FBQTtRQUVELFdBQVc7UUFDWCxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ1AsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUUsV0FBVztTQUNsQixDQUFDLENBQUE7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuQixPQUFPLEVBQUUsS0FBSztZQUNkLE9BQU8sRUFBRSxVQUFVO1lBQ25CLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTztTQUN0QixDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQyJ9