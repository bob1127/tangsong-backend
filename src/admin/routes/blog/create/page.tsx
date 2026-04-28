// src/admin/routes/blog/create/page.tsx
import { useState } from "react";
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
import { useNavigate } from "react-router-dom";

// @ts-ignore
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function CreateArticlePage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo">("seo");

  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
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

  const generateJsonLdPreview = () => {
    const graph: any[] = [];
    const baseArticle: any = {
      "@type": schemaType === "BlogPost" ? "BlogPosting" : schemaType,
      headline: schemaHeadline || seoTitle || title || "文章標題",
      description: schemaDescription || seoDesc || "",
      keywords: schemaKeywords || seoKeywords || "",
      author: { "@type": "Organization", name: "唐宋珠寶" },
    };

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
  // 💡 關鍵修正 3：新增儲存時也強制使用 faq_schema 送出
  // ==========================
  const handleSave = async () => {
    if (!title || !handle) return toast.error("標題與網址代稱不可為空！");
    setIsSaving(true);
    try {
      const schemaData = JSON.parse(generateJsonLdPreview());
      const res = await fetch("/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          handle,
          content,
          is_published: isPublished === "true",
          seo_title: seoTitle,
          seo_description: seoDesc,
          seo_keywords: seoKeywords,
          schema_type: schemaType,
          // 💡 強制使用資料庫認識的名字！
          faq_schema: schemaData,
        }),
      });
      if (!res.ok) throw new Error("儲存失敗");
      toast.success("成功", { description: "文章已成功儲存！" });
      navigate("/blog");
    } catch (error: any) {
      toast.error("發生錯誤", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container className="p-8 flex flex-col gap-6 max-w-[1400px] mx-auto bg-gray-50/50">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="transparent" onClick={() => navigate("/blog")}>
            ← 返回
          </Button>
          <Heading level="h1">撰寫新文章</Heading>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[120px]">
            <Select value={isPublished} onValueChange={setIsPublished}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="false">存為草稿</Select.Item>
                <Select.Item value="true">立即發布</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <Button
            onClick={handleSave}
            variant="primary"
            isLoading={isSaving}
            className="bg-[#5A1216] text-white hover:bg-[#3A0A0E]"
          >
            儲存文章
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setActiveTab("content")}
          className={`font-bold pb-2 transition-colors ${activeTab === "content" ? "border-b-2 border-[#000000] text-stone-800" : "text-gray-500 hover:text-black"}`}
        >
          內容編輯器
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`font-bold pb-2 transition-colors ${activeTab === "seo" ? "border-b-2 border-[#000000] text-stone-800" : "text-gray-500 hover:text-black"}`}
        >
          SEO setting
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
                <Label className="font-bold text-stone-800 text-lg">
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
                <div className="flex flex-col gap-1 mt-2">
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
                <div className="flex flex-col gap-1 mt-2">
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
              </div>

              <div
                className={`flex flex-col gap-4 p-4 rounded border transition-colors ${enableFaq ? "border-blue-300 bg-blue-50/30" : "border-gray-200 bg-white"}`}
              >
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-stone-800 flex items-center gap-2">
                    FAQ 常見問答
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
                  <Label className="font-bold text-stone-800 flex items-center gap-2">
                    HowTo 教學
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
                      <Label className="font-bold text-sm text-stone-800">
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
