"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.METALS_MODULE = void 0;
const utils_1 = require("@medusajs/framework/utils");
const service_1 = __importDefault(require("./service"));
// 將模組名稱匯出為常數，方便跨檔案引用
exports.METALS_MODULE = "metals";
// 告訴 Medusa：這個 metals 模組的主體是 MetalsService
exports.default = (0, utils_1.Module)(exports.METALS_MODULE, {
    service: service_1.default,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZXRhbHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscURBQWtEO0FBQ2xELHdEQUFxQztBQUVyQyxxQkFBcUI7QUFDUixRQUFBLGFBQWEsR0FBRyxRQUFRLENBQUE7QUFFckMsMkNBQTJDO0FBQzNDLGtCQUFlLElBQUEsY0FBTSxFQUFDLHFCQUFhLEVBQUU7SUFDbkMsT0FBTyxFQUFFLGlCQUFhO0NBQ3ZCLENBQUMsQ0FBQSJ9