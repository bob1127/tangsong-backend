import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import nodemailer from "nodemailer"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  console.log("\n🚀 [API] ======== 收到新預約結帳請求 ========");

  try {
    const { cartId, cartItems, email, firstName, lastName, phone, visitDate } = req.body as any;

    const shortId = cartId ? cartId.split('_')[1]?.slice(0, 6).toUpperCase() : Math.floor(Math.random() * 10000).toString();
    const displayId = `#RSV-${shortId}`;
    
    const itemsList = cartItems?.map((item: any) => `- ${item.title} x ${item.quantity}`).join('\n') || "無商品";
    const messageText = `[唐宋珠寶 - 新預約單]\n\n預約單號: ${displayId}\n顧客: ${lastName || ""} ${firstName || ""}\n電話: ${phone || "未提供"}\n預計來店: ${visitDate || "未指定"}\nEmail: ${email}\n\n【預約內容】\n${itemsList}\n\n請準備於 LINE 接收客人的訊息！`;

    // ==========================================
    // 🔍 任務 A: 檢查 Email 環境變數與發送
    // ==========================================
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    console.log("🔍 [Email 除錯] 正在檢查環境變數...");
    console.log(`- SMTP_HOST: ${smtpHost || "❌ 遺失"}`);
    console.log(`- SMTP_PORT: ${smtpPort || "❌ 遺失"}`);
    console.log(`- SMTP_USER: ${smtpUser || "❌ 遺失"}`);
    console.log(`- SMTP_PASS: ${smtpPass ? "✅ 已設定 (隱藏)" : "❌ 遺失"}`);
    console.log(`- NOTIFY_EMAIL: ${notifyEmail || "❌ 遺失"}`);

    if (smtpHost && smtpUser && smtpPass && notifyEmail) {
      try {
        console.log("⏳ [Email] 正在建立 SMTP 連線...");
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(smtpPort),
          secure: Number(smtpPort) === 465, // 465用true，587用false
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        // 💡 加入 verify 測試連線是否被擋
        await transporter.verify();
        console.log("✅ [Email] 成功連線到信箱伺服器！準備寄信...");

        const info = await transporter.sendMail({
          from: `"唐宋珠寶系統通知" <${smtpUser}>`,
          to: notifyEmail,
          subject: `[新預約通知] 唐宋珠寶預約單 ${displayId}`,
          text: messageText,
        });
        console.log("✅ [Email] 信件已成功寄出！Message ID:", info.messageId);

      } catch (emailErr: any) {
        console.error("❌ [Email] 寄送失敗，詳細錯誤原因:", emailErr.message || emailErr);
      }
    } else {
      console.warn("⚠️ [Email] 環境變數有缺漏，跳過寄信流程！");
    }

    // ==========================================
    // 🔔 任務 B: 發送 LINE 推播
    // ==========================================
    const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const adminIds = (process.env.LINE_ADMIN_IDS || "").split(",").map(s => s.trim()).filter(s => s);

    if (CHANNEL_ACCESS_TOKEN && adminIds.length > 0) {
      console.log("⏳ [LINE] 正在發送推播給老闆...");
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
      }).catch(err => console.error("❌ [LINE] 發送失敗:", err));
      console.log("✅ [LINE] 通知推播已發送！");
    }

    // ==========================================
    // 回傳成功
    // ==========================================
    res.json({ ok: true, display_id: displayId });
    console.log("🏁 [API] ======== 預約結帳請求處理完畢 ========\n");

  } catch (error: any) {
    console.error("❌ [API] 發生嚴重錯誤:", error);
    res.status(500).json({ ok: false, message: "系統發生錯誤" });
  }
}