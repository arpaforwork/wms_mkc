import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Product, WarehouseZone } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Error handling mandated by skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation connection test on startup as mandated in SKILL.md
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
    return false;
  }
}

// Initial construction material inventory list for WMS MKC
export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    sku: 'CEM-SCG-01',
    name: 'ปูนซีเมนต์ไฮดรอลิก ตราช้าง (ปูนโครงสร้าง) 50 กก.',
    category: 'ปูนซีเมนต์และคอนกรีต',
    unit: 'ถุง',
    quantity: 450,
    minStock: 100,
    costPrice: 135,
    sellingPrice: 155,
    warehouseZone: 'โกดัง 1 (ปูนซีเมนต์และเคมี)',
    supplier: 'เอสซีจี ซีเมนต์ จำกัด',
    notes: 'มาตรฐาน มอก. 2594-2556 เหมาะสำหรับงานโครงสร้างคอนกรีต เสา คาน ฐานราก',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'CEM-TGR-02',
    name: 'ปูนเสือ ซูเปอร์ซีเมนต์ งานก่อ-ฉาบ 50 กก.',
    category: 'ปูนซีเมนต์และคอนกรีต',
    unit: 'ถุง',
    quantity: 280,
    minStock: 80,
    costPrice: 110,
    sellingPrice: 130,
    warehouseZone: 'โกดัง 1 (ปูนซีเมนต์และเคมี)',
    supplier: 'ปูนซีเมนต์ไทย',
    notes: 'เนื้อเหนียวลื่น ฉาบเรียบ ไม่แตกร้าว',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'STL-RB9-10M',
    name: 'เหล็กเส้นกลม ผิวเรียบ RB9 มอก. SR24 ยาว 10 ม.',
    category: 'เหล็กและโลหะโครงสร้าง',
    unit: 'เส้น',
    quantity: 320,
    minStock: 150,
    costPrice: 118,
    sellingPrice: 138,
    warehouseZone: 'โกดัง 2 (ลานจัดเก็บเหล็กรูปพรรณ)',
    supplier: 'โรงงานเหล็กกรุงเทพฯ มอก.',
    notes: 'เหล็กปลอกเสา-คาน มอก. 20-2559 น้ำหนักเต็ม',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'STL-DB12-10M',
    name: 'เหล็กข้ออ้อย DB12 มอก. SD40T ยาว 10 ม.',
    category: 'เหล็กและโลหะโครงสร้าง',
    unit: 'เส้น',
    quantity: 65,
    minStock: 120, // Low stock demo!
    costPrice: 215,
    sellingPrice: 245,
    warehouseZone: 'โกดัง 2 (ลานจัดเก็บเหล็กรูปพรรณ)',
    supplier: 'ทาทาสตีล (ประเทศไทย)',
    notes: 'เหล็กข้ออ้อยทนแผ่นดินไหว SD40T น้ำหนักมาตรฐาน',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'STL-BOX-2X2',
    name: 'เหล็กกล่องกัลวาไนซ์ Gi 2"x2" หนา 2.0 มม. ยาว 6 ม.',
    category: 'เหล็กและโลหะโครงสร้าง',
    unit: 'เส้น',
    quantity: 180,
    minStock: 50,
    costPrice: 380,
    sellingPrice: 440,
    warehouseZone: 'โกดัง 2 (ลานจัดเก็บเหล็กรูปพรรณ)',
    supplier: 'แปซิฟิกไปป์ จำกัด',
    notes: 'ชุบกัลวาไนซ์กันสนิม ไม่ต้องทาสีกันสนิม',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'BRK-BLK-07',
    name: 'อิฐบล็อกคอนกรีต หนา 7 ซม. (มาตรฐานก่อสร้าง)',
    category: 'อิฐ หิน ดิน ทราย',
    unit: 'ก้อน',
    quantity: 3500,
    minStock: 1000,
    costPrice: 5.5,
    sellingPrice: 7.5,
    warehouseZone: 'ลานกองวัสดุกลางแจ้ง A',
    supplier: 'โรงงานบล็อกประสาน นครปฐม',
    notes: 'มัดพาเลทละ 400 ก้อน',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'BRK-RED-STD',
    name: 'อิฐมอญ 2 รู ขนาด 3x6x14 ซม.',
    category: 'อิฐ หิน ดิน ทราย',
    unit: 'ก้อน',
    quantity: 8500,
    minStock: 2000,
    costPrice: 1.2,
    sellingPrice: 1.8,
    warehouseZone: 'ลานกองวัสดุกลางแจ้ง A',
    supplier: 'โรงเผาอิฐสิงห์บุรี',
    notes: 'อิฐเผาแกร่ง ไม่แตกหักง่าย',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'AGG-STN-01',
    name: 'หิน 1 (หินก่อสร้าง เบอร์ 1 สำหรับผสมคอนกรีต)',
    category: 'อิฐ หิน ดิน ทราย',
    unit: 'ตัน',
    quantity: 85,
    minStock: 30,
    costPrice: 380,
    sellingPrice: 460,
    warehouseZone: 'ลานกองวัสดุกลางแจ้ง B',
    supplier: 'โรงโม่หินสระบุรี',
    notes: 'หินปูนสะอาด คัดขนาดสม่ำเสมอ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'AGG-SND-CR',
    name: 'ทรายหยาบคัดเกรด งานโครงสร้าง/เทพื้น',
    category: 'อิฐ หิน ดิน ทราย',
    unit: 'ตัน',
    quantity: 18,
    minStock: 25, // Low stock demo!
    costPrice: 320,
    sellingPrice: 390,
    warehouseZone: 'ลานกองวัสดุกลางแจ้ง B',
    supplier: 'ท่าทรายอยุธยา',
    notes: 'ล้างสะอาด ปราศจากดินโคลนเจือปน',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'TIL-COT-6060',
    name: 'กระเบื้องพอร์ซเลน COTTO 60x60 ซม. ลายหินอ่อนคาราร่า (กล่องละ 1.44 ตร.ม.)',
    category: 'กระเบื้องและสุขภัณฑ์',
    unit: 'กล่อง',
    quantity: 210,
    minStock: 50,
    costPrice: 310,
    sellingPrice: 385,
    warehouseZone: 'โกดัง 3 (กระเบื้อง ท่อ และสุขภัณฑ์)',
    supplier: 'เอสซีจี เซรามิกส์',
    notes: 'ผิวเงา Nano Polish ทนรอยขีดข่วน',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'ROF-SCG-120',
    name: 'กระเบื้องหลังคาลอนคู่ SCG 50x120 ซม. สีเทาช้าง',
    category: 'หลังคาและฝ้าเพดาน',
    unit: 'แผ่น',
    quantity: 420,
    minStock: 100,
    costPrice: 52,
    sellingPrice: 65,
    warehouseZone: 'โกดัง 4 (วัสดุหลังคาและฝ้า)',
    supplier: 'เอสซีจี รูฟฟิ่ง',
    notes: 'สูตรปราศจากใยหิน แข็งแรงทนทาน',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'PVC-SCG-2IN',
    name: 'ท่อ PVC SCG สีฟ้า ชั้น 8.5 ขนาด 2 นิ้ว ยาว 4 ม.',
    category: 'ท่อประปาและข้อต่อ',
    unit: 'ท่อน',
    quantity: 140,
    minStock: 40,
    costPrice: 195,
    sellingPrice: 235,
    warehouseZone: 'โกดัง 3 (กระเบื้อง ท่อ และสุขภัณฑ์)',
    supplier: 'ท่อนวพลาสติก',
    notes: 'มาตรฐาน มอก. 17-2532 ท่อน้ำประปาแรงดันสูง',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'CHM-CRO-20K',
    name: 'กาวซีเมนต์ จระเข้เขียว ยึดเกาะสูง 20 กก.',
    category: 'สีและเคมีภัณฑ์ก่อสร้าง',
    unit: 'ถุง',
    quantity: 95,
    minStock: 30,
    costPrice: 145,
    sellingPrice: 175,
    warehouseZone: 'โกดัง 1 (ปูนซีเมนต์และเคมี)',
    supplier: 'บจก. จระเข้ คอร์ปอเรชั่น',
    notes: 'สำหรับปูกระเบื้องเซรามิก แกรนิตโต้ ขนาดมาตรฐาน',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'CHM-SIKA-WAT',
    name: 'น้ำยากันซึมคอนกรีต Sika Plastocrete Plus 5 ลิตร',
    category: 'สีและเคมีภัณฑ์ก่อสร้าง',
    unit: 'ถัง',
    quantity: 12,
    minStock: 15, // Low stock demo!
    costPrice: 260,
    sellingPrice: 320,
    warehouseZone: 'โกดัง 1 (ปูนซีเมนต์และเคมี)',
    supplier: 'ซิก้า (ประเทศไทย)',
    notes: 'ลดการแตกร้าว เพิ่มความทึบน้ำในงานเทคอนกรีต',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    sku: 'HDW-WR-18',
    name: 'ลวดผูกเหล็ก เบอร์ 18 (มัดละ 2.5 กก.)',
    category: 'อุปกรณ์ช่างและฮาร์ดแวร์',
    unit: 'ขด',
    quantity: 110,
    minStock: 25,
    costPrice: 90,
    sellingPrice: 115,
    warehouseZone: 'โกดัง 2 (ลานจัดเก็บเหล็กรูปพรรณ)',
    supplier: 'ไทยไวร์อินดัสตรีส์',
    notes: 'เหนียวนุ่ม ดัดง่าย ไม่เปราะขาดเวลาผูก',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_WAREHOUSES: WarehouseZone[] = [
  {
    id: 'wh-1',
    name: 'โกดัง 1 (ปูนซีเมนต์และเคมี)',
    code: 'WH-01',
    type: 'อาคารปิดควบคุมความชื้น',
    capacityMax: 5000,
    description: 'จัดเก็บปูนถุง กาวซีเมนต์ น้ำยาก่อสร้าง เคมีภัณฑ์ ป้องกันความชื้นและฝน 100%'
  },
  {
    id: 'wh-2',
    name: 'โกดัง 2 (ลานจัดเก็บเหล็กรูปพรรณ)',
    code: 'WH-02',
    type: 'โรงเรือนหลังคาสูงมีเครนยก',
    capacityMax: 3000,
    description: 'จัดเก็บเหล็กเส้นกลม ข้ออ้อย เหล็กกล่อง เหล็กรูปพรรณ พร้อมเครนโอเวอร์เฮด 5 ตัน'
  },
  {
    id: 'wh-3',
    name: 'โกดัง 3 (กระเบื้อง ท่อ และสุขภัณฑ์)',
    code: 'WH-03',
    type: 'ชั้นวาง Pallet Racking ในร่ม',
    capacityMax: 4000,
    description: 'จัดเก็บกระเบื้องปูพื้น-ผนัง ท่อ PVC ข้อต่อสุขภัณฑ์ และอุปกรณ์ประปา'
  },
  {
    id: 'wh-4',
    name: 'โกดัง 4 (วัสดุหลังคาและฝ้า)',
    code: 'WH-04',
    type: 'โรงเก็บสินค้ามาตรฐาน',
    capacityMax: 2500,
    description: 'จัดเก็บกระเบื้องหลังคา แผ่นยิปซัม ไม้ฝา และโครงคร่าวฝ้าเพดาน'
  },
  {
    id: 'wh-outdoor-a',
    name: 'ลานกองวัสดุกลางแจ้ง A',
    code: 'YARD-A',
    type: 'ลานคอนกรีตกลางแจ้งรับน้ำหนักสูง',
    capacityMax: 20000,
    description: 'จัดเก็บอิฐบล็อก อิฐมอญ ท่อคอนกรีต แผ่นพื้นสำเร็จรูป สะดวกต่อรถโฟล์คลิฟท์'
  },
  {
    id: 'wh-outdoor-b',
    name: 'ลานกองวัสดุกลางแจ้ง B',
    code: 'YARD-B',
    type: 'คอกคอนกรีตแบ่งช่องสำหรับวัสดุกอง',
    capacityMax: 500,
    description: 'จัดเก็บหิน 1, หิน 2, หินเกล็ด, ทรายหยาบ, ทรายละเอียด แบ่งตามคอก'
  }
];

// Seed sample products if collection is empty
export async function seedInitialDataIfEmpty(): Promise<boolean> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log('Seeding initial construction materials data into Firestore...');
      const batch = writeBatch(db);
      
      for (const prod of INITIAL_PRODUCTS) {
        const newDocRef = doc(productsRef);
        batch.set(newDocRef, {
          ...prod,
          id: newDocRef.id
        });
      }

      const whRef = collection(db, 'warehouses');
      for (const wh of INITIAL_WAREHOUSES) {
        const whDoc = doc(whRef, wh.id);
        batch.set(whDoc, wh);
      }

      await batch.commit();
      console.log('Initial construction materials seeded successfully!');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error seeding initial data:', error);
    return false;
  }
}
