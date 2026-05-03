"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
// 💡 這裡定義你的唐宋資料庫網址，作為備援
const TANGSONG_DB_URL = "postgresql://postgres.qhefiwluztdmxractwln:jofja5-patZih-hihfet@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
module.exports = (0, utils_1.defineConfig)({
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFFMUUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELHdCQUF3QjtBQUN4QixNQUFNLGVBQWUsR0FBRyx3SEFBd0gsQ0FBQTtBQUVoSixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUEsb0JBQVksRUFBQztJQUM1QixhQUFhLEVBQUU7UUFDYixnQ0FBZ0M7UUFDaEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLGVBQWU7UUFFeEQsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztRQUMvQixxQkFBcUIsRUFBRTtZQUNyQixHQUFHLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUU7U0FDbkM7UUFDRCxJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksdUJBQXVCO1lBQzVELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSw2Q0FBNkM7WUFDbEYsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLHVCQUF1QjtZQUMxRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksYUFBYTtZQUNsRCxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYTtTQUN6RDtLQUNGO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsaUJBQWlCO1FBQ2pCLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWTtRQUNuRixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDL0MsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksdUJBQXVCO0tBQ3RFO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFO1lBQ0osT0FBTyxFQUFFLG9CQUFvQjtTQUM5QjtRQUNELG9CQUFvQjtRQUNwQixDQUFDLGVBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNkLE9BQU8sRUFBRSxnQkFBZ0I7WUFDekIsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUsMEJBQTBCO3dCQUNuQyxFQUFFLEVBQUUsV0FBVztxQkFDaEI7b0JBQ0Y7d0JBQ0csT0FBTyxFQUFFLHVCQUF1Qjt3QkFDaEMsRUFBRSxFQUFFLFFBQVE7d0JBQ1osT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjs0QkFDdEMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9COzRCQUM5QyxxQ0FBcUM7NEJBQ3JDLDZDQUE2Qzs0QkFDN0MsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUJBQXVCLElBQUksMENBQTBDO3lCQUMvRjtxQkFDRjtvQkFDRCxzQ0FBc0M7b0JBQ3RDOzs7Ozs7Ozs7OztzQkFXRTtpQkFDSDthQUNGO1NBQ0Y7UUFDRCxRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUUsc0JBQXNCO1NBQ2hDO1FBQ0QsTUFBTSxFQUFFO1lBQ04sT0FBTyxFQUFFLGdCQUFnQjtZQUN6QixPQUFPLEVBQUU7Z0JBQ1AsU0FBUyxFQUFFO29CQUNUO3dCQUNFLE9BQU8sRUFBRSxtQkFBbUI7d0JBQzVCLEVBQUUsRUFBRSxJQUFJO3dCQUNSLE9BQU8sRUFBRTs0QkFDUCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXOzRCQUNqQyxhQUFhLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7NEJBQzNDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9COzRCQUNuRCxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTOzRCQUM3QixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTOzRCQUM3QixRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXOzRCQUNqQyx3QkFBd0IsRUFBRTtnQ0FDeEIsY0FBYyxFQUFFLElBQUk7NkJBQ3JCO3lCQUNGO3FCQUNGO2lCQUNGO2FBQ0Y7U0FDRjtLQUNGO0NBQ0YsQ0FBQyxDQUFBIn0=