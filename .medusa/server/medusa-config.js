"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 👇 注意這裡多匯入了 Modules
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
module.exports = (0, utils_1.defineConfig)({
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
            storeCors: process.env.STORE_CORS,
            adminCors: process.env.ADMIN_CORS,
            authCors: process.env.AUTH_CORS,
            jwtSecret: process.env.JWT_SECRET || "supersecret",
            cookieSecret: process.env.COOKIE_SECRET || "supersecret",
        }
    },
    modules: {
        blog: {
            resolve: "./src/modules/blog",
        },
        // 👇 註冊 Auth 模組與社群登入 Providers
        // 👇 註冊 Auth 模組與社群登入 Providers
        [utils_1.Modules.AUTH]: {
            resolve: "@medusajs/auth",
            options: {
                providers: [
                    // 原本的 Email/密碼登入
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
                            // 🌟 關鍵修改：讓 Google 跳轉回你的前端 Next.js
                            callbackUrl: `${process.env.STORE_CORS || "http://localhost:8000"}/callback/google`,
                        },
                    },
                    // 🚨 已經將 LINE 註解掉，避免找不到套件導致伺服器崩潰！
                    /*
                    {
                      resolve: "medusa-auth-line",
                      id: "line",
                      options: {
                        clientId: process.env.LINE_CLIENT_ID,
                        clientSecret: process.env.LINE_CLIENT_SECRET,
                        callbackUrl: `${process.env.MEDUSA_BACKEND_URL}/auth/customer/line/callback`,
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQkFBc0I7QUFDdEIscURBQTBFO0FBRTFFLElBQUEsZUFBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUU3RCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUEsb0JBQVksRUFBQztJQUM1QixLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVk7UUFDbkYsdURBQXVEO0tBQ3hEO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUNyQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztRQUVwRixxQkFBcUIsRUFBRTtZQUNyQix1QkFBdUIsRUFBRSxLQUFLO1lBQzlCLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsR0FBRyxFQUFFLEVBQUU7WUFDUCxHQUFHLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUU7U0FDbkM7UUFFRCxJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXO1lBQ2xDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBVTtZQUNoQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksYUFBYTtZQUNsRCxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYTtTQUN6RDtLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFO1lBQ0osT0FBTyxFQUFFLG9CQUFvQjtTQUM5QjtRQUNELCtCQUErQjtRQUNqQywrQkFBK0I7UUFDN0IsQ0FBQyxlQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDZCxPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1QsaUJBQWlCO29CQUNqQjt3QkFDRSxPQUFPLEVBQUUsMEJBQTBCO3dCQUNuQyxFQUFFLEVBQUUsV0FBVztxQkFDaEI7b0JBQ0g7d0JBQ0ksT0FBTyxFQUFFLHVCQUF1Qjt3QkFDaEMsRUFBRSxFQUFFLFFBQVE7d0JBQ1osT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjs0QkFDdEMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9COzRCQUM5QyxtQ0FBbUM7NEJBQ25DLFdBQVcsRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLHVCQUF1QixrQkFBa0I7eUJBQ3BGO3FCQUNGO29CQUNELGtDQUFrQztvQkFDbEM7Ozs7Ozs7Ozs7c0JBVUU7aUJBQ0g7YUFDRjtTQUNGO1FBQ0QsUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLHNCQUFzQjtTQUNoQztRQUNELE1BQU0sRUFBRTtZQUNOLDBCQUEwQjtZQUMxQixPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsT0FBTyxFQUFFLG1CQUFtQjt3QkFDNUIsRUFBRSxFQUFFLElBQUk7d0JBQ1IsT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7NEJBQ2pDLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjs0QkFDM0MsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7NEJBQ25ELE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzdCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7NEJBQ2pDLHdCQUF3QixFQUFFO2dDQUN4QixjQUFjLEVBQUUsSUFBSTs2QkFDckI7eUJBQ0Y7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0Y7Q0FDRixDQUFDLENBQUEifQ==