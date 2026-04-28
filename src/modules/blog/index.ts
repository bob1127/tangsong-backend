// src/modules/blog/index.ts
import { Module } from "@medusajs/framework/utils"
import { MedusaService } from "@medusajs/framework/utils"
import { Article } from "./models/article"

export const BLOG_MODULE = "blog"

// 💡 繼承官方的 MedusaService，並把我們的 Article 模型綁定進去
class BlogModuleService extends MedusaService({
  Article,
}) {}

export default Module(BLOG_MODULE, {
  service: BlogModuleService,
})