import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, INITIAL_PRODUCTS, INITIAL_WAREHOUSES } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Product, StockTransaction, WarehouseZone, MovementType } from '../types';

interface RecordMovementParams {
  productId: string;
  type: MovementType;
  quantity: number;
  reference: string;
  notes?: string;
  destinationZone?: string;
  customDocNo?: string;
}

interface InventoryContextType {
  products: Product[];
  transactions: StockTransaction[];
  warehouses: WarehouseZone[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  recordStockMovement: (params: RecordMovementParams) => Promise<void>;
  reseedData: () => Promise<void>;
  // Computed metrics
  totalValuation: number;
  totalQuantity: number;
  lowStockItems: Product[];
  outOfStockItems: Product[];
  recentMovements: StockTransaction[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseZone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only subscribe to Firestore when user is authenticated
    if (!user) {
      setProducts([]);
      setTransactions([]);
      setWarehouses([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Subscribe to Products
    const productsPath = 'products';
    const productsCol = collection(db, productsPath);
    const unsubProducts = onSnapshot(
      productsCol,
      (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as Product);
        });
        // Sort by name
        items.sort((a, b) => a.name.localeCompare(b.name, 'th'));
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching products:', err);
        setError('ไม่สามารถเชื่อมต่อข้อมูลสินค้าจาก Firestore ได้');
        handleFirestoreError(err, OperationType.LIST, productsPath);
      }
    );

    // 2. Subscribe to Transactions (Recent 100)
    const transactionsPath = 'transactions';
    const transactionsQuery = query(
      collection(db, transactionsPath),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const unsubTransactions = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const logs: StockTransaction[] = [];
        snapshot.forEach((docSnap) => {
          logs.push({ id: docSnap.id, ...docSnap.data() } as StockTransaction);
        });
        setTransactions(logs);
      },
      (err) => {
        console.warn('Error fetching transactions (ordering might need index, fallback to direct query):', err);
        // Fallback without orderBy if index is building
        const fallbackCol = collection(db, transactionsPath);
        onSnapshot(fallbackCol, (snap) => {
          const logs: StockTransaction[] = [];
          snap.forEach((d) => logs.push({ id: d.id, ...d.data() } as StockTransaction));
          logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setTransactions(logs.slice(0, 100));
        }, (fErr) => {
          handleFirestoreError(fErr, OperationType.LIST, transactionsPath);
        });
      }
    );

    // 3. Subscribe to Warehouses
    const whPath = 'warehouses';
    const unsubWarehouses = onSnapshot(
      collection(db, whPath),
      (snapshot) => {
        const whs: WarehouseZone[] = [];
        snapshot.forEach((docSnap) => {
          whs.push({ id: docSnap.id, ...docSnap.data() } as WarehouseZone);
        });
        setWarehouses(whs.length > 0 ? whs : INITIAL_WAREHOUSES);
      },
      (err) => {
        console.error('Error fetching warehouses:', err);
        setWarehouses(INITIAL_WAREHOUSES);
      }
    );

    return () => {
      unsubProducts();
      unsubTransactions();
      unsubWarehouses();
    };
  }, [user]);

  // Add Product
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const now = new Date().toISOString();
      const payload = {
        ...productData,
        createdAt: now,
        updatedAt: now,
        createdBy: user?.email || 'admin'
      };
      const docRef = await addDoc(collection(db, 'products'), payload);

      // Record an initial stock transaction if quantity > 0
      if (payload.quantity > 0) {
        const docNo = `INIT-${Date.now().toString().slice(-6)}`;
        await addDoc(collection(db, 'transactions'), {
          docNo,
          type: 'IN',
          productId: docRef.id,
          productSku: payload.sku,
          productName: payload.name,
          quantity: payload.quantity,
          previousQuantity: 0,
          newQuantity: payload.quantity,
          unit: payload.unit,
          zone: payload.warehouseZone,
          reference: 'สร้างรายการสินค้าใหม่',
          actorEmail: user?.email || 'system',
          actorName: user?.displayName || 'ผู้ดูแลระบบ',
          actorUid: user?.uid || 'system',
          timestamp: now,
          notes: 'บันทึกสต็อกเริ่มต้น'
        });
      }

      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    }
  };

  // Update Product
  const updateProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
    }
  };

  // Delete Product
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  // Record Stock Movement with atomic batching
  const recordStockMovement = async ({
    productId,
    type,
    quantity,
    reference,
    notes = '',
    destinationZone,
    customDocNo
  }: RecordMovementParams): Promise<void> => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      throw new Error('ไม่พบข้อมูลสินค้านี้ในระบบ');
    }

    const prevQty = product.quantity;
    let newQty = prevQty;

    if (type === 'IN') {
      newQty = prevQty + quantity;
    } else if (type === 'OUT') {
      if (prevQty < quantity) {
        throw new Error(`สต็อกไม่เพียงพอ! มีในคลัง ${prevQty} ${product.unit} แต่ต้องการเบิก ${quantity} ${product.unit}`);
      }
      newQty = prevQty - quantity;
    } else if (type === 'ADJUST') {
      newQty = quantity; // In adjust, quantity passed is target physical count
    } else if (type === 'TRANSFER') {
      // Zone changed, quantity stays the same or moved
      newQty = prevQty;
    }

    const prefix = type === 'IN' ? 'RC' : type === 'OUT' ? 'DO' : type === 'TRANSFER' ? 'TR' : 'ADJ';
    const timestampStr = new Date().toISOString();
    const docNo = customDocNo || `${prefix}-${new Date().toISOString().slice(2, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const batch = writeBatch(db);

    // 1. Update Product
    const productRef = doc(db, 'products', productId);
    const productUpdate: Record<string, unknown> = {
      quantity: newQty,
      updatedAt: timestampStr
    };
    if (type === 'TRANSFER' && destinationZone) {
      productUpdate.warehouseZone = destinationZone;
    }
    batch.update(productRef, productUpdate);

    // 2. Insert Transaction Log
    const transactionRef = doc(collection(db, 'transactions'));
    const movementQty = type === 'ADJUST' ? Math.abs(newQty - prevQty) : quantity;

    batch.set(transactionRef, {
      id: transactionRef.id,
      docNo,
      type,
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      quantity: movementQty,
      previousQuantity: prevQty,
      newQuantity: newQty,
      unit: product.unit,
      zone: product.warehouseZone,
      destinationZone: destinationZone || '',
      reference: reference || 'การเคลื่อนย้ายคลังสินค้า',
      actorEmail: user?.email || 'admin@gmail.com',
      actorName: user?.displayName || 'ผู้ดูแลคลังสินค้า',
      actorUid: user?.uid || 'system',
      timestamp: timestampStr,
      notes: notes || ''
    });

    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'batch:products+transactions');
    }
  };

  // Reseed data helper
  const reseedData = async () => {
    try {
      setLoading(true);
      const batch = writeBatch(db);
      const productsRef = collection(db, 'products');

      for (const prod of INITIAL_PRODUCTS) {
        const newDoc = doc(productsRef);
        batch.set(newDoc, {
          ...prod,
          id: newDoc.id
        });
      }

      const whRef = collection(db, 'warehouses');
      for (const wh of INITIAL_WAREHOUSES) {
        batch.set(doc(whRef, wh.id), wh);
      }

      await batch.commit();
      setLoading(false);
    } catch (err) {
      console.error('Error reseeding:', err);
      setLoading(false);
    }
  };

  // Computed metrics
  const totalValuation = useMemo(() => {
    return products.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);
  }, [products]);

  const totalQuantity = useMemo(() => {
    return products.reduce((acc, item) => acc + item.quantity, 0);
  }, [products]);

  const lowStockItems = useMemo(() => {
    return products.filter((item) => item.quantity > 0 && item.quantity <= item.minStock);
  }, [products]);

  const outOfStockItems = useMemo(() => {
    return products.filter((item) => item.quantity <= 0);
  }, [products]);

  const recentMovements = useMemo(() => {
    return transactions.slice(0, 15);
  }, [transactions]);

  return (
    <InventoryContext.Provider
      value={{
        products,
        transactions,
        warehouses,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        recordStockMovement,
        reseedData,
        totalValuation,
        totalQuantity,
        lowStockItems,
        outOfStockItems,
        recentMovements
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
