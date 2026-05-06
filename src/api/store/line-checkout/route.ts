import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Resend } from "resend"

// 初始化 Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { cartId, cartItems, email, firstName, lastName, phone, visitDate } = req.body as any;

    // 產生專屬預約單號 (取 Cart ID 部分字串)
    const shortId = cartId ? cartId.split('_')[1]?.slice(0, 6).toUpperCase() : "RSV";
    const displayId = `#RSV-${shortId}`;
    
    const itemsList = cartItems?.map((item: any) => `- ${item.title} x ${item.quantity}`).join('\n') || "無商品";
    const messageText = `[唐宋珠寶 - 新預約單]\n\n預約單號: ${displayId}\n顧客: ${lastName || ""} ${firstName || ""}\n電話: ${phone || "未提供"}\n預計來店: ${visitDate || "未指定"}\nEmail: ${email}\n\n【預約內容】\n${itemsList}\n\n請準備於 LINE 接收客人的訊息！`;

    // 🚀 第一步：立刻回應成功給前端，讓客人秒跳 QR Code
    res.json({ ok: true, display_id: displayId });

    // 💡 第二步：背景非同步處理通知任務
    (async () => {
      // 📧 任務 A: 使用 Resend 發送 Email (穩定且無視 IPv6 限制)
      const notifyEmail = process.env.NOTIFY_EMAIL; 
      
      if (notifyEmail) {
        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev', // 預設測試發件人
            to: notifyEmail,
            subject: `[新預約] 唐宋珠寶預約單 ${displayId}`,
            text: messageText,
          });
          console.log("✅ [Email] Resend 寄信成功！");
        } catch (emailErr) {
          console.error("❌ [Email] Resend 寄信失敗:", emailErr);
        }
      }

      // 🔔 任務 B: 發送 LINE 推播
      const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
      const adminIds = (process.env.LINE_ADMIN_IDS || "").split(",").map(s => s.trim()).filter(s => s);
      
      if (CHANNEL_ACCESS_TOKEN && adminIds.length > 0) {
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
        }).catch(err => console.error("❌ [LINE] 背景推播失敗:", err));
        console.log("✅ [LINE] 背景推播成功！");
      }
    })();

  } catch (error: any) {
    console.error("❌ [API] 系統嚴重錯誤:", error);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, message: "系統發生錯誤" });
    }
  }
}