import React from 'react';
import { Product } from '../types';
import { X, Printer, QrCode, Tag, Building2, MapPin } from 'lucide-react';

interface BarcodeModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate SVG-based Code 128 / Barcode style pattern from SKU
  const generateBarcodeLines = (str: string) => {
    const lines = [];
    let seed = 0;
    for (let i = 0; i < str.length; i++) {
      seed += str.charCodeAt(i);
    }
    for (let i = 0; i < 48; i++) {
      const width = ((seed * (i + 1) * 31) % 4) + 1;
      const isSpace = ((seed * (i + 3) * 17) % 3) === 0;
      if (!isSpace) {
        lines.push(<rect key={i} x={i * 5} y="0" width={width} height="60" fill="currentColor" />);
      }
    }
    return lines;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ป้ายบาร์โค้ดประจำชั้นวาง / พาเลท</h2>
              <p className="text-xs text-slate-400">Warehouse Shelf & Bin Label</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Card Preview */}
        <div className="p-6">
          <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-xl border-2 border-slate-300 print:m-0 print:border-black space-y-4">
            {/* Top Brand Tag */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span className="font-extrabold text-sm tracking-tight">WMS MKC - คลังวัสดุก่อสร้าง</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold">
                BIN TAG
              </span>
            </div>

            {/* Material SKU & Name */}
            <div>
              <div className="text-xs font-mono font-bold text-amber-800 tracking-wider">
                SKU: {product.sku}
              </div>
              <h3 className="text-base font-bold text-slate-950 leading-snug mt-1">
                {product.name}
              </h3>
              <div className="text-xs text-slate-600 mt-0.5">
                หมวดหมู่: {product.category}
              </div>
            </div>

            {/* Zone & Unit Grid */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">สถานที่จัดเก็บ</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  {product.warehouseZone}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">หน่วยนับ / จุดสั่งซื้อ</span>
                <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                  {product.unit} (Min: {product.minStock})
                </span>
              </div>
            </div>

            {/* Barcode SVG illustration */}
            <div className="text-center pt-2">
              <div className="flex justify-center text-slate-900">
                <svg className="h-14 w-60" viewBox="0 0 240 60">
                  {generateBarcodeLines(product.sku)}
                </svg>
              </div>
              <div className="font-mono text-sm tracking-widest font-bold mt-1 text-slate-800">
                *{product.sku}*
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">ขนาดสติกเกอร์มาตรฐาน: 4" x 3"</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              ปิด
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ป้ายบาร์โค้ด</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
