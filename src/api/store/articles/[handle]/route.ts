// src/api/store/articles/[handle]/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

// [GET] 前台專用：透過網址代稱 (handle) 取得單篇文章內容
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const blogModuleService = req.scope.resolve("blog")
    
    const articles = await blogModuleService.listArticles({ 
      handle: req.params.handle,
      is_published: true 
    })

    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: "找不到該文章" })
    }

    res.json({ article: articles[0] })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}