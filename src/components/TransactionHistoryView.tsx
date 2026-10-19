import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { StockTransaction, MovementType } from '../types';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowDownRight, 
  ArrowUpRight, 
  SlidersHorizontal, 
  ArrowLeftRight, 
  FileText, 
  Printer, 
  X, 
  User, 
  Calendar,
  Building2
} from 'lucide-react';

export const TransactionHistoryView: React.FC = () => {
  const { transactions } = useInventory();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedSlip, setSelectedSlip] = useState<StockTransaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !term ||
        t.docNo.toLowerCase().includes(term) ||
        t.productName.toLowerCase().includes(term) ||
        t.productSku.toLowerCase().includes(term) ||
        t.reference.toLowerCase().includes(term) ||
        t.actorEmail.toLowerCase().includes(term) ||
        t.actorName.toLowerCase().includes(term);

      const matchesType = filterType === 'all' || t.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['เลขที่เอกสาร', 'ประเภทรายการ', 'รหัส SKU', 'ชื่อวัสดุก่อสร้าง', 'จำนวน', 'หน่วย', 'ยอดก่อนทำ', 'ยอดหลังทำ', 'สถานที่/โซน', 'อ้างอิง/โครงการ', 'ผู้ทำรายการ', 'อีเมล', 'วัน-เวลา'];
    const rows = filteredTransactions.map((t) => [
      `"${t.docNo}"`,
      `"${t.type === 'IN' ? 'รับเข้า' : t.type === 'OUT' ? 'เบิกจ่าย' : t.type === 'ADJUST' ? 'ปรับยอด' : 'ย้ายโซน'}"`,
      `"${t.productSku}"`,
      `"${t.productName.replace(/"/g, '""')}"`,
      t.quantity,
      `"${t.unit}"`,
      t.previousQuantity,
      t.newQuantity,
      `"${t.zone}"`,
      `"${(t.reference || '').replace(/"/g, '""')}"`,
      `"${t.actorName}"`,
      `"${t.actorEmail}"`,
      `"${new Date(t.timestamp).toLocaleString('th-TH')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WMS-MKC-Movements-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ประวัติการเคลื่อนไหวสต็อก</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            บันทึกธุรกรรมรับเข้าสินค้า เบิกจ่าย ปรับยอด และย้ายโซนจัดเก็บแบบไม่สามารถแก้ไขย้อนหลัง
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>ส่งออกประวัติ (CSV)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่เอกสาร, SKU, ชื่อวัสดุ, เลขที่ใบส่งของ หรือผู้ทำรายการ..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">ทุกประเภทธุรกรรม ({transactions.length})</option>
              <option value="IN">รับเข้าสินค้า (Inbound)</option>
              <option value="OUT">เบิกจ่ายสินค้า (Outbound)</option>
              <option value="ADJUST">ปรับยอดตรวจนับ (Adjust)</option>
              <option value="TRANSFER">ย้ายโซนจัดเก็บ (Transfer)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          แสดง <strong>{filteredTransactions.length}</strong> จากทั้งหมด {transactions.length} ธุรกรรม
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">วัน-เวลา</th>
                <th className="py-3.5 px-4">เลขที่เอกสาร</th>
                <th className="py-3.5 px-4">ประเภท</th>
                <th className="py-3.5 px-4 min-w-[200px]">รายการวัสดุ</th>
                <th className="py-3.5 px-4 text-right">จำนวน</th>
                <th className="py-3.5 px-4 text-right">ยอดคงเหลือ</th>
                <th className="py-3.5 px-4">อ้างอิง / โครงการ</th>
                <th className="py-3.5 px-4">ผู้บันทึก</th>
                <th className="py-3.5 px-4 text-center">ใบสำคัญ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    ไม่พบประวัติการทำรายการตรงกับเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const isIN = t.type === 'IN';
                  const isOUT = t.type === 'OUT';
                  const isADJ = t.type === 'ADJUST';
                  const isTR = t.type === 'TRANSFER';

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px] font-mono">
                        {new Date(t.timestamp).toLocaleDateString('th-TH', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Doc No */}
                      <td className="py-3 px-4 font-mono font-medium text-amber-400 whitespace-nowrap">
                        {t.docNo}
                      </td>

                      {/* Movement Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          isIN 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : isOUT 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : isTR 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {isIN ? <ArrowDownRight className="w-3 h-3" /> : isOUT ? <ArrowUpRight className="w-3 h-3" /> : isTR ? <ArrowLeftRight className="w-3 h-3" /> : <SlidersHorizontal className="w-3 h-3" />}
                          <span>{isIN ? 'รับเข้า' : isOUT ? 'เบิกจ่าย' : isTR ? 'ย้ายโซน' : 'ปรับยอด'}</span>
                        </span>
                      </td>

                      {/* Product */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-white truncate max-w-[220px]">
                          {t.productName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          SKU: {t.productSku}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono">
                        <span className={`font-bold ${
                          isIN ? 'text-emerald-400' : isOUT ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {isIN ? '+' : isOUT ? '-' : ''}{t.quantity.toLocaleString()} {t.unit}
                        </span>
                      </td>

                      {/* Previous vs New Balance */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono text-[11px] text-slate-400">
                        <span>{t.previousQuantity} → <strong className="text-white">{t.newQuantity}</strong></span>
                      </td>

                      {/* Reference */}
                      <td className="py-3 px-4 text-slate-300 text-[11px] truncate max-w-[150px]">
                        {t.reference || '-'}
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        <div className="text-slate-200">{t.actorName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[130px] font-mono">{t.actorEmail}</div>
                      </td>

                      {/* View slip */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSlip(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="ดูใบสำคัญรับ-เบิกสินค้า"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="font-bold text-white text-sm">ใบสำคัญบันทึกการเคลื่อนไหวสต็อก</span>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Slip Content */}
            <div className="p-6 bg-white text-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-amber-600" />
                  <div>
                    <h3 className="font-bold text-base">WMS MKC MATERIALS</h3>
                    <p className="text-[10px] text-slate-600">บริษัท เอ็มเคซี ค้าวัสดุก่อสร้าง จำกัด</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
                    {selectedSlip.docNo}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    {new Date(selectedSlip.timestamp).toLocaleString('th-TH')}
                  </div>
                </div>
              </div>

              {/* Transaction Type Header */}
              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">ประเภทรายการ:</span>
                <span className="font-bold text-slate-950">
                  {selectedSlip.type === 'IN' ? 'รับเข้าสินค้า (Inbound)' : selectedSlip.type === 'OUT' ? 'เบิกจ่ายสินค้า (Outbound)' : selectedSlip.type === 'TRANSFER' ? 'ย้ายโซนจัดเก็บ (Transfer)' : 'ปรับยอดสต็อก (Adjust)'}
                </span>
              </div>

              {/* Item Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">รหัส SKU:</span>
                  <span className="font-mono font-bold">{selectedSlip.productSku}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">รายการวัสดุก่อสร้าง:</span>
                  <span className="font-semibold text-right max-w-[240px]">{selectedSlip.productName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">จำนวนที่ทำรายการ:</span>
                  <span className="font-mono font-bold text-sm text-slate-950">
                    {selectedSlip.quantity.toLocaleString()} {selectedSlip.unit}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">ยอดคงเหลือก่อนหน้า / หลังทำ:</span>
                  <span className="font-mono">{selectedSlip.previousQuantity} → {selectedSlip.newQuantity} {selectedSlip.unit}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">โซนจัดเก็บ:</span>
                  <span className="font-medium">{selectedSlip.zone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">เลขที่อ้างอิง / โครงการ:</span>
                  <span className="font-medium text-amber-800">{selectedSlip.reference || '-'}</span>
                </div>
                {selectedSlip.notes && (
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">หมายเหตุ:</span>
                    <span className="text-slate-700">{selectedSlip.notes}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">ผู้ดำเนินการ:</span>
                  <span className="font-medium">{selectedSlip.actorName} ({selectedSlip.actorEmail})</span>
                </div>
              </div>

              {/* Signature boxes */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-200 text-center text-[11px] text-slate-500">
                <div className="border border-dashed border-slate-300 rounded p-4 h-16 flex flex-col justify-end">
                  <div className="border-t border-slate-300 pt-1">ผู้ส่งมอบ / เจ้าหน้าที่คลัง</div>
                </div>
                <div className="border border-dashed border-slate-300 rounded p-4 h-16 flex flex-col justify-end">
                  <div className="border-t border-slate-300 pt-1">ผู้รับสินค้า / ผู้เบิก</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Firebase Firestore Real-time Log</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบสำคัญ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
