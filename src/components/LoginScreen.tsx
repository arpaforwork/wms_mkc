import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  Layers, 
  Boxes, 
  TrendingUp, 
  AlertCircle,
  Database,
  ArrowRight,
  HardHat
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, error, clearError, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">WMS MKC</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                คลังวัสดุก่อสร้าง
              </span>
            </div>
            <p className="text-xs text-slate-400">ระบบบริหารคลังสินค้าแบบเรียลไทม์</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-800/60 border border-slate-700/60 rounded-full px-3 py-1.5 text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Firebase Project:</span>
          <span className="font-mono text-emerald-300 font-semibold">wms-mkc</span>
        </div>
      </header>

      {/* Main Hero & Login Box */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 relative z-10">
        {/* Left column: System features & value */}
        <div className="flex-1 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
            <HardHat className="w-4 h-4 text-amber-400" />
            <span>ระบบคลังสินค้าวัสดุก่อสร้างมาตรฐานสากล</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            ตรวจเช็คสต็อกเรียลไทม์ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
              แม่นยำ ปลอดภัย ทุกโกดัง
            </span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed max-w-xl">
            ออกแบบเฉพาะสำหรับธุรกิจจัดจำหน่ายวัสดุก่อสร้าง คอนกรีต เหล็กเส้น อิฐ หิน ทราย ท่อประปา และกระเบื้อง 
            พร้อมสรุปมูลค่าคลังสินค้าและประวัติการรับเข้า-เบิกจ่ายแบบทันที ผ่านฐานข้อมูล Firebase <span className="text-amber-400 font-mono font-medium">wms-mkc</span>
          </p>

          {/* Key Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">สต็อกคงคลังแบบสด</h3>
                <p className="text-xs text-slate-400 mt-0.5">อัปเดตยอดคงเหลือทันทีเมื่อรับเข้าหรือจ่ายออก</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">แดชบอร์ดสรุปมูลค่า</h3>
                <p className="text-xs text-slate-400 mt-0.5">คำนวณมูลค่ารวมและแยกตามหมวดหมู่วัสดุ</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">แยกโซนโกดังและลานกอง</h3>
                <p className="text-xs text-slate-400 mt-0.5">ระบุตำแหน่งจัดเก็บ ปูน เหล็ก หิน ทราย ชัดเจน</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-100">แจ้งเตือนสินค้าใกล้หมด</h3>
                <p className="text-xs text-slate-400 mt-0.5">เตือนทันทีเมื่อต่ำกว่าเกณฑ์สั่งซื้อขั้นต่ำ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Login Card */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">เข้าสู่ระบบ WMS MKC</h2>
            <p className="text-sm text-slate-400">
              ลงชื่อเข้าใช้ด้วยบัญชี Gmail ของคุณเพื่อจัดการและตรวจสอบสต็อกวัสดุก่อสร้าง
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">การเข้าสู่ระบบล้มเหลว</p>
                <p className="opacity-90">{error}</p>
                <button 
                  onClick={clearError}
                  className="mt-2 text-rose-400 underline hover:text-rose-300 text-xs"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            </div>
          )}

          {/* Google / Gmail Sign In Button */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm flex items-center justify-center gap-3 transition-all shadow-lg shadow-white/10 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {/* Google Colorful Logo SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-semibold">เข้าสู่ระบบด้วย Gmail (Google)</span>
          </button>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>การเชื่อมต่อปลอดภัยระดับองค์กร (Firebase Auth)</span>
            </div>
            <p className="text-[11px] text-slate-400">
              ระบบรองรับการยืนยันตัวตนสำหรับผู้จัดการคลังสินค้าและฝ่ายเบิกจ่ายวัสดุ
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 px-6 py-4 text-center text-xs text-slate-400">
        <p>© 2026 WMS MKC - ระบบบริหารคลังสินค้าวัสดุก่อสร้างครบวงจร • โครงการ Firebase: <span className="font-mono text-slate-300">wms-mkc</span></p>
      </footer>
    </div>
  );
};
