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
  status: 'open' | 'in-progress' | 'completed';
  requesterId: string;
  requesterName: string;
  requesterPhotoURL?: string;
  requesterUid: string;
  delivererId: string | null;
  delivererName: string | null;
  createdAt: any;
  subStatus: 'reached-cafe' | 'picked-up' | null;
  estimatedTime: string | null;
}
