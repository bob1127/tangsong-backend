import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  // 👇 聰明開關：如果人在 Vercel 就開啟並對齊路徑，如果人在 Railway 就乖乖關閉
  admin: {
    disable: process.env.VERCEL === '1' ? false : process.env.NODE_ENV === 'production',
    path: "/", 
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
    },
    // 👇 正式掛載 S3 雲端儲存模組 (連接 Supabase Storage)
    "@medusajs/file": {
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              file_url: process.env.S3_FILE_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: process.env.S3_REGION,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
            },
          },
        ],
      },
    },
  }
})