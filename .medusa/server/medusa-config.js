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
                            // 💡 關鍵：不要用變數組合，直接寫死本地端前端的接收網址！
                            callbackUrl: `${process.env.STORE_CORS}/tw/callback/google`,
                        },
                    },
                    // 🚀 加入 LINE 登入 (預留，若尚未安裝套件請先註解掉)
                    /*
                    {
                      resolve: "medusa-auth-line",
                      id: "line",
                      options: {
                        clientId: process.env.LINE_CLIENT_ID,
                        clientSecret: process.env.LINE_CLIENT_SECRET,
                        callbackUrl: `${process.env.STORE_CORS || "http://localhost:8000"}/callback/line`,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBMEU7QUFFMUUsSUFBQSxlQUFPLEVBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBRTdELHdCQUF3QjtBQUN4QixNQUFNLGVBQWUsR0FBRyx3SEFBd0gsQ0FBQTtBQUVoSixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUEsb0JBQVksRUFBQztJQUM1QixhQUFhLEVBQUU7UUFDYixnQ0FBZ0M7UUFDaEMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLGVBQWU7UUFFeEQsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztRQUMvQixxQkFBcUIsRUFBRTtZQUNyQixHQUFHLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUU7U0FDbkM7UUFDRCxJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksdUJBQXVCO1lBQzVELFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSw2Q0FBNkM7WUFDbEYsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLHVCQUF1QjtZQUMxRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksYUFBYTtZQUNsRCxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYTtTQUN6RDtLQUNGO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsaUJBQWlCO1FBQ2pCLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWTtRQUNuRixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDL0MsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksdUJBQXVCO0tBQ3RFO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFO1lBQ0osT0FBTyxFQUFFLG9CQUFvQjtTQUM5QjtRQUNELG9CQUFvQjtRQUNwQixDQUFDLGVBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNkLE9BQU8sRUFBRSxnQkFBZ0I7WUFDekIsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUsMEJBQTBCO3dCQUNuQyxFQUFFLEVBQUUsV0FBVztxQkFDaEI7b0JBQ0Y7d0JBQ0csT0FBTyxFQUFFLHVCQUF1Qjt3QkFDaEMsRUFBRSxFQUFFLFFBQVE7d0JBQ1osT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjs0QkFDdEMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9COzRCQUM5QyxnQ0FBZ0M7NEJBQ2hDLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxxQkFBcUI7eUJBQzVEO3FCQUNGO29CQUNELGtDQUFrQztvQkFDbEM7Ozs7Ozs7Ozs7c0JBVUU7aUJBQ0g7YUFDRjtTQUNGO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLHNCQUFzQjtTQUNoQztRQUNELE1BQU0sRUFBRTtZQUNOLE9BQU8sRUFBRSxnQkFBZ0I7WUFDekIsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUsbUJBQW1CO3dCQUM1QixFQUFFLEVBQUUsSUFBSTt3QkFDUixPQUFPLEVBQUU7NEJBQ1AsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVzs0QkFDakMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCOzRCQUMzQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQjs0QkFDbkQsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUzs0QkFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUzs0QkFDN0IsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVzs0QkFDakMsd0JBQXdCLEVBQUU7Z0NBQ3hCLGNBQWMsRUFBRSxJQUFJOzZCQUNyQjt5QkFDRjtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9