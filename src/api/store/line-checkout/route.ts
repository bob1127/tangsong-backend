import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import nodemailer from "nodemailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { cartId, cartItems, email, firstName, lastName, phone, visitDate } = req.body as any;

    const shortId = cartId ? cartId.split('_')[1]?.slice(0, 6).toUpperCase() : Math.floor(Math.random() * 10000).toString();
    const displayId = `#RSV-${shortId}`;
    
    const itemsList = cartItems?.map((item: any) => `- ${item.title} x ${item.quantity}`).join('\n') || "無商品";
    const messageText = `[唐宋珠寶 - 新預約單]\n\n預約單號: ${displayId}\n顧客: ${lastName || ""} ${firstName || ""}\n電話: ${phone || "未提供"}\n預計來店: ${visitDate || "未指定"}\nEmail: ${email}\n\n【預約內容】\n${itemsList}\n\n請準備於 LINE 接收客人的訊息！`;

    // 🚀 關鍵第一步：立刻回應前端「成功」！
    // 這樣客人按下去瞬間就會彈出 QR Code，完全不用等伺服器寄信！
    res.json({ ok: true, display_id: displayId });

    // ==========================================
    // 進入「背景處理模式」，伺服器自己慢慢派發通知
    // ==========================================
    (async () => {
      // 📧 任務 A: 發送 Email
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const notifyEmail = process.env.NOTIFY_EMAIL;
if (smtpHost && smtpUser && smtpPass && notifyEmail) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: Number(smtpPort) === 465,
            auth: { user: smtpUser, pass: smtpPass },
            // 💡 關鍵救星 1：強制使用 IPv4，避開 Railway 的 IPv6 黑洞！
            family: 4 
          } as any); // 🚀 關鍵救星 2：加上 as any 讓 TypeScript 乖乖閉嘴

          await transporter.sendMail({
            from: `"唐宋珠寶" <${smtpUser}>`,
            to: notifyEmail,
            subject: `[新預約] 唐宋珠寶預約單 ${displayId}`,
            text: messageText,
          });
          console.log("✅ [Email] 背景寄信成功！已送達:", notifyEmail);
        } catch (emailErr: any) {
          console.error("❌ [Email] 背景寄送失敗:", emailErr.message);
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
        }).catch(err => console.error("❌ [LINE] 背景發送失敗:", err));
        console.log("✅ [LINE] 背景推播成功！");
      }
    })();

  } catch (error: any) {
    console.error("❌ [API] 發生嚴重錯誤:", error);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, message: "系統發生錯誤" });
    }
  }
}