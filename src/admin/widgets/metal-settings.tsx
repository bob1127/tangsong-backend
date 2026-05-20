import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Input, Button, toast } from "@medusajs/ui";
import { useState, useEffect } from "react";

const MetalSettingsWidget = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [debugLog, setDebugLog] = useState<string>("");

  // 根據前端需求調整欄位：移除白金/鈀金賣出，新增黃金條塊/白銀回收
  const [settings, setSettings] = useState({
    gold_sell: "",
    gold_buy: "",
    gold_bullion_buy: "", // 新增
    silver_buy: "", // 新增
    k18_buy: "",
    k14_buy: "",
    pt950_buy: "", // 移除 pt950_sell
    pd_buy: "", // 移除 pd_sell
  });

  const backendUrl =
    process.env.MEDUSA_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
    "";

  const debugFetch = async (endpoint: string, options: RequestInit = {}) => {
    const fullUrl = `${backendUrl}${endpoint}`;
    const relativeUrl = endpoint;

    const fetchOptions = {
      ...options,
      credentials: "include" as RequestCredentials,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      let targetUrl = relativeUrl;
      let res = await fetch(targetUrl, fetchOptions);

      if (!res.ok && backendUrl) {
        targetUrl = fullUrl;
        res = await fetch(targetUrl, fetchOptions);
      }

      const errorText = await res.text();
      if (!res.ok) {
        setDebugLog(
          `狀態碼: ${res.status} | 回應: ${errorText.substring(0, 100)}`,
        );
        throw new Error(errorText);
      }

      return JSON.parse(errorText);
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await debugFetch("/admin/metal-settings");
        if (data.settings && Object.keys(data.settings).length > 0) {
          setSettings({
            gold_sell: String(data.settings.gold_sell ?? ""),
            gold_buy: String(data.settings.gold_buy ?? ""),
            gold_bullion_buy: String(data.settings.gold_bullion_buy ?? ""),
            silver_buy: String(data.settings.silver_buy ?? ""),
            k18_buy: String(data.settings.k18_buy ?? ""),
            k14_buy: String(data.settings.k14_buy ?? ""),
            pt950_buy: String(data.settings.pt950_buy ?? ""),
            pd_buy: String(data.settings.pd_buy ?? ""),
          });
        }
      } catch (err: any) {
        // 錯誤已透過 debugLog 顯示
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [backendUrl]);

  const handleSave = async () => {
    setSaving(true);
    setDebugLog("");
    try {
      const payload = {
        gold_sell: Number(settings.gold_sell) || 0,
        gold_buy: Number(settings.gold_buy) || 0,
        gold_bullion_buy: Number(settings.gold_bullion_buy) || 0,
        silver_buy: Number(settings.silver_buy) || 0,
        k18_buy: Number(settings.k18_buy) || 0,
        k14_buy: Number(settings.k14_buy) || 0,
        pt950_buy: Number(settings.pt950_buy) || 0,
        pd_buy: Number(settings.pd_buy) || 0,
      };

      await debugFetch("/admin/metal-settings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      toast.success("牌告價設定已更新", {
        description: "前台即時行情將立即套用新的價格。",
      });
    } catch (err: any) {
      toast.error(`儲存失敗，請查看下方除錯訊息`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading)
    return (
      <div className="p-4 md:p-8 text-stone-500">
        載入設定中 (請打開 F12 Console 查看日誌)...
      </div>
    );

  return (
    <Container className="p-4 md:p-8 mb-4 border border-gray-200 shadow-sm rounded-lg bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 border-b pb-4">
        <Heading
          level="h1"
          className="text-lg md:text-xl text-gray-900 font-bold"
        >
          唐宋珠寶 - 每日牌告價設定
        </Heading>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={saving}
            className="bg-[#8B2500] hover:bg-[#5c1800] text-white w-full sm:w-auto"
          >
            {saving ? "儲存中..." : "儲存設定"}
          </Button>
        </div>
      </div>

      {debugLog && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg">
          <p className="font-bold mb-1">⚠️ API 發生錯誤</p>
          <p className="font-mono text-sm break-all">{debugLog}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* ================== 黃金與白銀 ================== */}
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-stone-50 rounded-md border border-stone-100">
          <Heading
            level="h2"
            className="text-base md:text-lg text-stone-800 font-bold border-b pb-2"
          >
            1. 黃金與白銀 (每錢)
          </Heading>

          {/* 黃金賣出 (全表唯一) */}
          <div>
            <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
              黃金 賣出價
            </label>
            <Input
              type="number"
              placeholder="例如: 18010"
              value={settings.gold_sell}
              onChange={(e) => handleChange("gold_sell", e.target.value)}
              className="w-full bg-yellow-50/50 border-yellow-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                黃金飾金 回收價
              </label>
              <Input
                type="number"
                placeholder="例如: 16699"
                value={settings.gold_buy}
                onChange={(e) => handleChange("gold_buy", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                黃金條塊 回收價
              </label>
              <Input
                type="number"
                placeholder="例如: 16799"
                value={settings.gold_bullion_buy}
                onChange={(e) =>
                  handleChange("gold_bullion_buy", e.target.value)
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-2">
            <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
              白銀 回收價
            </label>
            <Input
              type="number"
              placeholder="例如: 120"
              value={settings.silver_buy}
              onChange={(e) => handleChange("silver_buy", e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* ================== K金系列 ================== */}
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-stone-50 rounded-md border border-stone-100">
          <Heading
            level="h2"
            className="text-base md:text-lg text-stone-800 font-bold border-b pb-2"
          >
            2. K 金系列 (每錢回收價)
          </Heading>
          <div className="grid grid-cols-1 gap-4">
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

        {/* ================== 白金與鈀金 ================== */}
        <div className="flex flex-col gap-4 p-4 md:p-6 bg-stone-50 rounded-md border border-stone-100 lg:col-span-2">
          <Heading
            level="h2"
            className="text-base md:text-lg text-stone-800 font-bold border-b pb-2"
          >
            3. 白金 Pt950 與 鈀金 Pd (每錢回收價)
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                白金 Pt950 回收價
              </label>
              <Input
                type="number"
                placeholder="例如: 7269"
                value={settings.pt950_buy}
                onChange={(e) => handleChange("pt950_buy", e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-medium text-stone-600 mb-1.5 block">
                鈀金 Pd 回收價
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
