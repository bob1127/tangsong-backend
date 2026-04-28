// src/api/admin/articles/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogModuleService = req.scope.resolve("blog")
    const data = { ...(req.body as any) }

    // 🛡️ 防呆：確保 Schema 類型符合資料庫的 Enum 規定 (把 Google 用的 BlogPosting 轉回資料庫用的 BlogPost)
    if (data.schema_type === "BlogPosting") {
      data.schema_type = "BlogPost"
    }

    // 💡 已經在資料庫新增 schema_data 欄位了，所以不用再改名，直接把整包 data 存進去！
    const article = await blogModuleService.createArticles(data)
    res.json({ article })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogModuleService = req.scope.resolve("blog")
    const articles = await blogModuleService.listArticles(
      {}, 
      { order: { created_at: "DESC" } }
    )
    res.json({ articles })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}