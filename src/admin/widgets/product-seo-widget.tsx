// src/admin/widgets/product-seo-widget.tsx
import { useState } from "react";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import {
  Container,
  Heading,
  Button,
  Input,
  Label,
  Textarea,
  toast,
} from "@medusajs/ui";

// 設定 Widget 顯示的位置
export const config = defineWidgetConfig({
  zone: "product.details.after",
});

// 💡 關鍵修正：Medusa 傳入的參數名稱是 data！我們把它解構並命名為 product
export default function ProductSeoWidget({ data: product }: { data: any }) {
  // 💡 增加防護機制：如果頁面還在載入，或是沒有抓到商品，就不渲染，避免白畫面崩潰
  if (!product) return null;

  const [isSaving, setIsSaving] = useState(false);

  // 安全地讀取 metadata (使用 ?. 防止報錯)
  const initialSeo = product.metadata?.seo || {};
  const [seoTitle, setSeoTitle] = useState(initialSeo.seo_title || "");
  const [seoDesc, setSeoDesc] = useState(initialSeo.seo_description || "");
  const [brand, setBrand] = useState(initialSeo.brand || "唐宋珠寶");

  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    initialSeo.faqs || [],
  );

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index: number) =>
    setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaq = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/admin/products/${product.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 更新 metadata 的寫法
          metadata: {
            ...product.metadata,
            seo: {
              seo_title: seoTitle,
              seo_description: seoDesc,
              brand: brand,
              faqs: faqs,
              schema_data: JSON.parse(generateJsonLdPreview()),
            },
          },
        }),
      });

      if (!res.ok) throw new Error("儲存失敗");
      toast.success("成功", {
        description: "商品 SEO 與結構化資料已成功更新！",
      });
    } catch (error) {
      console.error(error);
      toast.error("錯誤", { description: "儲存失敗，請重試。" });
    } finally {
      setIsSaving(false);
    }
  };

  const generateJsonLdPreview = () => {
    // 加上額外的防護 (|| "")，確保就算商品缺少某些設定也不會崩潰
    const productSchema: any = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: seoTitle || product.title || "",
      description: seoDesc || product.description || "",
      image: product.images?.map((img: any) => img.url) || [],
      brand: {
        "@type": "Brand",
        name: brand,
      },
      sku: product.variants?.[0]?.sku || product.id, // 如果沒有 sku，退而求其次用 id

      offers: {
        "@type": "AggregateOffer",
        url: `https://tangsong.com.tw/products/${product.handle || ""}`,
        priceCurrency: "TWD",
        lowPrice: "1000",
        highPrice: "5000",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    };

    let finalSchema: any = productSchema;

    if (faqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      };
      finalSchema = [productSchema, faqSchema];
    }

    return JSON.stringify(finalSchema, null, 2);
  };

  return (
    <Container className="p-8 mt-8 flex flex-col gap-8 bg-white shadow-sm border border-gray-200">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <Heading level="h2" className="text-xl text-[#5A1216] font-bold">
            商品 SEO 與結構化資料 (Google Merchant Listing)
          </Heading>
          <p className="text-gray-500 text-sm mt-1">
            在這裡設定的資料將強化此商品在 Google
            搜尋結果與購物標籤中的顯示效果。
          </p>
        </div>
        <Button
          onClick={handleSave}
          variant="primary"
          isLoading={isSaving}
          className="bg-[#5A1216] hover:bg-[#3A0A0E] text-white"
        >
          儲存 SEO 設定
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* 左側輸入區 */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Heading level="h3" className="text-base font-bold">
              1. 搜尋結果摘要 (Product Snippet)
            </Heading>

            <div className="flex flex-col gap-2">
              <Label>自訂 SEO 標題 (SEO Title)</Label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={`留空預設使用：${product.title}`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>自訂 SEO 描述 (Meta Description)</Label>
              <Textarea
                value={seoDesc}
                onChange={(e) => setSeoDesc(e.target.value)}
                rows={3}
                placeholder="輸入吸引人的商品簡介..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>品牌名稱 (Brand) *</Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="唐宋珠寶"
              />
            </div>
          </div>

          {/* 問答 FAQ */}
          <div className="flex flex-col gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <Heading
                level="h3"
                className="text-base font-bold text-[#5A1216]"
              >
                2. 商品常見問答 (FAQ Schema)
              </Heading>
              <Button variant="secondary" size="small" onClick={addFaq}>
                + 新增問答
              </Button>
            </div>

            {faqs.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-4">
                目前無問答資料
              </p>
            )}

            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 p-4 bg-white rounded border border-gray-200 relative group"
              >
                <button
                  onClick={() => removeFaq(idx)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="flex flex-col gap-1 pr-6">
                  <Label className="text-xs text-gray-500">
                    問題 (Question)
                  </Label>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(idx, "question", e.target.value)}
                    placeholder="(例) 這款銀戒會過敏嗎？"
                  />
                </div>
                <div className="flex flex-col gap-1 pr-6">
                  <Label className="text-xs text-gray-500">解答 (Answer)</Label>
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                    rows={2}
                    placeholder="(例) 本產品採用 925 純銀..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側 JSON-LD */}
        <div className="flex flex-col gap-2 h-full">
          <Heading level="h3" className="text-base font-bold">
            JSON-LD 即時驗證
          </Heading>
          <div className="flex-1 bg-[#1E1E1E] rounded-lg p-5 text-[#9CDCFE] font-mono text-[11px] overflow-auto max-h-[700px] shadow-inner border border-gray-800">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {generateJsonLdPreview()}
            </pre>
          </div>
        </div>
      </div>
    </Container>
  );
}
