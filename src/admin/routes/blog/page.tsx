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
import { adminFetch, formatAdminFetchError } from "../../lib/admin-fetch";

export const config = defineRouteConfig({
  label: "文章管理 (Blog)",
  icon: DocumentText,
});

export default function BlogListPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchArticles = async () => {
    try {
      const { data } = await adminFetch("/admin/articles");
      const payload = data as { articles?: any[] };
      setArticles(payload.articles || []);
    } catch (error: any) {
      console.error("❌ [BlogList]", error);
      toast.error("無法載入文章列表", {
        description: formatAdminFetchError(error),
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
          className="bg-[#5A1216] text-white hover:bg-[#b62f26]"
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
