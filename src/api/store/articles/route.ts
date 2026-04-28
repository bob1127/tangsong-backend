// src/api/store/articles/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// [GET] 前台專用：取得「已發布」的文章列表
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogModuleService = req.scope.resolve("blog")
    
    // 💡 關鍵：只撈取 is_published: true 的文章，並依時間排序
    const articles = await blogModuleService.listArticles(
      { is_published: true }, 
      { order: { created_at: "DESC" } }
    )
    
    res.json({ articles })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}