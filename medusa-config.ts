import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // 👇 補上這一行，讓 Medusa 知道去哪裡找 Redis！
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!, // ⚠️ 注意：Railway 變數裡也要記得加上 AUTH_CORS
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  // 👇 註冊自訂模組
  modules: {
    "metals": {
      resolve: "./src/modules/metals",
    }
  }
})