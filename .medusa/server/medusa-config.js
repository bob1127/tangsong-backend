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
        // 👇 使用官方的 Modules.AUTH 常數來註冊
        [utils_1.Modules.AUTH]: {
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQkFBc0I7QUFDdEIscURBQTBFO0FBRTFFLElBQUEsZUFBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUU3RCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUEsb0JBQVksRUFBQztJQUM1QixLQUFLLEVBQUU7UUFDTCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVk7UUFDbkYsdURBQXVEO0tBQ3hEO0lBQ0QsYUFBYSxFQUFFO1FBQ2IsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWTtRQUNyQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUztRQUVwRixxQkFBcUIsRUFBRTtZQUNyQix1QkFBdUIsRUFBRSxLQUFLO1lBQzlCLGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsR0FBRyxFQUFFLEVBQUU7WUFDUCxHQUFHLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxLQUFLLEVBQUU7U0FDbkM7UUFFRCxJQUFJLEVBQUU7WUFDSixTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXO1lBQ2xDLFNBQVMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVc7WUFDbEMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBVTtZQUNoQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksYUFBYTtZQUNsRCxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksYUFBYTtTQUN6RDtLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsOEJBQThCO1FBQzlCLENBQUMsZUFBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2QsT0FBTyxFQUFFLGdCQUFnQjtZQUN6QixPQUFPLEVBQUU7Z0JBQ1AsU0FBUyxFQUFFO29CQUNUO3dCQUNFLE9BQU8sRUFBRSwwQkFBMEI7d0JBQ25DLEVBQUUsRUFBRSxXQUFXO3FCQUNoQjtpQkFDRjthQUNGO1NBQ0Y7UUFDRCxRQUFRLEVBQUU7WUFDUixPQUFPLEVBQUUsc0JBQXNCO1NBQ2hDO1FBQ0QsTUFBTSxFQUFFO1lBQ04sMEJBQTBCO1lBQzFCLE9BQU8sRUFBRSxnQkFBZ0I7WUFDekIsT0FBTyxFQUFFO2dCQUNQLFNBQVMsRUFBRTtvQkFDVDt3QkFDRSxPQUFPLEVBQUUsbUJBQW1CO3dCQUM1QixFQUFFLEVBQUUsSUFBSTt3QkFDUixPQUFPLEVBQUU7NEJBQ1AsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVzs0QkFDakMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCOzRCQUMzQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQjs0QkFDbkQsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUzs0QkFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUzs0QkFDN0IsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVzs0QkFDakMsd0JBQXdCLEVBQUU7Z0NBQ3hCLGNBQWMsRUFBRSxJQUFJOzZCQUNyQjt5QkFDRjtxQkFDRjtpQkFDRjthQUNGO1NBQ0Y7S0FDRjtDQUNGLENBQUMsQ0FBQSJ9