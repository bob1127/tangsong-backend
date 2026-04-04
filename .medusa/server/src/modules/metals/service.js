"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const metal_price_1 = require("./models/metal-price");
// Medusa V2 超強語法：只要把 Model 傳進 MedusaService，
// 它就會自動幫你生出 find, create, update, delete 等所有資料庫操作功能！
class MetalsService extends (0, utils_1.MedusaService)({
    MetalPrice: metal_price_1.MetalPrice,
}) {
}
exports.default = MetalsService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tb2R1bGVzL21ldGFscy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQXlEO0FBQ3pELHNEQUFpRDtBQUVqRCw2Q0FBNkM7QUFDN0MscURBQXFEO0FBQ3JELE1BQU0sYUFBYyxTQUFRLElBQUEscUJBQWEsRUFBQztJQUN4QyxVQUFVLEVBQVYsd0JBQVU7Q0FDWCxDQUFDO0NBQUc7QUFFTCxrQkFBZSxhQUFhLENBQUEifQ==