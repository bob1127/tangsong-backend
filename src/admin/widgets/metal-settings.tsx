import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Input, Button, toast } from "@medusajs/ui";
import { useState, useEffect } from "react";

const MetalSettingsWidget = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    gold_sell: "",
    gold_buy: "",
    k18_buy: "",
    k14_buy: "",
    pt950_sell: "",
    pt950_buy: "",
    pd_sell: "",
    pd_buy: "",
  });

  // 確保抓到正確的 Railway 後端網址
  const backendUrl =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "";

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${backendUrl}/admin/metal-settings`, {
          // 🚀 關鍵修正 1：強制攜帶管理員 Cookie 到後端
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`狀態碼: ${res.status}`);

        const data = await res.json();
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings({
            gold_sell: String(data.settings.gold_sell ?? ""),
            gold_buy: String(data.settings.gold_buy ?? ""),
            k18_buy: String(data.settings.k18_buy ?? ""),
            k14_buy: String(data.settings.k14_buy ?? ""),
            pt950_sell: String(data.settings.pt950_sell ?? ""),
            pt950_buy: String(data.settings.pt950_buy ?? ""),
            pd_sell: String(data.settings.pd_sell ?? ""),
            pd_buy: String(data.settings.pd_buy ?? ""),
          });
        }
      } catch (err: any) {
        console.error("無法載入設定", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [backendUrl]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        gold_sell: Number(settings.gold_sell) || 0,
        gold_buy: Number(settings.gold_buy) || 0,
        k18_buy: Number(settings.k18_buy) || 0,
        k14_buy: Number(settings.k14_buy) || 0,
        pt950_sell: Number(settings.pt950_sell) || 0,
        pt950_buy: Number(settings.pt950_buy) || 0,
        pd_sell: Number(settings.pd_sell) || 0,
        pd_buy: Number(settings.pd_buy) || 0,
      };

      const res = await fetch(`${backendUrl}/admin/metal-settings`, {
        method: "POST",
        // 🚀 關鍵修正 2：強制攜帶管理員 Cookie 到後端
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`狀態碼: ${res.status}`);

      toast.success("牌告價設定已更新", {
        description: "前台即時行情將立即套用新的價格。",
      });
    } catch (err: any) {
      toast.error(`儲存失敗 (${err.message || "未知錯誤"})`);
      console.error("儲存失敗詳細錯誤:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading)
    return <div className="p-4 md:p-8 text-stone-500">載入設定中...</div>;

  return (
    <Container className="p-4 md:p-8 mb-4 border border-gray-200 shadow-sm rounded-lg bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b pb-4">
        <Heading
          level="h1"
          className="text-lg md:text-xl text-gray-900 font-bold"
        >
          唐宋珠寶 - 每日牌告價
        </Heading>
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          className="bg-[#8B2500] hover:bg-[#5c1800] text-white w-full sm:w-auto"
        >
          {saving ? "儲存中..." : "儲存設定"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* 黃金飾金 */}
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-stone-50 rounded-md border border-stone-100">
          <Heading
            level="h2"
            className="text-base md:text-lg text-stone-800 font-bold border-b pb-2"
          >
            1. 黃金飾金 (每錢)
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                賣出價
              </label>
              <Input
                type="number"
                placeholder="例如: 18010"
                value={settings.gold_sell}
                onChange={(e) => handleChange("gold_sell", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                回收價
              </label>
              <Input
                type="number"
                placeholder="例如: 16699"
                value={settings.gold_buy}
                onChange={(e) => handleChange("gold_buy", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* K金系列 */}
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-stone-50 rounded-md border border-stone-100">
          <Heading
            level="h2"
            className="text-base md:text-lg text-stone-800 font-bold border-b pb-2"
          >
            2. K 金系列 (每錢回收價)
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                18K 金 回收價
              </label>
              <Input
                type="number"
                placeholder="例如: 10458"
                value={settings.k18_buy}
                onChange={(e) => handleChange("k18_buy", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                14K 金 回收價
              </label>
              <Input
                type="number"
                placeholder="例如: 7942"
                value={settings.k14_buy}
                onChange={(e) => handleChange("k14_buy", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 白金 Pt950 */}
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-stone-50 rounded-md border border-stone-100">
          <Heading
            level="h2"
            className="text-base md:text-lg text-stone-800 font-bold border-b pb-2"
          >
            3. 白金 Pt950 (每錢)
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                賣出價
              </label>
              <Input
                type="number"
                placeholder="例如: 9269"
                value={settings.pt950_sell}
                onChange={(e) => handleChange("pt950_sell", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                回收價
              </label>
              <Input
                type="number"
                placeholder="例如: 7269"
                value={settings.pt950_buy}
                onChange={(e) => handleChange("pt950_buy", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* 鈀金 Pd */}
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-stone-50 rounded-md border border-stone-100">
          <Heading
            level="h2"
            className="text-base md:text-lg text-stone-800 font-bold border-b pb-2"
          >
            4. 鈀金 Pd (每錢)
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                賣出價
              </label>
              <Input
                type="number"
                placeholder="例如: 7079"
                value={settings.pd_sell}
                onChange={(e) => handleChange("pd_sell", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                回收價
              </label>
              <Input
                type="number"
                placeholder="例如: 5079"
                value={settings.pd_buy}
                onChange={(e) => handleChange("pd_buy", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({ zone: "product.list.before" });
export default MetalSettingsWidget;
