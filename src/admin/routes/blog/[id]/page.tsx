// src/admin/routes/blog/[id]/page.tsx
import { useState, useEffect } from "react";
import {
  Container,
  Heading,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  toast,
  Switch,
} from "@medusajs/ui";
import { useNavigate, useParams } from "react-router-dom";

// @ts-ignore
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// 🌟 統一設定後端網址
const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "https://tangsong-production.up.railway.app";

export default function EditArticlePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState("false");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const [schemaType, setSchemaType] = useState("BlogPost");
  const [schemaHeadline, setSchemaHeadline] = useState("");
  const [schemaDescription, setSchemaDescription] = useState("");
  const [schemaKeywords, setSchemaKeywords] = useState("");
  const [schemaSpeakable, setSchemaSpeakable] = useState("Disable");

  const [datePublished, setDatePublished] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [authorType, setAuthorType] = useState("Person");
  const [authorName, setAuthorName] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");

  const [enableFaq, setEnableFaq] = useState(false);
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>([]);

  const [enableHowTo, setEnableHowTo] = useState(false);
  const [howToTitle, setHowToTitle] = useState("");
  const [howToDesc, setHowToDesc] = useState("");
  const [howToSteps, setHowToSteps] = useState<
    { name: string; text: string }[]
  >([]);

  const addFaq = () => setFaqs([...faqs, { q: "", a: "" }]);
  const updateFaq = (i: number, f: "q" | "a", v: string) => {
    const n = [...faqs];
    n[i][f] = v;
    setFaqs(n);
  };
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));

  const addHowTo = () => setHowToSteps([...howToSteps, { name: "", text: "" }]);
  const updateHowTo = (i: number, f: "name" | "text", v: string) => {
    const n = [...howToSteps];
    n[i][f] = v;
    setHowToSteps(n);
  };
  const removeHowTo = (i: number) =>
    setHowToSteps(howToSteps.filter((_, idx) => idx !== i));

  // ==========================
  // 💡 圖片上傳處理邏輯 (已修正為絕對路徑)
  // ==========================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await fetch(`${BACKEND_URL}/admin/uploads`, {
        method: "POST",
        credentials: "include", // 🌟 必須帶上通行證
        body: formData,
      });

      const textData = await res.text();
      if (!res.ok) throw new Error(`上傳失敗 (${res.status}): ${textData}`);

      const data = JSON.parse(textData);
      const uploadedUrl = data.files?.[0]?.url || data.uploads?.[0]?.url;

      if (uploadedUrl) {
        setThumbnail(uploadedUrl);
        toast.success("圖片上傳成功！");
      }
    } catch (error: any) {
      console.error("❌ [Upload] 圖片上傳發生錯誤:", error);
      toast.error("發生錯誤", { description: error.message });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ==========================
  // 💡 讀取文章邏輯 (已修正為絕對路徑與除錯輸出)
  // ==========================
  useEffect(() => {
    const fetchArticle = async () => {
      console.log(`🚀 [EditArticle] 開始抓取文章 (ID: ${id})...`);
      try {
        const res = await fetch(`${BACKEND_URL}/admin/articles/${id}`, {
          credentials: "include", // 🌟 必須帶上通行證
        });

        console.log(
          `📥 [EditArticle] API 回應狀態: ${res.status} ${res.statusText}`,
        );
        const textData = await res.text();

        if (!res.ok)
          throw new Error(`找不到該文章 (${res.status}): ${textData}`);

        const data = JSON.parse(textData);
        console.log("✅ [EditArticle] 成功解析文章資料:", data);
        const a = data.article;

        setTitle(a.title || "");
        setHandle(a.handle || "");
        setThumbnail(a.thumbnail || "");
        setContent(a.content || "");
        setIsPublished(a.is_published ? "true" : "false");
        setSeoTitle(a.seo_title || "");
        setSeoDesc(a.seo_description || "");
        setSeoKeywords(a.seo_keywords || "");

        const savedSchema = a.faq_schema || a.schema_data;

        if (savedSchema && savedSchema["@graph"]) {
          const graph = savedSchema["@graph"];

          const articleNode = graph.find((n: any) =>
            ["Article", "BlogPosting", "NewsArticle"].includes(n["@type"]),
          );
          if (articleNode) {
            setSchemaType(
              articleNode["@type"] === "BlogPosting"
                ? "BlogPost"
                : articleNode["@type"],
            );
            setSchemaHeadline(
              articleNode.headline !== a.title &&
                articleNode.headline !== a.seo_title
                ? articleNode.headline || ""
                : "",
            );
            setSchemaDescription(
              articleNode.description !== a.seo_description
                ? articleNode.description || ""
                : "",
            );
            setSchemaKeywords(
              articleNode.keywords !== a.seo_keywords
                ? articleNode.keywords || ""
                : "",
            );
            setSchemaSpeakable(articleNode.speakable ? "Enable" : "Disable");
            if (articleNode.image && articleNode.image.length > 0)
              setImageUrl(articleNode.image[0]);
            if (articleNode.datePublished) {
              const d = new Date(articleNode.datePublished);
              if (!isNaN(d.getTime()))
                setDatePublished(d.toISOString().split("T")[0]);
            }
            if (articleNode.author) {
              setAuthorType(articleNode.author["@type"] || "Person");
              setAuthorName(
                articleNode.author.name === "唐宋珠寶"
                  ? ""
                  : articleNode.author.name || "",
              );
              setAuthorUrl(articleNode.author.url || "");
            }
          }

          const faqNode = graph.find((n: any) => n["@type"] === "FAQPage");
          if (faqNode && faqNode.mainEntity) {
            setEnableFaq(true);
            setFaqs(
              faqNode.mainEntity.map((q: any) => ({
                q: q.name,
                a: q.acceptedAnswer?.text || "",
              })),
            );
          } else {
            setEnableFaq(false);
          }

          const howToNode = graph.find((n: any) => n["@type"] === "HowTo");
          if (howToNode && howToNode.step) {
            setEnableHowTo(true);
            setHowToTitle(howToNode.name || "");
            setHowToDesc(howToNode.description || "");
            setHowToSteps(
              howToNode.step.map((s: any) => ({
                name: s.name,
                text: s.itemListElement?.text || "",
              })),
            );
          } else {
            setEnableHowTo(false);
          }
        }
      } catch (error: any) {
        console.error("❌ [EditArticle] 抓取過程發生錯誤:", error);
        toast.error("讀取失敗", {
          description: error.message || "無法載入文章內容",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const generateJsonLdPreview = () => {
    const graph: any[] = [];

    const baseArticle: any = {
      "@type": schemaType === "BlogPost" ? "BlogPosting" : schemaType,
      headline: schemaHeadline || seoTitle || title || "文章標題",
      description: schemaDescription || seoDesc || "",
      keywords: schemaKeywords || seoKeywords || "",
      author: {
        "@type": authorType,
        name: authorName || "唐宋珠寶",
        ...(authorUrl && { url: authorUrl }),
      },
      publisher: {
        "@type": "Organization",
        name: "唐宋珠寶",
        logo: {
          "@type": "ImageObject",
          url: "https://tangsong.com.tw/logo.png",
        },
      },
    };

    if (imageUrl) baseArticle.image = [imageUrl];
    if (datePublished) {
      try {
        baseArticle.datePublished = new Date(datePublished).toISOString();
        baseArticle.dateModified = new Date(datePublished).toISOString();
      } catch (e) {}
    }

    if (schemaSpeakable === "Enable") {
      baseArticle.speakable = {
        "@type": "SpeakableSpecification",
        cssSelector: [],
      };
    }
    graph.push(baseArticle);

    if (enableFaq && faqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      });
    }

    if (enableHowTo && howToSteps.length > 0) {
      graph.push({
        "@type": "HowTo",
        name: howToTitle || seoTitle || title,
        description: howToDesc || seoDesc,
        step: howToSteps.map((step) => ({
          "@type": "HowToStep",
          name: step.name,
          itemListElement: { "@type": "HowToDirection", text: step.text },
        })),
      });
    }
    return JSON.stringify(
      { "@context": "https://schema.org", "@graph": graph },
      null,
      2,
    );
  };

  // ==========================
  // 💡 更新文章邏輯 (已修正為絕對路徑)
  // ==========================
  const handleUpdate = async () => {
    if (!title || !handle) return toast.error("標題與網址代稱不可為空！");
    setIsSaving(true);
    console.log("🚀 [EditArticle] 準備更新文章...");
    try {
      const schemaData = JSON.parse(generateJsonLdPreview());

      const payload = {
        title,
        handle,
        thumbnail,
        content,
        is_published: isPublished === "true",
        seo_title: seoTitle,
        seo_description: seoDesc,
        seo_keywords: seoKeywords,
        schema_type: schemaType,
        faq_schema: schemaData,
        schema_data: schemaData,
      };

      console.log("📤 [EditArticle] 即將送出的 Payload:", payload);

      const res = await fetch(`${BACKEND_URL}/admin/articles/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🌟 必須帶上通行證
        body: JSON.stringify(payload),
      });

      const textData = await res.text();
      console.log(`📥 [EditArticle] API 回應狀態: ${res.status}`);

      if (!res.ok) throw new Error(`更新失敗 (${res.status}): ${textData}`);

      toast.success("成功", { description: "文章已成功更新！" });
    } catch (error: any) {
      console.error("❌ [EditArticle] 更新過程發生嚴重錯誤:", error);
      toast.error("發生錯誤", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================
  // 💡 刪除文章邏輯 (已修正為絕對路徑)
  // ==========================
  const handleDelete = async () => {
    if (!window.confirm("確定要刪除這篇文章嗎？此動作無法復原！")) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/articles/${id}`, {
        method: "DELETE",
        credentials: "include", // 🌟 必須帶上通行證
      });

      if (!res.ok) throw new Error(`刪除失敗 (${res.status})`);

      toast.success("已刪除", { description: "文章已從資料庫移除。" });
      navigate("/blog");
    } catch (error: any) {
      console.error("❌ [EditArticle] 刪除過程發生嚴重錯誤:", error);
      toast.error("刪除失敗", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading)
    return (
      <Container className="p-8 text-gray-500">正在載入文章資料...</Container>
    );

  return (
    <Container className="p-8 flex flex-col gap-6 max-w-[1400px] mx-auto bg-gray-50/50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="transparent" onClick={() => navigate("/blog")}>
            ← 返回
          </Button>
          <Heading level="h1">編輯文章</Heading>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleDelete}
            variant="danger"
            isLoading={isDeleting}
            className="bg-red-50 text-red-500 hover:bg-red-100 border-none shadow-none"
          >
            刪除文章
          </Button>
          <div className="w-[120px]">
            <Select value={isPublished} onValueChange={setIsPublished}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="false">📝 存為草稿</Select.Item>
                <Select.Item value="true">🟢 立即發布</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <Button
            onClick={handleUpdate}
            variant="primary"
            isLoading={isSaving}
            className="bg-[#5A1216] text-white hover:bg-[#3A0A0E]"
          >
            更新儲存
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setActiveTab("content")}
          className={`font-bold pb-2 transition-colors ${activeTab === "content" ? "border-b-2 border-[#5A1216] text-[#5A1216]" : "text-gray-500 hover:text-black"}`}
        >
          內容編輯器
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`font-bold pb-2 transition-colors ${activeTab === "seo" ? "border-b-2 border-[#5A1216] text-[#5A1216]" : "text-gray-500 hover:text-black"}`}
        >
          Rank Math SEO 模組
        </button>
      </div>

      {activeTab === "content" && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>文章標題 *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="輸入標題..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>網址代稱 (Slug) *</Label>
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="例如: how-to-choose-gold"
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-md shadow-sm border border-gray-200 flex flex-col gap-4">
            <Heading level="h3" className="text-sm font-bold text-stone-800">
              文章主圖 (Thumbnail)
            </Heading>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 flex flex-col gap-3 w-full">
                <Label className="text-xs text-stone-500">
                  上傳圖片 或 貼上圖片網址
                </Label>
                <div className="flex gap-3 items-center">
                  <Input
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-white"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="thumbnail-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="secondary"
                    onClick={() =>
                      document.getElementById("thumbnail-upload")?.click()
                    }
                    isLoading={isUploading}
                    className="shrink-0"
                  >
                    ↑ 上傳圖片
                  </Button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  建議尺寸：橫式 1200 x 630px。支援 JPG, PNG, WEBP 格式。
                </p>
              </div>

              {thumbnail ? (
                <div className="w-[180px] h-[100px] rounded border border-stone-200 overflow-hidden shrink-0 bg-stone-50">
                  <img
                    src={thumbnail}
                    alt="預覽"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-[180px] h-[100px] rounded border border-dashed border-stone-300 flex items-center justify-center shrink-0 bg-stone-50 text-stone-400 text-xs">
                  尚未設定圖片
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>文章內容</Label>
            <div className="bg-white rounded-md shadow-sm">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                className="h-[500px] mb-12 border-none"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "seo" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in items-start">
          <div className="xl:col-span-7 flex flex-col gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
              <Heading
                level="h3"
                className="text-base font-bold flex items-center gap-2"
              >
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span> 預覽 (Snippet Editor)
              </Heading>
              <div className="p-4 border border-gray-200 rounded-md font-sans bg-white max-w-[600px]">
                <div className="text-[14px] text-[#202124] mb-1 flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#5A1216] rounded-full flex items-center justify-center text-white text-[10px] font-bold tracking-widest">
                    TS
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-[14px] text-[#202124]">
                      唐宋珠寶 Tangsong
                    </span>
                    <span className="text-[12px] text-[#4d5156] truncate max-w-[300px]">
                      https://tangsong.com.tw/blog/{handle || "your-slug"}
                    </span>
                  </div>
                </div>
                <div className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer mb-1 leading-snug">
                  {seoTitle || title || "請輸入 SEO 標題"}
                </div>
                <div className="text-[14px] text-[#4d5156] line-clamp-2 leading-snug">
                  {seoDesc ||
                    "請輸入 Meta Description。一段吸引人的描述可以大幅提升使用者在搜尋結果點擊進入網站的機率..."}
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-gray-500">
                    SEO 標題 (Title)
                  </Label>
                  <Input
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="建議長度 50-60 字元"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-gray-500">
                    SEO 描述 (Description)
                  </Label>
                  <Textarea
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    rows={3}
                    placeholder="建議長度 120-160 字元"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-gray-500">
                    焦點關鍵字 (Focus Keyword)
                  </Label>
                  <Input
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                    placeholder="(例) 黃金回收, 珠寶鑑定"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-6">
              <Heading level="h3" className="text-base font-bold border-b pb-2">
                Schema Builder (結構化模組)
              </Heading>

              <div className="flex flex-col gap-4 bg-gray-50 p-5 rounded border border-gray-200">
                <Label className="font-bold text-[#5A1216] text-lg">
                  Article 標記 (預設啟用)
                </Label>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-bold text-gray-700">
                    HEADLINE <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={schemaHeadline}
                    onChange={(e) => setSchemaHeadline(e.target.value)}
                    placeholder="%seo_title%"
                    className="bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-bold text-gray-700">
                    DESCRIPTION
                  </Label>
                  <Textarea
                    value={schemaDescription}
                    onChange={(e) => setSchemaDescription(e.target.value)}
                    rows={3}
                    placeholder="%seo_description%"
                    className="bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-bold text-gray-700">
                    KEYWORDS <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={schemaKeywords}
                    onChange={(e) => setSchemaKeywords(e.target.value)}
                    placeholder="%keywords%"
                    className="bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-gray-700">
                      DATE PUBLISHED
                    </Label>
                    <Input
                      type="date"
                      value={datePublished}
                      onChange={(e) => setDatePublished(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-gray-700">
                      IMAGE URL
                    </Label>
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4 p-4 border border-gray-200 rounded bg-white">
                  <Label className="font-bold text-sm text-gray-800 border-b pb-1">
                    作者資訊 (Author)
                  </Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-gray-600">作者類型</Label>
                      <Select value={authorType} onValueChange={setAuthorType}>
                        <Select.Trigger className="bg-white">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="Person">
                            Person (個人)
                          </Select.Item>
                          <Select.Item value="Organization">
                            Organization (公司)
                          </Select.Item>
                        </Select.Content>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-gray-600">作者名稱</Label>
                      <Input
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="(例) 王小美 或 唐宋珠寶"
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <Label className="text-xs text-gray-600">
                      專屬網址 (URL)
                    </Label>
                    <Input
                      value={authorUrl}
                      onChange={(e) => setAuthorUrl(e.target.value)}
                      placeholder="(例) https://tangsong.com.tw/about"
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-gray-700">
                      ARTICLE TYPE <span className="text-red-500">*</span>
                    </Label>
                    <Select value={schemaType} onValueChange={setSchemaType}>
                      <Select.Trigger className="bg-white">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="Article">Article</Select.Item>
                        <Select.Item value="BlogPost">Blog Post</Select.Item>
                        <Select.Item value="NewsArticle">
                          News Article
                        </Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-bold text-gray-700">
                      ENABLE SPEAKABLE
                    </Label>
                    <Select
                      value={schemaSpeakable}
                      onValueChange={setSchemaSpeakable}
                    >
                      <Select.Trigger className="bg-white">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="Disable">Disable</Select.Item>
                        <Select.Item value="Enable">Enable</Select.Item>
                      </Select.Content>
                    </Select>
                  </div>
                </div>
              </div>

              <div
                className={`flex flex-col gap-4 p-4 rounded border transition-colors ${enableFaq ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-white"}`}
              >
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-blue-800 flex items-center gap-2">
                    <span className="text-lg">💬</span> FAQ 常見問答模組
                  </Label>
                  <Switch checked={enableFaq} onCheckedChange={setEnableFaq} />
                </div>
                {enableFaq && (
                  <div className="flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 border rounded shadow-sm relative group flex flex-col gap-2"
                      >
                        <button
                          onClick={() => removeFaq(idx)}
                          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                        <Input
                          value={faq.q}
                          onChange={(e) => updateFaq(idx, "q", e.target.value)}
                          placeholder="問題 (Question)..."
                          className="font-bold text-sm"
                        />
                        <Textarea
                          value={faq.a}
                          onChange={(e) => updateFaq(idx, "a", e.target.value)}
                          placeholder="解答 (Answer)..."
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={addFaq}
                      className="self-start"
                    >
                      + 新增問題
                    </Button>
                  </div>
                )}
              </div>

              <div
                className={`flex flex-col gap-4 p-4 rounded border transition-colors ${enableHowTo ? "border-green-300 bg-green-50/30" : "border-gray-200 bg-white"}`}
              >
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-green-800 flex items-center gap-2">
                    <span className="text-lg">🛠️</span> HowTo 教學模組
                  </Label>
                  <Switch
                    checked={enableHowTo}
                    onCheckedChange={setEnableHowTo}
                  />
                </div>
                {enableHowTo && (
                  <div className="flex flex-col gap-4 animate-in slide-in-from-top-2">
                    <Input
                      value={howToTitle}
                      onChange={(e) => setHowToTitle(e.target.value)}
                      placeholder="教學大標題 (留空預設同文章標題)"
                    />
                    <Textarea
                      value={howToDesc}
                      onChange={(e) => setHowToDesc(e.target.value)}
                      placeholder="教學簡介..."
                      rows={2}
                    />
                    <div className="flex flex-col gap-2 mt-2">
                      <Label className="font-bold text-sm text-green-800">
                        步驟清單 (Steps)
                      </Label>
                      {howToSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 border rounded shadow-sm relative group flex flex-col gap-2"
                        >
                          <button
                            onClick={() => removeHowTo(idx)}
                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                          <Input
                            value={step.name}
                            onChange={(e) =>
                              updateHowTo(idx, "name", e.target.value)
                            }
                            placeholder={`步驟 ${idx + 1} 名稱...`}
                            className="font-bold text-sm"
                          />
                          <Textarea
                            value={step.text}
                            onChange={(e) =>
                              updateHowTo(idx, "text", e.target.value)
                            }
                            placeholder="步驟詳細說明..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      ))}
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={addHowTo}
                        className="self-start"
                      >
                        + 新增步驟
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-5 h-[800px] sticky top-4">
            <div className="w-full h-full bg-[#1E1E1E] rounded-lg p-5 text-[#9CDCFE] font-mono text-[11px] md:text-xs overflow-auto shadow-xl border border-gray-800 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                  <span className="text-gray-300 ml-2 font-sans font-bold text-sm tracking-wider">
                    JSON-LD 程式碼驗證器
                  </span>
                </div>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto">
                {generateJsonLdPreview()}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
