// 後端專案：src/api/store/line-checkout/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    // 1. 接收前端傳來的資料 (💡 這裡新增了 visitDate)
    const { cartItems, email, firstName, lastName, phone, visitDate } = req.body as any;

    // 2. 抓取 LINE 的環境變數
    const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const adminIds = (process.env.LINE_ADMIN_IDS || "").split(",").map(s => s.trim()).filter(s => s);

    if (!CHANNEL_ACCESS_TOKEN || adminIds.length === 0) {
      console.warn("⚠️ 尚未設定 LINE 環境變數，略過推播");
      // 先回傳成功，讓前端順利跳轉
      return res.json({ ok: true, display_id: "測試單號" });
    }

    // 3. 組合推播文字
    const itemsList = cartItems.map((item: any) => {
      return `- ${item.title} x ${item.quantity}`;
    }).join('\n');

    // 💡 組合給老闆的訊息 (加入了「預計來店」的欄位)
    const messageText = `[唐宋珠寶 - 新預約單]\n\n顧客: ${lastName || ""} ${firstName || ""}\n電話: ${phone || "未提供"}\n預計來店: ${visitDate || "未指定"}\nEmail: ${email}\n\n【預約內容】\n${itemsList}\n\n請準備於 LINE 接收客人的訊息！`;

    // 4. 發送 LINE 推播給老闆
    await fetch('https://api.line.me/v2/bot/message/multicast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: adminIds,
        messages: [{ type: "text", text: messageText }]
      })
    });

    console.log("✅ LINE 通知已發送！");

    // 5. 回傳成功給前端
    res.json({ 
      ok: true, 
      display_id: "PRE-" + Math.floor(Math.random() * 10000) 
    });

  } catch (error) {
    console.error("API 發生錯誤:", error);
    res.status(500).json({ ok: false, message: "系統發生錯誤" });
  }
}