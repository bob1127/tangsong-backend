import { useState, useEffect } from "react"
import { Container, Heading, Button, Input, Label, toast } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PhotoSolid } from "@medusajs/icons"
import {
  adminFetch,
  adminUpload,
  formatAdminFetchError,
} from "../../lib/admin-fetch"

export const config = defineRouteConfig({
  label: "首頁輪播",
  icon: PhotoSolid,
})

const DEFAULT_HERO_CAROUSEL_IMAGES = [
  "/images/e48dcfbd-a446-4d95-98e0-1e92f6a16047.png",
  "/images/0001.jpg",
  "/images/18e59f52-18b7-413b-a783-ff21e3c51ad3.png",
  "/images/0002.jpg",
]

const SLOT_COUNT = DEFAULT_HERO_CAROUSEL_IMAGES.length

function createEmptyImages(): string[] {
  return Array.from({ length: SLOT_COUNT }, () => "")
}

export default function HomeSliderSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [images, setImages] = useState<string[]>(createEmptyImages)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const { data } = await adminFetch("/admin/hero-carousel")
        const payload = data as { configured?: string[] }
        const configured = payload.configured || createEmptyImages()

        setImages(
          Array.from({ length: SLOT_COUNT }, (_, index) => configured[index] || "")
        )
      } catch (error) {
        toast.error("讀取失敗", { description: formatAdminFetchError(error) })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  const handleImageChange = (index: number, value: string) => {
    setImages((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingIndex(index)
    try {
      const uploadedUrl = await adminUpload(file)
      if (!uploadedUrl) throw new Error("未取得圖片網址")

      handleImageChange(index, uploadedUrl)
      toast.success(`第 ${index + 1} 張圖片上傳成功`)
    } catch (error) {
      toast.error("上傳失敗", { description: formatAdminFetchError(error) })
    } finally {
      setUploadingIndex(null)
      event.target.value = ""
    }
  }

  const handleClearImage = (index: number) => {
    handleImageChange(index, "")
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await adminFetch("/admin/hero-carousel", {
        method: "POST",
        body: JSON.stringify({ images }),
      })
      toast.success("成功", { description: "首頁輪播圖已更新" })
    } catch (error) {
      toast.error("儲存失敗", { description: formatAdminFetchError(error) })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Container className="p-8 text-stone-500">正在載入設定...</Container>
    )
  }

  return (
    <Container className="p-8 flex flex-col gap-8 max-w-[900px] mx-auto bg-stone-50/50">
      <div className="flex justify-between items-center border-b pb-4 gap-4">
        <div>
          <Heading level="h1" className="text-2xl font-bold">
            首頁輪播設定 (Hero Carousel)
          </Heading>
          <p className="text-sm text-stone-500 mt-2">
            可上傳 4 張背景圖。若某格留空，前台會使用預設圖片。
          </p>
        </div>
        <Button
          onClick={handleSave}
          variant="primary"
          isLoading={isSaving}
          className="bg-[#5A1216] text-white hover:bg-[#b62f26] shrink-0"
        >
          儲存輪播圖
        </Button>
      </div>

      {Array.from({ length: SLOT_COUNT }, (_, index) => {
        const previewUrl =
          images[index]?.trim() || DEFAULT_HERO_CAROUSEL_IMAGES[index]

        return (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-stone-200 flex flex-col gap-4"
          >
            <Heading level="h2" className="text-lg font-bold text-[#5A1216]">
              {index + 1}️⃣ 輪播圖 {index + 1}
            </Heading>

            <div className="flex flex-col gap-2">
              <Label>背景圖片網址</Label>
              <div className="flex gap-4 items-center">
                <Input
                  value={images[index] || ""}
                  onChange={(event) =>
                    handleImageChange(index, event.target.value)
                  }
                  placeholder="留空則使用預設圖"
                  className="flex-1 bg-white"
                />
                <input
                  type="file"
                  id={`hero-upload-${index}`}
                  className="hidden"
                  accept="image/*"
                  onChange={(event) => handleFileUpload(event, index)}
                />
                <Button
                  variant="secondary"
                  onClick={() =>
                    document.getElementById(`hero-upload-${index}`)?.click()
                  }
                  isLoading={uploadingIndex === index}
                >
                  上傳圖片
                </Button>
                {images[index] ? (
                  <Button
                    variant="transparent"
                    onClick={() => handleClearImage(index)}
                  >
                    清除
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>預覽（含預設圖 fallback）</Label>
              <img
                src={previewUrl}
                alt={`輪播圖 ${index + 1} 預覽`}
                className="h-40 w-full rounded border object-cover"
              />
            </div>
          </div>
        )
      })}
    </Container>
  )
}
