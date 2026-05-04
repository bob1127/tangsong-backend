// src/admin/routes/blog/page.tsx
import { useEffect, useState } from "react";
import {
  Container,
  Heading,
  Button,
  Table,
  StatusBadge,
  toast,
} from "@medusajs/ui";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DocumentText } from "@medusajs/icons";
import { useNavigate } from "react-router-dom";

// 💡 頁面導航設定
export const config = defineRouteConfig({
  label: "文章管理 (Blog)",
  icon: DocumentText,
});

export default function BlogListPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // 抓取文章列表 (武裝除錯版)
  const fetchArticles = async () => {
    console.log("🚀 [BlogList] 開始抓取文章列表...");
    try {
      const res = await fetch("/admin/articles", {
        credentials: "include",
      });

      console.log(
        `📥 [BlogList] API 回應狀態: ${res.status} ${res.statusText}`,
      );

      // 💡 先把回傳結果轉成純文字，避免 JSON.parse 直接死掉
      const textData = await res.text();
      console.log("📦 [BlogList] 後端原始回傳內容:", textData);

      if (!res.ok) {
        throw new Error(`伺服器拒絕請求 (${res.status}): ${textData}`);
      }

      // 確認有資料才轉 JSON
      const data = textData ? JSON.parse(textData) : {};
      console.log("✅ [BlogList] 成功解析的 JSON 資料:", data);

      setArticles(data.articles || []);
    } catch (error: any) {
      console.error("❌ [BlogList] 抓取過程發生嚴重錯誤:", error);
      toast.error("無法載入文章列表", {
        description: error.message || "請開啟 F12 查看詳細錯誤",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <Container className="p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <Heading level="h1">文章管理系統</Heading>
          <p className="text-gray-500 text-sm mt-1">
            管理你的部落格文章、SEO 設定與發布狀態。
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/blog/create")}
          className="bg-[#5A1216] text-white hover:bg-[#3A0A0E]"
        >
          + 新增文章
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">載入中...</p>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>標題</Table.HeaderCell>
              <Table.HeaderCell>網址代稱 (Slug)</Table.HeaderCell>
              <Table.HeaderCell>狀態</Table.HeaderCell>
              <Table.HeaderCell className="text-right">操作</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {articles.length === 0 ? (
              <Table.Row key="empty-row">
                <Table.Cell
                  {...({ colSpan: 4 } as any)}
                  className="text-center text-gray-500 py-8"
                >
                  目前還沒有任何文章，點擊右上角新增吧！
                </Table.Cell>
              </Table.Row>
            ) : (
              articles.map((article) => (
                <Table.Row key={article.id}>
                  <Table.Cell className="font-bold">{article.title}</Table.Cell>
                  <Table.Cell className="text-gray-500">
                    {article.handle}
                  </Table.Cell>
                  <Table.Cell>
                    {article.is_published ? (
                      <StatusBadge color="green">已發布</StatusBadge>
                    ) : (
                      <StatusBadge color="grey">草稿</StatusBadge>
                    )}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {/* 💡 修正：加上 onClick 跳轉到編輯頁面 */}
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => navigate(`/blog/${article.id}`)}
                    >
                      編輯
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      )}
    </Container>
  );
}
