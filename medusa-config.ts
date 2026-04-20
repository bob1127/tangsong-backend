// 👇 注意這裡多匯入了 Modules
import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  admin: {
    disable: process.env.VERCEL === '1' ? false : process.env.NODE_ENV === 'production',
    // 🗑️ 刪除 path: "/"！讓 Admin 回到預設的 "/app"，把 "/" 還給後端 API
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.NODE_ENV === 'development' ? undefined : process.env.REDIS_URL,
    
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
    // 👇 使用官方的 Modules.AUTH 常數來註冊
    [Modules.AUTH]: {
      resolve: "@medusajs/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/auth-emailpass",
            id: "emailpass",
          },
        ],
      },
    },
    "metals": {
      resolve: "./src/modules/metals",
    },
    "file": {
      // ... 這裡保留你原本 S3 的設定，不要動它
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