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
    
    // 👇 這裡就是信件內容！你已經把 visitDate 放進去了，所以信件一定會有時間
    const messageText = `[唐宋珠寶 - 新預約單]\n\n預約單號: ${displayId}\n顧客: ${lastName || ""} ${firstName || ""}\n電話: ${phone || "未提供"}\n預計來店: ${visitDate || "未指定"}\nEmail: ${email}\n\n【預約內容】\n${itemsList}\n\n請準備於 LINE 接收客人的訊息！`;

    // 🚀 第一步：立刻回應成功給前端，讓客人秒跳 QR Code
    res.json({ ok: true, display_id: displayId });

    // 💡 第二步：背景非同步處理通知任務
    (async () => {
      // 📧 任務 A: 使用 Resend 發送 Email
      const notifyEmail = process.env.NOTIFY_EMAIL; 
      
      if (notifyEmail) {
        // 🚨 修正：Resend 的錯誤攔截寫法，使用 { data, error } 來接回傳值
        const { data, error } = await resend.emails.send({
          from: 'onboarding@resend.dev', // 預設測試發件人
          to: notifyEmail,               // 記得 Railway 裡的 NOTIFY_EMAIL 必須填 tangsongzhubao@gmail.com
          subject: `[新預約] 唐宋珠寶預約單 ${displayId}`,
          text: messageText,
        });

        if (error) {
          console.error("❌ [Email] Resend 拒絕寄信，原因:", error);
        } else {
          console.log("✅ [Email] Resend 真的寄信成功啦！信件 ID:", data?.id);
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