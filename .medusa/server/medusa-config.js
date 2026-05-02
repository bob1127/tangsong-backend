"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 👇 注意這裡多匯入了 Modules
const utils_1 = require("@medusajs/framework/utils");
(0, utils_1.loadEnv)(process.env.NODE_ENV || 'development', process.cwd());
module.exports = (0, utils_1.defineConfig)({
    admin: {
        disable: process.env.DISABLE_MEDUSA_ADMIN === "true" || false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkdXNhLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21lZHVzYS1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQkFBc0I7QUFDdEIscURBQTBFO0FBRTFFLElBQUEsZUFBTyxFQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtBQUU3RCxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUEsb0JBQVksRUFBQztJQUM1QixLQUFLLEVBQUU7UUFDTixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsS0FBSyxNQUFNLElBQUksS0FBSztLQUM3RDtJQUNELGFBQWEsRUFBRTtRQUNiLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVk7UUFDckMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7UUFFcEYscUJBQXFCLEVBQUU7WUFDckIsdUJBQXVCLEVBQUUsS0FBSztZQUM5QixpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLEdBQUcsRUFBRSxFQUFFO1lBQ1AsR0FBRyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFO1NBQ25DO1FBRUQsSUFBSSxFQUFFO1lBQ0osU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVztZQUNsQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFXO1lBQ2xDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVU7WUFDaEMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLGFBQWE7WUFDbEQsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLGFBQWE7U0FDekQ7S0FDRjtJQUNELE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRTtZQUNKLE9BQU8sRUFBRSxvQkFBb0I7U0FDOUI7UUFDRCxvQkFBb0I7UUFDcEIsQ0FBQyxlQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDZCxPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsT0FBTyxFQUFFLDBCQUEwQjt3QkFDbkMsRUFBRSxFQUFFLFdBQVc7cUJBQ2hCO29CQUNGO3dCQUNHLE9BQU8sRUFBRSx1QkFBdUI7d0JBQ2hDLEVBQUUsRUFBRSxRQUFRO3dCQUNaLE9BQU8sRUFBRTs0QkFDUCxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0I7NEJBQ3RDLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQjs0QkFDOUMsZ0NBQWdDOzRCQUNoQyxXQUFXLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUscUJBQXFCO3lCQUM1RDtxQkFDRjtvQkFDRCxrQ0FBa0M7b0JBQ2xDOzs7Ozs7Ozs7O3NCQVVFO2lCQUNIO2FBQ0Y7U0FDRjtRQUNELFFBQVEsRUFBRTtZQUNSLE9BQU8sRUFBRSxzQkFBc0I7U0FDaEM7UUFDRCxNQUFNLEVBQUU7WUFDTixPQUFPLEVBQUUsZ0JBQWdCO1lBQ3pCLE9BQU8sRUFBRTtnQkFDUCxTQUFTLEVBQUU7b0JBQ1Q7d0JBQ0UsT0FBTyxFQUFFLG1CQUFtQjt3QkFDNUIsRUFBRSxFQUFFLElBQUk7d0JBQ1IsT0FBTyxFQUFFOzRCQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7NEJBQ2pDLGFBQWEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQjs0QkFDM0MsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0I7NEJBQ25ELE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzdCLE1BQU0sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVM7NEJBQzdCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVc7NEJBQ2pDLHdCQUF3QixFQUFFO2dDQUN4QixjQUFjLEVBQUUsSUFBSTs2QkFDckI7eUJBQ0Y7cUJBQ0Y7aUJBQ0Y7YUFDRjtTQUNGO0tBQ0Y7Q0FDRixDQUFDLENBQUEifQ==