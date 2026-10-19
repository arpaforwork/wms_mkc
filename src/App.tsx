/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StockTableView } from './components/StockTableView';
import { MovementModal } from './components/MovementModal';
import { AddProductModal } from './components/AddProductModal';
import { EditProductModal } from './components/EditProductModal';
import { BarcodeModal } from './components/BarcodeModal';
import { TransactionHistoryView } from './components/TransactionHistoryView';
import { WarehouseZonesView } from './components/WarehouseZonesView';
import { Product, MovementType } from './types';
import { Building2, Loader2, ArrowLeftRight, PlusCircle, MinusCircle, Radio } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementModalType, setMovementModalType] = useState<MovementType>('IN');
  const [movementModalProductId, setMovementModalProductId] = useState<string | undefined>(undefined);

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-100">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold shadow-xl shadow-amber-500/20">
          <Building2 className="w-8 h-8 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>กำลังเชื่อมต่อฐานข้อมูล Firebase (wms-mkc)...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleOpenMovementModal = (type: MovementType = 'IN', productId?: string) => {
    setMovementModalType(type);
    setMovementModalProductId(productId);
    setIsMovementModalOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleOpenBarcode = (product: Product) => {
    setBarcodeProduct(product);
  };

  return (
    <InventoryProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
        {/* Navigation bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMovementModal={handleOpenMovementModal}
          onOpenAddProductModal={() => setIsAddProductModalOpen(true)}
        />

        {/* Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenMovementModal={handleOpenMovementModal}
              onOpenAddProductModal={() => setIsAddProductModalOpen(true)}
            />
          )}

          {activeTab === 'inventory' && (
            <StockTableView
              onOpenMovementModal={handleOpenMovementModal}
              onOpenAddProductModal={() => setIsAddProductModalOpen(true)}
              onOpenEditProductModal={handleOpenEditProduct}
              onOpenBarcodeModal={handleOpenBarcode}
            />
          )}

          {activeTab === 'movements' && (
            <div className="space-y-6 pb-12">
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-6 h-6 text-amber-400" />
                    <h1 className="text-2xl font-bold text-white">ศูนย์รับเข้าและเบิกจ่ายวัสดุ</h1>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    บันทึกตรวจรับสินค้าจากผู้ผลิต หรือตัดจ่ายสินค้าส่งหน้างานก่อสร้าง
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenMovementModal('IN')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ บันทึกรับเข้า (Inbound)</span>
                  </button>

                  <button
                    onClick={() => handleOpenMovementModal('OUT')}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>- บันทึกเบิกจ่าย (Outbound)</span>
                  </button>
                </div>
              </div>

              {/* Transactions log table right below */}
              <TransactionHistoryView />
            </div>
          )}

          {activeTab === 'transactions' && (
            <TransactionHistoryView />
          )}

          {activeTab === 'zones' && (
            <WarehouseZonesView
              setActiveTab={setActiveTab}
              onOpenMovementModal={handleOpenMovementModal}
            />
          )}
        </main>

        {/* Global Modals */}
        <MovementModal
          isOpen={isMovementModalOpen}
          onClose={() => setIsMovementModalOpen(false)}
          defaultType={movementModalType}
          defaultProductId={movementModalProductId}
        />

        <AddProductModal
          isOpen={isAddProductModalOpen}
          onClose={() => setIsAddProductModalOpen(false)}
        />

        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
        />

        <BarcodeModal
          product={barcodeProduct}
          isOpen={!!barcodeProduct}
          onClose={() => setBarcodeProduct(null)}
        />
      </div>
    </InventoryProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
