import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// 💡 這裡定義你的唐宋資料庫網址，作為備援
const TANGSONG_DB_URL = "postgresql://postgres.qhefiwluztdmxractwln:jofja5-patZih-hihfet@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

const PRODUCTION_ADMIN_URL = "https://tangsong-backend.vercel.app"
const PRODUCTION_STORE_URL = "https://www.tangsong.com.tw"

const defaultStoreCors = `http://localhost:8000,${PRODUCTION_STORE_URL}`
const defaultAdminCors = `http://localhost:9000,http://localhost:7001,${PRODUCTION_ADMIN_URL}`
const defaultAuthCors = `http://localhost:8000,http://localhost:9000,${PRODUCTION_STORE_URL},${PRODUCTION_ADMIN_URL}`

module.exports = defineConfig({
  projectConfig: {
    // 🚀 修改這裡：優先用環境變數，沒有的話就用上面定義的網址
    databaseUrl: process.env.DATABASE_URL || TANGSONG_DB_URL, 
    
    redisUrl: process.env.REDIS_URL, 
    databaseDriverOptions: {
      ssl: { rejectUnauthorized: false }, 
    },
    http: {
      storeCors: process.env.STORE_CORS || defaultStoreCors,
      adminCors: process.env.ADMIN_CORS || defaultAdminCors,
      authCors: process.env.AUTH_CORS || defaultAuthCors,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    disable: process.env.VERCEL === "1" ? false : process.env.NODE_ENV === 'production', 
    path: process.env.VERCEL === "1" ? "/" : "/app",
    // Vercel Admin 必須指向 Vercel 自身（走 rewrite），不可指 Railway，否則瀏覽器跨域 401
    backendUrl:
      process.env.VERCEL === "1"
        ? process.env.MEDUSA_ADMIN_PUBLIC_URL || PRODUCTION_ADMIN_URL
        : process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
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
            callbackUrl: process.env.NODE_ENV === "production" 
                ? "https://www.tangsong.com.tw/tw/callback/google" 
                : "http://localhost:8000/tw/callback/google",
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