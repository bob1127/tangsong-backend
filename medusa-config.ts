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
    redisUrl: process.env.NODE_ENV === 'development' ? undefined : process.env.REDIS_URL,
    
    // 👇 救命仙丹：確保資料庫連線絕對不會被 SSL 擋下
    databaseDriverOptions: {
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 10,
      ssl: { rejectUnauthorized: false }, 
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
    // 👇 關鍵修正：屬性名稱必須是乾淨的 "file"！
   "file": {
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
              // 👇 就是這行！這行沒加，Supabase 就收不到檔案
              force_path_style: true,
            },
          },
        ],
      },
    },
  }
})