
export interface Address {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutFormData {
  email: string;
  billingAddress: Address;
  shippingAddress?: Address;
  sameAsShipping: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'digital' | 'physical';
  image?: string;
}

export interface OrderConfirmation {
  orderId: string;
  items: OrderItem[];
  total: number;
  email: string;
  shippingAddress?: Address;
  billingAddress: Address;
  paymentStatus: 'succeeded' | 'pending' | 'failed';
  createdAt: string;
}
