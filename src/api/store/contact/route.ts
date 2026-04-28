import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // 1. 取得前端傳來的表單資料
    const { full_name, email, phone, subject, message } = req.body as any

    // 2. 寄信給老闆 (這裡以簡單的 console.log 示意，實務上會接 Resend 或 Nodemailer)
    console.log("💌 [系統通知] 收到新的聯絡表單！")
    console.log(`姓名: ${full_name} | 電話: ${phone} | 信箱: ${email}`)
    console.log(`主旨: ${subject}`)
    console.log(`內容: ${message}`)

    // TODO: 實作真實的寄信邏輯，例如：
    // await sendEmail({
    //   to: "boss@tangsong.com.tw",
    //   subject: `【官網表單】${subject} - ${full_name}`,
    //   html: `<p>電話：${phone}</p><p>內容：${message}</p>`
    // })

    // 3. 回傳成功訊息給前端
    res.status(200).json({ 
      success: true, 
      message: "表單已成功送出" 
    })

  } catch (error) {
    console.error("表單處理失敗:", error)
    res.status(500).json({ success: false, error: "系統內部錯誤" })
  }
}