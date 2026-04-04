import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  // 👇 關鍵新增：在正式環境（Railway）關閉內建後台，並將路徑對齊 Vercel 根目錄
  admin: {
    disable: process.env.NODE_ENV === 'production',
    path: "/", // 🚨 解決白畫面的關鍵：把後台路徑對齊 Vercel 的根目錄
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // 如果是開發模式就用記憶體模擬 Redis
    redisUrl: process.env.NODE_ENV === 'development' ? undefined : process.env.REDIS_URL,
    
    // 資料庫連線寬限時間增加
    databaseDriverOptions: {
      connectionTimeoutMillis: 10000, // 增加到 10 秒（預設通常太短）
      idleTimeoutMillis: 30000,
      max: 10, // 限制最大連線數，對 Supabase Pooler 更友善
    },

    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: {
    "metals": {
      resolve: "./src/modules/metals",
    }
  }
})