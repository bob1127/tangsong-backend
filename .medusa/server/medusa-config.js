"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
// 💡 這裡定義你的唐宋資料庫網址，作為備援
const TANGSONG_DB_URL = "postgresql://postgres.qhefiwluztdmxractwln:jofja5-patZih-hihfet@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
const PRODUCTION_ADMIN_URL = "https://tangsong-backend.vercel.app";
const PRODUCTION_STORE_URL = "https://www.tangsong.com.tw";
const defaultStoreCors = `http://localhost:8000,${PRODUCTION_STORE_URL}`;
const defaultAdminCors = `http://localhost:9000,http://localhost:7001,${PRODUCTION_ADMIN_URL}`;
const defaultAuthCors = `http://localhost:8000,http://localhost:9000,${PRODUCTION_STORE_URL},${PRODUCTION_ADMIN_URL}`;
module.exports = (0, utils_1.defineConfig)({
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
        backendUrl: process.env.VERCEL === "1"
            ? process.env.MEDUSA_ADMIN_PUBLIC_URL || PRODUCTION_ADMIN_URL
            : process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    },
    modules: {
        blog: {
            resolve: "./src/modules/blog",
        },
        // 👇 註冊社群登入 Modules
        [utils_1.Modules.AUTH]: {
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFFMUUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELHdCQUF3QjtBQUN4QixNQUFNLGVBQWUsR0FBRyx3SEFBd0gsQ0FBQTtBQUVoSixNQUFNLG9CQUFvQixHQUFHLHFDQUFxQyxDQUFBO0FBQ2xFLE1BQU0sb0JBQW9CLEdBQUcsNkJBQTZCLENBQUE7QUFFMUQsTUFBTSxnQkFBZ0IsR0FBRyx5QkFBeUIsb0JBQW9CLEVBQUUsQ0FBQTtBQUN4RSxNQUFNLGdCQUFnQixHQUFHLCtDQUErQyxvQkFBb0IsRUFBRSxDQUFBO0FBQzlGLE1BQU0sZUFBZSxHQUFHLCtDQUErQyxvQkFBb0IsSUFBSSxvQkFBb0IsRUFBRSxDQUFBO0FBRXJILE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBQSxvQkFBWSxFQUFDO0lBQzVCLGFBQWEsRUFBRTtRQUNiLGdDQUFnQztRQUNoQyxXQUFXLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksZUFBZTtRQUV4RCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTO1FBQy9CLHFCQUFxQixFQUFFO1lBQ3JCLEdBQUcsRUFBRSxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRTtTQUNuQztRQUNELElBQUksRUFBRTtZQUNKLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxnQkFBZ0I7WUFDckQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGdCQUFnQjtZQUNyRCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksZUFBZTtZQUNsRCxTQUFTLEVB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