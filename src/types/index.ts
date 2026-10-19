export type MaterialCategory = 
  | 'ปูนซีเมนต์และคอนกรีต'
  | 'เหล็กและโลหะโครงสร้าง'
  | 'อิฐ หิน ดิน ทราย'
  | 'กระเบื้องและสุขภัณฑ์'
  | 'ท่อประปาและข้อต่อ'
  | 'สีและเคมีภัณฑ์ก่อสร้าง'
  | 'หลังคาและฝ้าเพดาน'
  | 'อุปกรณ์ช่างและฮาร์ดแวร์';

export type MaterialUnit = 
  | 'ถุง'
  | 'เส้น'
  | 'ตัน'
  | 'ก้อน'
  | 'กล่อง'
  | 'ท่อน'
  | 'ถัง'
  | 'แผ่น'
  | 'ขด'
  | 'ชิ้น'
  | 'ชุด';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  quantity: number;
  minStock: number;
  costPrice: number;
  sellingPrice: number;
  warehouseZone: string;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';

export interface StockTransaction {
  id: string;
  docNo: string;
  type: MovementType;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  unit: string;
  zone: string;
  destinationZone?: string;
  reference: string;
  actorEmail: string;
  actorName: string;
  actorUid: string;
  timestamp: string;
  notes?: string;
}

export interface WarehouseZone {
  id: string;
  name: string;
  code: string;
  type: string;
  capacityMax: number;
  description: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'manager' | 'staff';
  lastLogin: string;
}
