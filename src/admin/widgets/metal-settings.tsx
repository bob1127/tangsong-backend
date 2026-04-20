import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Input, Button, toast } from "@medusajs/ui";
import { useState, useEffect } from "react";

const MetalSettingsWidget = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // 💡 修正 1：把初始值全部改成字串，這樣輸入負號或刪除數字時才不會卡住
  const [settings, setSettings] = useState({
    gold_sell_margin: "800",
    gold_buy_margin: "-200",
    k18_buy_price: "10590",
    k14_buy_price: "7942",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/admin/metal-settings");
        if (!res.ok) throw new Error("無法讀取設定");

        const data = await res.json();
        if (data.settings && Object.keys(data.settings).length > 0) {
          // 確保撈回來的資料轉成字串供輸入框使用
          setSettings({
            gold_sell_margin: String(data.settings.gold_sell_margin ?? "800"),
            gold_buy_margin: String(data.settings.gold_buy_margin ?? "-200"),
            k18_buy_price: String(data.settings.k18_buy_price ?? "10590"),
            k14_buy_price: String(data.settings.k14_buy_price ?? "7942"),
          });
        }
      } catch (err) {
        console.error("無法載入設定", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 💡 傳送前，將字串轉回數字確保資料庫乾淨
      const payload = {
        gold_sell_margin: Number(settings.gold_sell_margin),
        gold_buy_margin: Number(settings.gold_buy_margin),
        k18_buy_price: Number(settings.k18_buy_price),
        k14_buy_price: Number(settings.k14_buy_price),
      };

      const res = await fetch("/admin/metal-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("儲存失敗");

      toast.success("金價設定已更新", {
        description: "前台牌告價將立即套用新的設定。",
      });
    } catch (err) {
      toast.error("儲存失敗，請檢查網路連線");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-stone-500">載入設定中...</div>;

  return (
    <Container className="p-8 mb-4 border border-gray-200 shadow-sm rounded-lg bg-white">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <Heading level="h1" className="text-xl text-gray-900 font-bold">
          唐宋珠寶 - 每日牌告價控制台
        </Heading>
        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={saving}
          className="bg-[#8B2500] hover:bg-[#5c1800] text-white"
        >
          {saving ? "儲存中..." : "儲存設定"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-4 p-5 bg-stone-50 rounded-md border border-stone-100">
          <Heading level="h2" className="text-lg text-stone-800">
            純金加減價 (基於國際盤價)
          </Heading>
          <div>
            <label className="text-sm font-medium text-stone-600 mb-2 block">
              賣出加價 (例如: 800)
            </label>
            {/* 💡 修正 2：onChange 直接吃 e.target.value (字串) */}
            <Input
              type="number"
              value={settings.gold_sell_margin}
              onChange={(e) =>
                setSettings({ ...settings, gold_sell_margin: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-600 mb-2 block">
              回收減價 (例如: -200)
            </label>
            <Input
              type="number"
              value={settings.gold_buy_margin}
              onChange={(e) =>
                setSettings({ ...settings, gold_buy_margin: e.target.value })
              }
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 bg-stone-50 rounded-md border border-stone-100">
          <Heading level="h2" className="text-lg text-stone-800">
            K 金每日收購價 (每錢)
          </Heading>
          <div>
            <label className="text-sm font-medium text-stone-600 mb-2 block">
              18K 金 收購價
            </label>
            <Input
              type="number"
              value={settings.k18_buy_price}
              onChange={(e) =>
                setSettings({ ...settings, k18_buy_price: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-600 mb-2 block">
              14K 金 收購價
            </label>
            <Input
              type="number"
              value={settings.k14_buy_price}
              onChange={(e) =>
                setSettings({ ...settings, k14_buy_price: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({ zone: "product.list.before" });
export default MetalSettingsWidget;
