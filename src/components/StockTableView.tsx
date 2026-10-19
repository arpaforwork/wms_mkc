import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, MaterialCategory } from '../types';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  QrCode, 
  AlertTriangle, 
  PlusCircle, 
  MinusCircle, 
  ArrowUpDown,
  RefreshCw,
  Building,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface StockTableViewProps {
  onOpenMovementModal: (defaultType?: 'IN' | 'OUT', productId?: string) => void;
  onOpenAddProductModal: () => void;
  onOpenEditProductModal: (product: Product) => void;
  onOpenBarcodeModal: (product: Product) => void;
}

export const StockTableView: React.FC<StockTableViewProps> = ({
  onOpenMovementModal,
  onOpenAddProductModal,
  onOpenEditProductModal,
  onOpenBarcodeModal,
}) => {
  const { products, deleteProduct, reseedData, loading } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'valuation' | 'sku'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

  const categories: MaterialCategory[] = [
    'ปูนซีเมนต์และคอนกรีต',
    'เหล็กและโลหะโครงสร้าง',
    'อิฐ หิน ดิน ทราย',
    'กระเบื้องและสุขภัณฑ์',
    'ท่อประปาและข้อต่อ',
    'สีและเคมีภัณฑ์ก่อสร้าง',
    'หลังคาและฝ้าเพดาน',
    'อุปกรณ์ช่างและฮาร์ดแวร์'
  ];

  // Distinct warehouse zones
  const distinctZones = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.warehouseZone) set.add(p.warehouseZone);
    });
    return Array.from(set);
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch = 
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.warehouseZone.toLowerCase().includes(term) ||
          (p.supplier && p.supplier.toLowerCase().includes(term));

        // Category filter
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

        // Zone filter
        const matchesZone = selectedZone === 'all' || p.warehouseZone === selectedZone;

        // Status filter
        let matchesStatus = true;
        if (stockStatusFilter === 'low') {
          matchesStatus = p.quantity > 0 && p.quantity <= p.minStock;
        } else if (stockStatusFilter === 'out') {
          matchesStatus = p.quantity <= 0;
        } else if (stockStatusFilter === 'normal') {
          matchesStatus = p.quantity > p.minStock;
        }

        return matchesSearch && matchesCategory && matchesZone && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = a.name.localeCompare(b.name, 'th');
        } else if (sortBy === 'quantity') {
          comp = a.quantity - b.quantity;
        } else if (sortBy === 'valuation') {
          comp = (a.quantity * a.costPrice) - (b.quantity * b.costPrice);
        } else if (sortBy === 'sku') {
          comp = a.sku.localeCompare(b.sku);
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [products, searchTerm, selectedCategory, selectedZone, stockStatusFilter, sortBy, sortDirection]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) return;
    const headers = ['SKU', 'ชื่อรายการวัสดุก่อสร้าง', 'หมวดหมู่', 'คงเหลือ', 'หน่วย', 'เกณฑ์สั่งซื้อขั้นต่ำ', 'ราคาต้นทุน (บาท)', 'ราคาขาย (บาท)', 'มูลค่ารวมต้นทุน (บาท)', 'โซนจัดเก็บ', 'ผู้ผลิต/ซัพพลายเออร์'];
    const rows = filteredProducts.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.quantity,
      `"${p.unit}"`,
      p.minStock,
      p.costPrice,
      p.sellingPrice,
      p.quantity * p.costPrice,
      `"${p.warehouseZone}"`,
      `"${(p.supplier || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WMS-MKC-Stock-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteProduct(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">สต็อกวัสดุก่อสร้างคงคลัง</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            ตรวจเช็คยอดคงเหลือแบบเรียลไทม์ รับเข้าและตัดจ่ายได้ทันที
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onOpenAddProductModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการวัสดุใหม่</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            title="ส่งออกรายงาน Excel / CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            title="พิมพ์ตารางสต็อก"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">พิมพ์รายงาน</span>
          </button>

          {products.length === 0 && (
            <button
              onClick={reseedData}
              className="px-3 py-2 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>โหลดข้อมูลตัวอย่าง</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา SKU, ชื่อวัสดุ, ผู้ผลิต หรือโซนจัดเก็บ..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Category Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">ทุกหมวดหมู่วัสดุ ({products.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Warehouse Zone Dropdown (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">ทุกโกดัง / ลานกอง</option>
              {distinctZones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">สถานะ: ทั้งหมด</option>
              <option value="normal">สต็อกปกติ</option>
              <option value="low">สต็อกใกล้หมด (เตือน)</option>
              <option value="out">สินค้าหมดสต็อก</option>
            </select>
          </div>
        </div>

        {/* Quick Summary Pill Row */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-3">
            <span>แสดง <strong>{filteredProducts.length}</strong> จาก {products.length} รายการ</span>
            <span className="text-slate-600">•</span>
            <span>มูลค่าที่แสดง: <strong className="text-amber-400 font-mono">฿{filteredProducts.reduce((s, p) => s + (p.quantity * p.costPrice), 0).toLocaleString()}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">เรียงตาม:</span>
            <button
              onClick={() => {
                if (sortBy === 'name') setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                else { setSortBy('name'); setSortDirection('asc'); }
              }}
              className={`px-2 py-1 rounded text-[11px] ${sortBy === 'name' ? 'bg-amber-500/20 text-amber-300' : 'hover:text-white'}`}
            >
              ชื่อ {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'quantity') setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                else { setSortBy('quantity'); setSortDirection('asc'); }
              }}
              className={`px-2 py-1 rounded text-[11px] ${sortBy === 'quantity' ? 'bg-amber-500/20 text-amber-300' : 'hover:text-white'}`}
            >
              ยอดคงเหลือ {sortBy === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'valuation') setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
                else { setSortBy('valuation'); setSortDirection('desc'); }
              }}
              className={`px-2 py-1 rounded text-[11px] ${sortBy === 'valuation' ? 'bg-amber-500/20 text-amber-300' : 'hover:text-white'}`}
            >
              มูลค่ารวม {sortBy === 'valuation' && (sortDirection === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">รหัส SKU</th>
                <th className="py-3.5 px-4 min-w-[240px]">รายการวัสดุก่อสร้าง</th>
                <th className="py-3.5 px-4">หมวดหมู่</th>
                <th className="py-3.5 px-4">สถานที่จัดเก็บ</th>
                <th className="py-3.5 px-4 text-right">คงเหลือในคลัง</th>
                <th className="py-3.5 px-4 text-right">จุดสั่งซื้อ (Min)</th>
                <th className="py-3.5 px-4 text-right">ราคาต้นทุน</th>
                <th className="py-3.5 px-4 text-right">มูลค่ารวม</th>
                <th className="py-3.5 px-4 text-center">จัดการด่วน</th>
                <th className="py-3.5 px-4 text-right">ตัวเลือก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <p className="text-sm">ไม่พบรายการวัสดุตรงกับเงื่อนไขการค้นหา</p>
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedZone('all'); setStockStatusFilter('all'); }}
                      className="mt-2 text-xs text-amber-400 underline hover:text-amber-300 cursor-pointer"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOutOfStock = p.quantity <= 0;
                  const isLowStock = p.quantity > 0 && p.quantity <= p.minStock;
                  const itemValuation = p.quantity * p.costPrice;

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isOutOfStock ? 'bg-rose-950/10' : isLowStock ? 'bg-amber-950/10' : ''
                      }`}
                    >
                      {/* SKU */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-amber-300 font-semibold">
                            {p.sku}
                          </span>
                        </div>
                      </td>

                      {/* Name & Supplier */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white text-xs sm:text-sm">
                          {p.name}
                        </div>
                        {p.supplier && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span>{p.supplier}</span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {p.category}
                        </span>
                      </td>

                      {/* Warehouse Zone */}
                      <td className="py-3 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800">
                          {p.warehouseZone}
                        </span>
                      </td>

                      {/* Quantity & Status */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`text-sm font-bold ${
                            isOutOfStock ? 'text-rose-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {p.quantity.toLocaleString()}
                          </span>
                          <span className="text-slate-400 text-xs font-normal">
                            {p.unit}
                          </span>
                        </div>
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                            <XCircle className="w-3 h-3" /> สินค้าหมด
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                            <AlertTriangle className="w-3 h-3" /> ใกล้หมด
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> ปกติ
                          </span>
                        )}
                      </td>

                      {/* Min Stock threshold */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400 whitespace-nowrap">
                        {p.minStock.toLocaleString()} {p.unit}
                      </td>

                      {/* Cost price */}
                      <td className="py-3 px-4 text-right font-mono text-slate-300 whitespace-nowrap">
                        ฿{p.costPrice.toLocaleString()}
                      </td>

                      {/* Valuation */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200 whitespace-nowrap">
                        ฿{itemValuation.toLocaleString()}
                      </td>

                      {/* Fast Action Buttons (+ and -) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => onOpenMovementModal('IN', p.id)}
                            title="รับเข้าสต็อกด่วน (+)"
                            className="p-1 rounded hover:bg-emerald-600/30 text-emerald-400 transition-colors cursor-pointer"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <span className="text-slate-700">|</span>
                          <button
                            onClick={() => onOpenMovementModal('OUT', p.id)}
                            title="เบิกจ่ายวัสดุด่วน (-)"
                            className="p-1 rounded hover:bg-rose-600/30 text-rose-400 transition-colors cursor-pointer"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Row actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenBarcodeModal(p)}
                            title="แสดงบาร์โค้ด / ป้ายติดชั้นวาง"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditProductModal(p)}
                            title="แก้ไขข้อมูลวัสดุ"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setItemToDelete(p)}
                            title="ลบรายการ"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">ยืนยันการลบรายการวัสดุ</h3>
                <p className="text-xs text-slate-400">การลบนี้จะไม่สามารถย้อนกลับได้</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-5 text-xs space-y-1">
              <div><strong>SKU:</strong> <span className="font-mono text-amber-300">{itemToDelete.sku}</span></div>
              <div><strong>รายการ:</strong> <span className="text-white">{itemToDelete.name}</span></div>
              <div><strong>คงเหลือปัจจุบัน:</strong> <span className="font-mono text-emerald-400">{itemToDelete.quantity} {itemToDelete.unit}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
