export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cafeId: string;
  cafeName: string;
}

export interface DeliveryRequest {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  itemPrice: number;
  pickupLocation: string;
  dropoffLocation: string;
  deliveryFee: number;
  totalAmount: number;
  status: 'open' | 'in-progress' | 'completed' | 'rejected' | 'ready';
  requesterId: string;
  requesterName: string;
  requesterPhotoURL?: string;
  requesterUid: string;
  delivererId: string | null;
  delivererName: string | null;
  createdAt: any;
  subStatus: 'reached-cafe' | 'picked-up' | null;
  estimatedTime: string | null;
  // New fields for owner management
  ownerStatus?: 'ready' | 'rejected' | null;
  pin?: string; // 4-digit PIN for secure handoff
  orderType?: 'delivery' | 'pickup'; // Delivery vs Self Pickup
}

export type UserRole = 'student' | 'deliverer' | 'owner';
