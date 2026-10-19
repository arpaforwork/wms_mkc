import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  DollarSign, 
  Boxes, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Warehouse, 
  Clock, 
  PackageCheck,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { MaterialCategory } from '../types';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMovementModal: (defaultType?: 'IN' | 'OUT', productId?: string) => void;
  onOpenAddProductModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenMovementModal,
  onOpenAddProductModal
}) => {
  const { 
    products, 
    transactions, 
    warehouses, 
    totalValuation, 
    totalQuantity, 
    lowStockItems, 
    outOfStockItems,
    recentMovements 
  } = useInventory();

  // Calculate Inbound and Outbound stats for current month
  const currentMonthTransactions = transactions.filter((t) => {
    const tDate = new Date(t.timestamp);
    const now = new Date();
    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
  });

  const inboundThisMonth = currentMonthTransactions.filter((t) => t.type === 'IN').length;
  const outboundThisMonth = currentMonthTransactions.filter((t) => t.type === 'OUT').length;

  // Group by categories
  const categoriesList: MaterialCategory[] = [
    'ปูนซีเมนต์และคอนกรีต',
    'เหล็กและโลหะโครงสร้าง',
    'อิฐ หิน ดิน ทราย',
    'กระเบื้องและสุขภัณฑ์',
    'ท่อประปาและข้อต่อ',
    'สีและเคมีภัณฑ์ก่อสร้าง',
    'หลังคาและฝ้าเพดาน',
    'อุปกรณ์ช่างและฮาร์ดแวร์'
  ];

  const categoryStats = categoriesList.map((cat) => {
    const items = products.filter((p) => p.category === cat);
    const count = items.length;
    const valuation = items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    const percentage = totalValuation > 0 ? (valuation / totalValuation) * 100 : 0;
    return {
      category: cat,
      count,
      valuation,
      percentage
    };
  }).filter((c) => c.count > 0).sort((a, b) => b.valuation - a.valuation);

  // Group by warehouse zone
  const zoneStats = warehouses.map((wh) => {
    const items = products.filter((p) => p.warehouseZone.includes(wh.code) || p.warehouseZone.includes(wh.name.split(' ')[0]));
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const usagePercent = wh.capacityMax > 0 ? Math.min(Math.round((totalQty / wh.capacityMax) * 100), 100) : 0;
    return {
      ...wh,
      itemsCount: items.length,
      totalQty,
      usagePercent
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">แดชบอร์ดสรุปสถานะคลังวัสดุ</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Real-time Live
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            ภาพรวมสินค้าคงคลัง การรับเข้า-เบิกจ่าย และระดับสต็อกปลอดภัย บริษัทค้าวัสดุก่อสร้าง MKC
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => onOpenMovementModal('IN')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>รับเข้าสินค้า</span>
          </button>

          <button
            onClick={() => onOpenMovementModal('OUT')}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
          >
            <MinusCircle className="w-4 h-4" />
            <span>เบิกจ่ายวัสดุ</span>
          </button>

          <button
            onClick={onOpenAddProductModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>+ เพิ่มรายการวัสดุ</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Valuation */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">มูลค่าสินค้าคงคลังรวม</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-mono">
              ฿{totalValuation.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>คำนวณจากราคาต้นทุนจริงในคลัง</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total SKUs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">จำนวนรายการวัสดุ (SKU)</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-mono">
              {products.length} <span className="text-sm font-normal text-slate-400">รายการ</span>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>ยอดรวมทุกหน่วย {totalQuantity.toLocaleString()} หน่วย</span>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 text-[11px]"
              >
                ดูทั้งหมด <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Metric 3: Low Stock Warning */}
        <div className={`bg-slate-900/80 border rounded-2xl p-5 relative overflow-hidden group transition-all ${
          lowStockItems.length > 0 ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">สต็อกใกล้หมด / ต้องสั่งเพิ่ม</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              lowStockItems.length > 0 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl lg:text-3xl font-bold tracking-tight font-mono ${
                lowStockItems.length > 0 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {lowStockItems.length}
              </span>
              <span className="text-xs text-slate-400">รายการ</span>
              {outOfStockItems.length > 0 && (
                <span className="text-xs text-rose-400 font-medium">
                  (หมดสต็อก {outOfStockItems.length})
                </span>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {lowStockItems.length > 0 ? (
                <span className="text-amber-300/90">มีสินค้าต่ำกว่าเกณฑ์ความปลอดภัย</span>
              ) : (
                <span className="text-emerald-400">สต็อกทุกรายการอยู่ในเกณฑ์ปกติ</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 4: Movement Activities */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">กิจกรรมรับ-จ่าย เดือนนี้</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-mono">
              {currentMonthTransactions.length} <span className="text-sm font-normal text-slate-400">ครั้ง</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-emerald-400 flex items-center gap-1">
                <ArrowDownRight className="w-3.5 h-3.5" /> รับเข้า {inboundThisMonth}
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> เบิกจ่าย {outboundThisMonth}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Low Stock Alerts Banner (if any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">แจ้งเตือนสินค้าวัสดุก่อสร้างใกล้หมดสต็อก</h2>
                <p className="text-xs text-amber-200/70">
                  พบ {lowStockItems.length} รายการที่ยอดคงเหลือต่ำกว่าเกณฑ์สั่งซื้อขั้นต่ำ (Safety Stock)
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 underline underline-offset-4"
            >
              เปิดดูในตารางสต็อก
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockItems.slice(0, 6).map((item) => (
              <div 
                key={item.id}
                className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.sku}
                    </span>
                    <span className="text-xs font-medium text-white truncate block">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>เหลือ: <strong className="text-amber-400 font-mono">{item.quantity}</strong> {item.unit}</span>
                    <span>•</span>
                    <span>เกณฑ์ขั้นต่ำ: <strong className="font-mono text-slate-300">{item.minStock}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenMovementModal('IN', item.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-medium shrink-0 transition-all cursor-pointer"
                >
                  + รับเข้า
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Category Distribution & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Category Breakdown & Warehouse Occupancy */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Distribution */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">สัดส่วนมูลค่าสต็อกตามหมวดหมู่วัสดุ</h2>
                <p className="text-xs text-slate-400">เปรียบเทียบมูลค่าต้นทุนสินค้าในคลัง</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {categoryStats.length} หมวดหมู่
              </span>
            </div>

            <div className="space-y-3.5">
              {categoryStats.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200">{cat.category}</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {cat.count} รายการ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-300 font-semibold">
                        ฿{cat.valuation.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-slate-500 text-[11px] w-10 text-right">
                        ({cat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                      style={{ width: `${Math.max(cat.percentage, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warehouse Zones Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-semibold text-white">สถานะการใช้งานคลังและลานจัดเก็บ</h2>
              </div>
              <button
                onClick={() => setActiveTab('zones')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
              >
                ดูผังโกดังทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {zoneStats.map((zone) => (
                <div 
                  key={zone.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-semibold">
                        {zone.code}
                      </span>
                      <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">
                        {zone.name}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {zone.usagePercent}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2.5">
                    <div
                      className={`h-full rounded-full ${
                        zone.usagePercent > 80 ? 'bg-rose-500' : zone.usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(zone.usagePercent, 4)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                    <span>จัดเก็บ {zone.itemsCount} ชนิดวัสดุ</span>
                    <span>รวม {zone.totalQty.toLocaleString()} หน่วย</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Transactions Feed */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">กิจกรรมการเคลื่อนไหวล่าสุด</h2>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
              >
                ดูประวัติทั้งหมด <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentMovements.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                ยังไม่มีรายการเคลื่อนไหวสต็อกล่าสุด
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[560px] pr-1">
                {recentMovements.map((log) => {
                  const isIN = log.type === 'IN';
                  const isOUT = log.type === 'OUT';
                  const isADJ = log.type === 'ADJUST';

                  return (
                    <div 
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-all"
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isIN 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : isOUT 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {isIN ? <ArrowDownRight className="w-4 h-4" /> : isOUT ? <ArrowUpRight className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isIN 
                              ? 'bg-emerald-500/20 text-emerald-300' 
                              : isOUT 
                              ? 'bg-rose-500/20 text-rose-300' 
                              : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {isIN ? 'รับเข้า' : isOUT ? 'เบิกจ่าย' : isADJ ? 'ปรับยอด' : 'ย้ายโซน'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-200 mt-1 truncate">
                          {log.productName}
                        </h4>

                        <div className="flex items-center justify-between mt-1 text-[11px]">
                          <span className="text-slate-400 font-mono text-[10px]">
                            {log.docNo}
                          </span>
                          <span className={`font-mono font-semibold ${
                            isIN ? 'text-emerald-400' : isOUT ? 'text-rose-400' : 'text-amber-400'
                          }`}>
                            {isIN ? '+' : isOUT ? '-' : ''}{log.quantity} {log.unit}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 mt-1 truncate flex items-center justify-between">
                          <span>อ้างอิง: {log.reference || '-'}</span>
                          <span className="text-slate-400">{log.actorName.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
