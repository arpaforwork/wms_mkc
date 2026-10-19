import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { MovementType, Product } from '../types';
import { 
  X, 
  ArrowDownRight, 
  ArrowUpRight, 
  SlidersHorizontal, 
  ArrowLeftRight, 
  AlertCircle, 
  Check, 
  Layers, 
  FileText
} from 'lucide-react';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: MovementType;
  defaultProductId?: string;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'IN',
  defaultProductId
}) => {
  const { products, warehouses, recordStockMovement } = useInventory();

  const [type, setType] = useState<MovementType>(defaultType);
  const [selectedProductId, setSelectedProductId] = useState<string>(defaultProductId || '');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [destinationZone, setDestinationZone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setSelectedProductId(defaultProductId || (products[0]?.id || ''));
      setQuantity('');
      setReference('');
      setNotes('');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, defaultType, defaultProductId, products]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Calculate projected new balance
  let projectedBalance: number | null = null;
  const numQty = typeof quantity === 'number' ? quantity : 0;

  if (selectedProduct && quantity !== '') {
    if (type === 'IN') {
      projectedBalance = selectedProduct.quantity + numQty;
    } else if (type === 'OUT') {
      projectedBalance = selectedProduct.quantity - numQty;
    } else if (type === 'ADJUST') {
      projectedBalance = numQty;
    } else if (type === 'TRANSFER') {
      projectedBalance = selectedProduct.quantity;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedProduct) {
      setErrorMessage('กรุณาเลือกรายการวัสดุก่อสร้าง');
      return;
    }

    if (quantity === '' || numQty <= 0) {
      if (type !== 'ADJUST' || numQty < 0) {
        setErrorMessage('กรุณาระบุจำนวนที่ถูกต้อง (มากกว่า 0)');
        return;
      }
    }

    if (type === 'OUT' && numQty > selectedProduct.quantity) {
      setErrorMessage(`ไม่สามารถเบิกเกินสต็อกคงเหลือได้! มีในคลัง ${selectedProduct.quantity} ${selectedProduct.unit}`);
      return;
    }

    if (type === 'TRANSFER' && (!destinationZone || destinationZone === selectedProduct.warehouseZone)) {
      setErrorMessage('กรุณาเลือกโกดังหรือโซนปลายทางที่แตกต่างจากปัจจุบัน');
      return;
    }

    try {
      setIsSubmitting(true);
      await recordStockMovement({
        productId: selectedProduct.id,
        type,
        quantity: numQty,
        reference: reference.trim() || (type === 'IN' ? 'รับเข้าทั่วไป' : 'เบิกใช้หน้างาน'),
        notes: notes.trim(),
        destinationZone: type === 'TRANSFER' ? destinationZone : undefined
      });

      setSuccessMessage('บันทึกการเคลื่อนไหวสต็อกเรียบร้อยแล้ว!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกรายการ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${
              type === 'IN' 
                ? 'bg-emerald-600' 
                : type === 'OUT' 
                ? 'bg-rose-600' 
                : type === 'TRANSFER' 
                ? 'bg-blue-600' 
                : 'bg-amber-600'
            }`}>
              {type === 'IN' ? <ArrowDownRight className="w-5 h-5" /> : type === 'OUT' ? <ArrowUpRight className="w-5 h-5" /> : type === 'TRANSFER' ? <ArrowLeftRight className="w-5 h-5" /> : <SlidersHorizontal className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">บันทึกการเคลื่อนไหวสต็อก</h2>
              <p className="text-xs text-slate-400">อัปเดตยอดสินค้าคงคลังแบบเรียลไทม์</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Movement Type Tabs */}
        <div className="p-4 bg-slate-950/30 border-b border-slate-800">
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { setType('IN'); setErrorMessage(null); }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                type === 'IN' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>รับเข้า (IN)</span>
            </button>
            <button
              type="button"
              onClick={() => { setType('OUT'); setErrorMessage(null); }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                type === 'OUT' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>เบิกจ่าย (OUT)</span>
            </button>
            <button
              type="button"
              onClick={() => { setType('ADJUST'); setErrorMessage(null); }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                type === 'ADJUST' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>ปรับยอด</span>
            </button>
            <button
              type="button"
              onClick={() => { setType('TRANSFER'); setErrorMessage(null); }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
                type === 'TRANSFER' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>ย้ายโซน</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Select Product */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              เลือกรายการวัสดุก่อสร้าง <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">-- กรุณาเลือกวัสดุ --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.name} (คงเหลือ: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Product Quick Info */}
          {selectedProduct && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">สถานที่จัดเก็บปัจจุบัน:</span>
                <span className="text-amber-300 font-medium">{selectedProduct.warehouseZone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ยอดคงเหลือในคลัง:</span>
                <span className="font-mono font-bold text-white text-sm">
                  {selectedProduct.quantity.toLocaleString()} {selectedProduct.unit}
                </span>
              </div>
            </div>
          )}

          {/* Transfer Destination Zone (if TRANSFER) */}
          {type === 'TRANSFER' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                ย้ายไปยังโกดัง / ลานจัดเก็บใหม่ <span className="text-rose-400">*</span>
              </label>
              <select
                value={destinationZone}
                onChange={(e) => setDestinationZone(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">-- เลือกสถานที่ปลายทาง --</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.name}>
                    {wh.code} - {wh.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              {type === 'IN' 
                ? 'จำนวนที่รับเข้า' 
                : type === 'OUT' 
                ? 'จำนวนที่ต้องการเบิกจ่าย' 
                : type === 'ADJUST' 
                ? 'ยอดนับจริงในคลัง (Physical Count)' 
                : 'จำนวนที่ย้าย'} ({selectedProduct ? selectedProduct.unit : 'หน่วย'}) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ระบุจำนวนตัวเลข เช่น 50"
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                required
              />
              {selectedProduct && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {selectedProduct.unit}
                </span>
              )}
            </div>
          </div>

          {/* Projected Balance Preview */}
          {projectedBalance !== null && selectedProduct && (
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              projectedBalance < 0 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                : projectedBalance <= selectedProduct.minStock 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <span>ยอดคงเหลือหลังทำรายการ:</span>
              <span className="font-mono font-bold text-sm">
                {projectedBalance.toLocaleString()} {selectedProduct.unit}
              </span>
            </div>
          )}

          {/* Document Reference No. */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              เลขที่อ้างอิง / โครงการ / ใบกำกับ
            </label>
            <div className="relative">
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder={type === 'IN' ? 'เช่น PO-6901, ใบส่งของ SCG-992' : 'เช่น ใบเบิกโครงการสะพานข้ามแยก, ช่างสุภาพ'}
                className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Note / Remarks */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              หมายเหตุเพิ่มเติม (ถ้ามี)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ทะเบียนรถบรรทุก 70-1234, สภาพสินค้าสมบูรณ์"
              className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Submit buttons */}
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
              disabled={isSubmitting || (projectedBalance !== null && projectedBalance < 0)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                type === 'IN' 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' 
                  : type === 'OUT' 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20' 
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
              }`}
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>ยืนยันบันทึกรายการ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
