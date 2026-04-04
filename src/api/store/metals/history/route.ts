export async function GET(req: any, res: any) {
  try {
    // 呼叫我們剛剛建立的 metals 模組服務
    const metalsModuleService = req.scope.resolve("metals")
    
    // Medusa V2 魔法：使用自動生成的 listMetalPrices 功能
    // 我們設定：依據建立時間 (created_at) 倒序排列，並抓取最近的 30 筆紀錄
    const historyData = await metalsModuleService.listMetalPrices(
      {}, // 這裡可以放篩選條件，留空代表全抓
      {
        order: { created_at: "DESC" },
        take: 30, // 抓取最近 30 筆
      }
    )

    // 成功回傳給前端！
    res.json({
      success: true,
      data: historyData
    })
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      message: "無法取得歷史金價", 
      error: error?.message 
    })
  }
}