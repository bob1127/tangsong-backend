"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetalPrice = void 0;
const utils_1 = require("@medusajs/framework/utils");
// 定義一個名為 "metal_price" 的資料表，作為每次打 API 的行情快照
exports.MetalPrice = utils_1.model.define("metal_price", {
    id: utils_1.model.id().primaryKey(), // 自動生成的唯一 ID
    // ==========================================
    // 1. API 原始紀錄層
    // ==========================================
    fetch_timestamp: utils_1.model.dateTime(), // 紀錄 API 抓取的時間點
    raw_rates_data: utils_1.model.json(), // 【重點】這裡只存「過濾後」的輕量 JSON (約 5~10 筆)，避免塞爆 Supabase 空間
    // ==========================================
    // 2. 國際現貨層 (單位：USD / 金衡盎司 oz)
    // 對應 Metals-API 的 USDXAU, USDXAG, USDXPT, USDXPD
    // ==========================================
    spot_gold_usd_oz: utils_1.model.number(), // 國際黃金現貨價 
    spot_silver_usd_oz: utils_1.model.number(), // 國際白銀現貨價
    spot_platinum_usd_oz: utils_1.model.number(), // 國際白金現貨價
    spot_palladium_usd_oz: utils_1.model.number().nullable(), // 國際鈀金現貨價 (設為可選)
    // ==========================================
    // 3. 匯率層
    // ==========================================
    exchange_rate_usd_twd: utils_1.model.number(), // 當時的美金兌台幣即時匯率
    // ==========================================
    // 4. 台灣銀樓換算基準層 (單位：TWD / 台錢)
    // 這是提供給前端 Next.js 畫面最直接需要的「本地成本價」
    // ==========================================
    base_gold_twd_qian: utils_1.model.number(), // 黃金本地基準價 (每錢)
    base_silver_twd_qian: utils_1.model.number(), // 白銀本地基準價 (每錢)
    base_platinum_twd_qian: utils_1.model.number(), // 白金本地基準價 (每錢)
    // 🚀 關鍵修復：幫鈀金開一個專屬欄位！
    base_palladium_twd_qian: utils_1.model.number().nullable(), // 鈀金本地基準價 (每錢)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWwtcHJpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZXRhbHMvbW9kZWxzL21ldGFsLXByaWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFpRDtBQUVqRCw0Q0FBNEM7QUFDL0IsUUFBQSxVQUFVLEdBQUcsYUFBSyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUU7SUFDcEQsRUFBRSxFQUFFLGFBQUssQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBb0IsYUFBYTtJQUU1RCw2Q0FBNkM7SUFDN0MsZUFBZTtJQUNmLDZDQUE2QztJQUM3QyxlQUFlLEVBQUUsYUFBSyxDQUFDLFFBQVEsRUFBRSxFQUFjLGdCQUFnQjtJQUMvRCxjQUFjLEVBQUUsYUFBSyxDQUFDLElBQUksRUFBRSxFQUFtQixvREFBb0Q7SUFFbkcsNkNBQTZDO0lBQzdDLDhCQUE4QjtJQUM5QixpREFBaUQ7SUFDakQsNkNBQTZDO0lBQzdDLGdCQUFnQixFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsRUFBZSxXQUFXO0lBQzFELGtCQUFrQixFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsRUFBYSxVQUFVO0lBQ3pELG9CQUFvQixFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsRUFBVyxVQUFVO0lBQ3pELHFCQUFxQixFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxpQkFBaUI7SUFFbkUsNkNBQTZDO0lBQzdDLFNBQVM7SUFDVCw2Q0FBNkM7SUFDN0MscUJBQXFCLEVBQUUsYUFBSyxDQUFDLE1BQU0sRUFBRSxFQUFVLGVBQWU7SUFFOUQsNkNBQTZDO0lBQzdDLDZCQUE2QjtJQUM3QixrQ0FBa0M7SUFDbEMsNkNBQTZDO0lBQzdDLGtCQUFrQixFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsRUFBYSxlQUFlO0lBQzlELG9CQUFvQixFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsRUFBVyxlQUFlO0lBQzlELHNCQUFzQixFQUFFLGFBQUssQ0FBQyxNQUFNLEVBQUUsRUFBUyxlQUFlO0lBQzlELHNCQUFzQjtJQUN0Qix1QkFBdUIsRUFBRSxhQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsZUFBZTtDQUVwRSxDQUFDLENBQUEifQ==