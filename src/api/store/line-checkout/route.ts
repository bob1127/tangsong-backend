import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import nodemailer from "nodemailer"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  console.log("\n========================================");
  console.log("🚀 [API] 收到前端請求！開始處理 Email / LINE");
  console.log("========================================");

  try {
    const { cartId, cartItems, email, firstName, lastName, phone, visitDate } = req.body as any;
    const shortId = cartId ? cartId.split('_')[1]?.slice(0, 6).toUpperCase() : Math.floor(Math.random() * 10000).toString();
    const displayId = `#RSV-${shortId}`;
    
    const itemsList = cartItems?.map((item: any) => `- ${item.title} x ${item.quantity}`).join('\n') || "無商品";
    const messageText = `[唐宋珠寶 - 新預約單]\n\n預約單號: ${displayId}\n顧客: ${lastName || ""} ${firstName || ""}\n電話: ${phone || "未提供"}\n預計來店: ${visitDate || "未指定"}\nEmail: ${email}\n\n【預約內容】\n${itemsList}\n\n請準備於 LINE 接收客人的訊息！`;

    // ==========================================
    // 📧 任務 A: Email 處理 (改為 await 強制等待，方便抓漏)
    // ==========================================
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    console.log(`🔍 [環境變數檢查] USER: ${smtpUser || '遺失'}, HOST: ${smtpHost || '遺失'}, TO: ${notifyEmail || '遺失'}`);

    if (smtpHost && smtpUser && smtpPass && notifyEmail) {
      try {
        console.log("⏳ [Email] 準備建立 SMTP 連線...");
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: Number(smtpPort),
          secure: Number(smtpPort) === 465,
          auth: { user: smtpUser, pass: smtpPass },
          family: 4 // 強制 IPv4
        } as any);

        console.log("⏳ [Email] 正在測試連線 (Verify)...");
        await transporter.verify();
        console.log("✅ [Email] 連線測試成功！準備寄出信件...");

        await transporter.sendMail({
          from: `"唐宋珠寶" <${smtpUser}>`,
          to: notifyEmail,
          subject: `[新預約] 唐宋珠寶預約單 ${displayId}`,
          text: messageText,
        });
        console.log("✅ [Email] 信件已成功寄出！");
      } catch (emailErr: any) {
        // 🚨 這裡會印出真正的兇手！
        console.error("❌ [Email] 寄信過程發生錯誤，詳細原因:", emailErr.message || emailErr);
      }
    } else {
      console.warn("⚠️ [Email] 缺少環境變數，跳過寄信流程！");
    }

    // ==========================================
    // 🔔 任務 B: LINE 推播處理
    // ==========================================
    const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const adminIds = (process.env.LINE_ADMIN_IDS || "").split(",").map(s => s.trim()).filter(s => s);
    
    if (CHANNEL_ACCESS_TOKEN && adminIds.length > 0) {
      try {
        console.log("⏳ [LINE] 準備推播給老闆...");
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
        console.log("✅ [LINE] 推播成功！");
      } catch (lineErr) {
        console.error("❌ [LINE] 推播失敗:", lineErr);
      }
    }

    // ==========================================
    // 🏁 確保所有事情做完，才回傳成功給前端
    // ==========================================
    res.json({ ok: true, display_id: displayId });
    console.log("🏁 [API] 全部處理完畢，已通知前端跳轉！\n");

  } catch (error: any) {
    console.error("❌ [API] 系統嚴重錯誤:", error);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, message: "系統發生錯誤" });
    }
  }
}