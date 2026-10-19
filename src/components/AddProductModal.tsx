import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { MaterialCategory, MaterialUnit } from '../types';
import { X, Plus, Check, AlertCircle, PackagePlus } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose }) => {
  const { addProduct, warehouses } = useInventory();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('ปูนซีเมนต์และคอนกรีต');
  const [unit, setUnit] = useState<MaterialUnit>('ถุง');
  const [quantity, setQuantity] = useState<number | ''>(100);
  const [minStock, setMinStock] = useState<number | ''>(20);
  const [costPrice, setCostPrice] = useState<number | ''>(100);
  const [sellingPrice, setSellingPrice] = useState<number | ''>(125);
  const [warehouseZone, setWarehouseZone] = useState<string>(warehouses[0]?.name || 'โกดัง 1 (ปูนซีเมนต์และเคมี)');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const units: MaterialUnit[] = [
    'ถุง', 'เส้น', 'ตัน', 'ก้อน', 'กล่อง', 'ท่อน', 'ถัง', 'แผ่น', 'ขด', 'ชิ้น', 'ชุด'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim() || !name.trim()) {
      setError('กรุณากรอกรหัส SKU และชื่อวัสดุก่อสร้าง');
      return;
    }

    try {
      setIsSubmitting(true);
      await addProduct({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        unit,
        quantity: Number(quantity) || 0,
        minStock: Number(minStock) || 0,
        costPrice: Number(costPrice) || 0,
        sellingPrice: Number(sellingPrice) || 0,
        warehouseZone: warehouseZone || 'โกดัง 1',
        supplier: supplier.trim(),
        notes: notes.trim(),
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเพิ่มรายการสินค้า');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 my-8">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">เพิ่มรายการวัสดุก่อสร้างใหม่</h2>
              <p className="text-xs text-slate-400">ลงทะเบียนข้อมูลสินค้าเข้าสู่ระบบคลัง WMS MKC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                รหัสสินค้า (SKU) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="เช่น CEM-SCG-02, STL-DB16"
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-amber-500 uppercase"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                หมวดหมู่วัสดุ <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              ชื่อรายการวัสดุก่อสร้าง / สเปค <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ปูนซีเมนต์ผสม ตราเสือ มอร์ตาร์ 50 กก."
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">หน่วยนับ</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MaterialUnit)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">ยอดคงเหลือเริ่มต้น</label>
              <input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">จุดสั่งซื้อขั้นต่ำ (Min)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">ราคาต้นทุน (บาท)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">ราคาขายหน้าคลัง (บาท)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">โกดัง / ลานจัดเก็บ</label>
              <select
                value={warehouseZone}
                onChange={(e) => setWarehouseZone(e.target.value)}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.name}>{wh.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">ผู้ผลิต / ซัพพลายเออร์</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="เช่น บจก. ปูนซีเมนต์ไทย"
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">หมายเหตุ / ข้อมูลจำเพาะ</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น มาตรฐาน มอก. หรือวิธีจัดเก็บรักษา"
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกรายการสินค้า'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
