import { useState, useEffect } from "react";
import { Container, Heading, Button, Input, Label, toast } from "@medusajs/ui";
import { PhotoSolid } from "@medusajs/icons"; // 💡 引入 Medusa 官方 Icon

// 💡 註冊到左側選單的關鍵設定 (加上 icon 確保一定會顯示)
export const config = {
  link: {
    label: "首頁輪播",
    icon: PhotoSolid,
  },
};

export default function HomeSliderSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading1, setIsUploading1] = useState(false);
  const [isUploading2, setIsUploading2] = useState(false);

  // 兩張 Slide 的狀態
  const [slide1, setSlide1] = useState({
    id: "",
    title: "",
    description: "",
    thumbnail: "",
  });
  const [slide2, setSlide2] = useState({
    id: "",
    title: "",
    description: "",
    thumbnail: "",
  });

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        // 抓取所有文章來篩選出我們的隱藏輪播圖
        const res = await fetch(`/admin/articles`);
        const data = await res.json();
        const articles = data.articles || [];

        const s1 = articles.find((a: any) => a.handle === "home-hero-1");
        const s2 = articles.find((a: any) => a.handle === "home-hero-2");

        if (s1)
          setSlide1({
            id: s1.id,
            title: s1.title,
            description: s1.seo_description || "",
            thumbnail: s1.thumbnail || "",
          });
        if (s2)
          setSlide2({
            id: s2.id,
            title: s2.title,
            description: s2.seo_description || "",
            thumbnail: s2.thumbnail || "",
          });
      } catch (error) {
        toast.error("讀取失敗");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // 圖片上傳邏輯
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slideNum: 1 | 2,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    slideNum === 1 ? setIsUploading1(true) : setIsUploading2(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await fetch("/admin/uploads", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("上傳失敗");
      const data = await res.json();
      const uploadedUrl = data.files?.[0]?.url || data.uploads?.[0]?.url;

      if (uploadedUrl) {
        if (slideNum === 1) setSlide1({ ...slide1, thumbnail: uploadedUrl });
        if (slideNum === 2) setSlide2({ ...slide2, thumbnail: uploadedUrl });
        toast.success(`圖片 ${slideNum} 上傳成功！`);
      }
    } catch (error: any) {
      toast.error("上傳失敗", { description: error.message });
    } finally {
      slideNum === 1 ? setIsUploading1(false) : setIsUploading2(false);
      e.target.value = "";
    }
  };

  // 儲存邏輯
  const saveSlide = async (slideData: any, handle: string) => {
    const payload = {
      title: slideData.title || "未命名主圖",
      handle: handle,
      seo_description: slideData.description,
      thumbnail: slideData.thumbnail,
      is_published: true,
      content: "<p>這是首頁輪播專用資料，請勿刪除。</p>",
    };

    if (slideData.id) {
      await fetch(`/admin/articles/${slideData.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch(`/admin/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
  };

  const handleUpdateAll = async () => {
    setIsSaving(true);
    try {
      await saveSlide(slide1, "home-hero-1");
      await saveSlide(slide2, "home-hero-2");
      toast.success("成功", { description: "首頁輪播更新完成！" });
    } catch (error) {
      toast.error("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <Container className="p-8 text-stone-500">正在載入設定...</Container>
    );

  return (
    <Container className="p-8 flex flex-col gap-8 max-w-[900px] mx-auto bg-stone-50/50">
      <div className="flex justify-between items-center border-b pb-4">
        <Heading level="h1" className="text-2xl font-bold">
          首頁輪播設定 (Hero Slider)
        </Heading>
        <Button
          onClick={handleUpdateAll}
          variant="primary"
          isLoading={isSaving}
          className="bg-[#5A1216] text-white hover:bg-[#3A0A0E]"
        >
          更新輪播圖
        </Button>
      </div>

      {/* 第一張 Slide */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 flex flex-col gap-4">
        <Heading level="h2" className="text-lg font-bold text-[#5A1216]">
          1️⃣ 第一張主視覺
        </Heading>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>大標題 (Title)</Label>
            <Input
              value={slide1.title}
              onChange={(e) => setSlide1({ ...slide1, title: e.target.value })}
              placeholder="例如: 唐宋珠寶"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>小描述 (Description)</Label>
            <Input
              value={slide1.description}
              onChange={(e) =>
                setSlide1({ ...slide1, description: e.target.value })
              }
              placeholder="例如: 頂級工藝"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Label>背景圖片</Label>
          <div className="flex gap-4 items-center">
            <Input
              value={slide1.thumbnail}
              onChange={(e) =>
                setSlide1({ ...slide1, thumbnail: e.target.value })
              }
              placeholder="圖片網址..."
              className="flex-1 bg-white"
            />
            <input
              type="file"
              id="upload-1"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 1)}
            />
            <Button
              variant="secondary"
              onClick={() => document.getElementById("upload-1")?.click()}
              isLoading={isUploading1}
            >
              上傳圖片
            </Button>
          </div>
        </div>
        {slide1.thumbnail && (
          <img
            src={slide1.thumbnail}
            alt="預覽"
            className="h-40 w-full rounded border object-cover mt-2"
          />
        )}
      </div>

      {/* 第二張 Slide */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 flex flex-col gap-4">
        <Heading level="h2" className="text-lg font-bold text-[#5A1216]">
          2️⃣ 第二張主視覺
        </Heading>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>大標題 (Title)</Label>
            <Input
              value={slide2.title}
              onChange={(e) => setSlide2({ ...slide2, title: e.target.value })}
              placeholder="例如: 傳承永恆"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>小描述 (Description)</Label>
            <Input
              value={slide2.description}
              onChange={(e) =>
                setSlide2({ ...slide2, description: e.target.value })
              }
              placeholder="例如: 鑽石珠寶"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Label>背景圖片</Label>
          <div className="flex gap-4 items-center">
            <Input
              value={slide2.thumbnail}
              onChange={(e) =>
                setSlide2({ ...slide2, thumbnail: e.target.value })
              }
              placeholder="圖片網址..."
              className="flex-1 bg-white"
            />
            <input
              type="file"
              id="upload-2"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 2)}
            />
            <Button
              variant="secondary"
              onClick={() => document.getElementById("upload-2")?.click()}
              isLoading={isUploading2}
            >
              上傳圖片
            </Button>
          </div>
        </div>
        {slide2.thumbnail && (
          <img
            src={slide2.thumbnail}
            alt="預覽"
            className="h-40 w-full rounded border object-cover mt-2"
          />
        )}
      </div>
    </Container>
  );
}
