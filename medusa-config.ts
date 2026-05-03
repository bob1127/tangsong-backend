import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// 💡 這裡定義你的唐宋資料庫網址，作為備援
const TANGSONG_DB_URL = "postgresql://postgres.qhefiwluztdmxractwln:jofja5-patZih-hihfet@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

module.exports = defineConfig({
  projectConfig: {
    // 🚀 修改這裡：優先用環境變數，沒有的話就用上面定義的網址
    databaseUrl: process.env.DATABASE_URL || TANGSONG_DB_URL, 
    
    redisUrl: process.env.REDIS_URL, 
    databaseDriverOptions: {
      ssl: { rejectUnauthorized: false }, 
    },
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001,http://localhost:9000",
      authCors: process.env.AUTH_CORS || "http://localhost:3000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    // 🚀 沿用你成功的舊專案邏輯
    disable: process.env.VERCEL === "1" ? false : process.env.NODE_ENV === 'production', 
    path: process.env.VERCEL === "1" ? "/" : "/app",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  modules: {
    blog: {
      resolve: "./src/modules/blog",
    },
    // 👇 註冊社群登入 Modules
    [Modules.AUTH]: {
      resolve: "@medusajs/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/auth-emailpass",
            id: "emailpass",
          },
         {
            resolve: "@medusajs/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              // 🚀 關鍵修正：改用獨立環境變數，避免跟 CORS 混在一起變亂碼！
              // 如果 Railway 沒設變數，就先退回 localhost:8000 確保本地能測
              callbackUrl: process.env.STORE_AUTH_CALLBACK_URL || "http://localhost:8000/tw/callback/google",
            },
          },
          // 🚀 加入 LINE 登入 (預留，因為尚未安裝套件，保持註解狀態！)
          /*
          {
            resolve: "medusa-auth-line",
            id: "line",
            options: {
              clientId: process.env.LINE_CLIENT_ID,
              clientSecret: process.env.LINE_CLIENT_SECRET,
              // LINE 也比照辦理，之後上線要改成正式網址
              callbackUrl: process.env.STORE_AUTH_CALLBACK_URL_LINE || "http://localhost:8000/tw/callback/line",
            },
          }
          */
        ],
      },
    },
    "metals": {
      resolve: "./src/modules/metals",
    },
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
              additional_client_config: {
                forcePathStyle: true,
              }
            },
          },
        ],
      },
    },
  }
})