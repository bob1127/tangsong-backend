import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  // 👇 聰明開關：Vercel 開啟後台，Railway 關閉後台
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
    // 你的金價 API 模組
    "metals": {
      resolve: "./src/modules/metals",
    },
    // 👇 S3 雲端儲存模組 (Medusa V2 專用極簡寫法)
    "file": {
      resolve: "@medusajs/file-s3",
      options: {
        file_url: process.env.S3_FILE_URL,
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        region: process.env.S3_REGION,
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,
      },
    },
  }
})