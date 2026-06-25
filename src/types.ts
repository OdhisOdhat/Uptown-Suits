export interface Measurement {
  chest: number;
  waist: number;
  hips: number;
  neck: number;
  sleeveLength: number;
  inseam: number;
}

export type OrderStatus =
  | "Pending"
  | "Fabric sourcing"
  | "Cutting"
  | "Sewing"
  | "Quality check"
  | "Ready for fitting"
  | "Completed"
  | "Delivered";

export interface CustomDesignSpec {
  category: "suit" | "shirt" | "trousers" | "jacket" | "dress" | "shoes" | "accessories";
  fabric: string;
  color: string;
  pattern: string;
  collarStyle?: string;
  lapelStyle?: string;
  cuffsStyle?: string;
  pocketsStyle?: string;
  shoeSize?: string;
  shoeType?: string;
  leatherType?: string;
  accessoryType?: string;
  additionalNotes?: string;
  estimatedMeasurements?: Partial<Measurement>;
  aiInsights?: string;
  designName?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  type: "custom" | "ready-made";
  status: OrderStatus;
  totalPrice: number;
  date: string;
  assignedTo?: "Cutter" | "Sewer" | "Finisher" | "None";
  // For ready-made products
  productId?: string;
  productName?: string;
  productImage?: string;
  productCategory?: string;
  // For custom garments
  customDetails?: CustomDesignSpec;
  measurements?: Measurement;
}

export interface RepairRequest {
  id: string;
  customerName: string;
  customerEmail: string;
  garmentType: string;
  issueType: string;
  description: string;
  imageUrl?: string;
  costEstimate: number;
  timeEstimate: string;
  complexity: "Simple" | "Moderate" | "Complex";
  status: "Submitted" | "Courier collection" | "In repair" | "Quality check" | "Ready for pickup" | "Delivered";
  date: string;
  pickupOption: "Customer drop-off" | "Courier collection" | "Home pickup";
}

export interface Product {
  id: string;
  category: "suits" | "shirts" | "trousers" | "jackets" | "shoes" | "accessories" | "dresses" | "traditional" | "wedding";
  name: string;
  price: number;
  description: string;
  image: string;
  stock: number;
  rating: number;
  sizeGuide?: string[];
  fabricInfo?: string;
}

export interface WardrobeItem {
  id: string;
  type: "custom" | "purchased" | "owned";
  name: string;
  category: string;
  fabric?: string;
  color: string;
  pattern?: string;
  image: string;
  dateAdded: string;
  status?: string;
}
