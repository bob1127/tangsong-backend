import { MedusaService } from "@medusajs/framework/utils"
import { MetalPrice } from "./models/metal-price"

// Medusa V2 超強語法：只要把 Model 傳進 MedusaService，
// 它就會自動幫你生出 find, create, update, delete 等所有資料庫操作功能！
class MetalsService extends MedusaService({
  MetalPrice,
}) {}

export default MetalsService