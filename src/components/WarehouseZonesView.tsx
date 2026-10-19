import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Warehouse, 
  MapPin, 
  Boxes, 
  Plus, 
  Layers, 
  ArrowRight, 
  Truck, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface WarehouseZonesViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMovementModal: (defaultType?: 'IN' | 'OUT', productId?: string) => void;
}

export const WarehouseZonesView: React.FC<WarehouseZonesViewProps> = ({
  setActiveTab,
  onOpenMovementModal
}) => {
  const { warehouses, products } = useInventory();
  const [selectedZoneCode, setSelectedZoneCode] = useState<string | null>(null);

  // Map products to zones
  const zonesWithProducts = warehouses.map((wh) => {
    const items = products.filter((p) => 
      p.warehouseZone.includes(wh.code) || 
      p.warehouseZone.includes(wh.name.split(' ')[0]) ||
      p.warehouseZone === wh.name
    );
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    const usagePercent = wh.capacityMax > 0 ? Math.min(Math.round((totalQty / wh.capacityMax) * 100), 100) : 0;

    return {
      ...wh,
      items,
      totalQty,
      totalValue,
      usagePercent
    };
  });

  const activeZone = selectedZoneCode 
    ? zonesWithProducts.find(z => z.code === selectedZoneCode) 
    : zonesWithProducts[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">แผนผังโกดังและลานจัดเก็บวัสดุ</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          ภาพรวมพื้นที่จัดเก็บแยกตามหมวดหมู่วัสดุก่อสร้าง อัตราการใช้งานความจุ และสินค้าที่จัดเก็บในแต่ละจุด
        </p>
      </div>

      {/* Grid of Warehouse cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zonesWithProducts.map((zone) => {
          const isSelected = activeZone?.code === zone.code;

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZoneCode(zone.code)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-900 border-amber-500 shadow-xl shadow-amber-500/5'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl ${
                    isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-amber-400'
                  }`}>
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-400 font-semibold border border-slate-800">
                      {zone.code}
                    </span>
                    <h3 className="font-bold text-white text-sm mt-1">
                      {zone.name}
                    </h3>
                  </div>
                </div>

                <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${
                  zone.usagePercent > 80 ? 'bg-rose-500/20 text-rose-300' : zone.usagePercent > 50 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {zone.usagePercent}%
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                {zone.description}
              </p>

              {/* Capacity progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>ความจุที่ใช้งาน</span>
                  <span className="font-mono">{zone.totalQty.toLocaleString()} / {zone.capacityMax.toLocaleString()} หน่วย</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      zone.usagePercent > 80 ? 'bg-rose-500' : zone.usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(zone.usagePercent, 4)}%` }}
                  />
                </div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5 text-slate-500" />
                  {zone.items.length} รายการวัสดุ
                </span>
                <span className="font-mono text-slate-300 font-medium">
                  ฿{zone.totalValue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Section of Selected Zone */}
      {activeZone && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  {activeZone.code}
                </span>
                <h2 className="text-xl font-bold text-white">{activeZone.name}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {activeZone.description} • ประเภท: <span className="text-slate-300">{activeZone.type}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenMovementModal('IN')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>รับเข้าจุดนี้</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>ดูในตารางสต็อก</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List of materials currently in this zone */}
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              รายการวัสดุก่อสร้างที่จัดเก็บในโซนนี้ ({activeZone.items.length} รายการ)
            </h3>

            {activeZone.items.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                ยังไม่มีรายการวัสดุที่ระบุจัดเก็บในโซนนี้
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeZone.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                          {item.sku}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white mt-2 line-clamp-1">
                        {item.name}
                      </h4>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400">คงเหลือ: </span>
                        <strong className="text-white font-mono">{item.quantity.toLocaleString()}</strong> {item.unit}
                      </div>

                      <button
                        onClick={() => onOpenMovementModal('OUT', item.id)}
                        className="px-2 py-1 rounded bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        เบิกออก
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
