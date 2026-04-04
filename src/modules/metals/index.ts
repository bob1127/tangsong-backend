import { Module } from "@medusajs/framework/utils"
import MetalsService from "./service"

// 將模組名稱匯出為常數，方便跨檔案引用
export const METALS_MODULE = "metals"

// 告訴 Medusa：這個 metals 模組的主體是 MetalsService
export default Module(METALS_MODULE, {
  service: MetalsService,
})