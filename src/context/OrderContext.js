'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const OrderContext = createContext();

const ORDERS_STORAGE_KEY = 'quickmart_placed_orders_v2';
const LOYALTY_POINTS_KEY = 'quickmart_loyalty_points';

const initialDemoOrders = [
  {
    id: 'QKM-78291',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'out_for_delivery', // 'received' | 'packing' | 'out_for_delivery' | 'delivered'
    statusText: 'Rider is on the way with your groceries',
    estimatedTime: '15 - 20 mins',
    branch: {
      id: 'kilimani',
      name: 'Quickmart Kilimani',
      phone: '+254 709 123 001',
    },
    fulfillmentMode: 'delivery',
    deliveryAddress: {
      fullName: 'Grace Wanjiku',
      phone: '0712345678',
      street: 'Rose Avenue, Kilimani',
      building: 'Silver Oak Apartments, Apt 4B',
      city: 'Nairobi',
    },
    payment: {
      method: 'mpesa',
      mpesaReceipt: 'QKM9182LA4',
      status: 'Paid',
      phone: '0712345678',
    },
    items: [
      {
        id: 9,
        name: 'Brookside Fresh Milk 500ml',
        price: 65,
        quantity: 2,
        unit: '500 ml pouch',
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop',
      },
      {
        id: 21,
        name: 'Quickmart Crusty White Sandwich Bread',
        price: 90,
        quantity: 1,
        unit: '800 g loaf',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
      },
      {
        id: 11,
        name: 'Farm Fresh Grade A Eggs (Tray of 30)',
        price: 430,
        quantity: 1,
        unit: 'Tray of 30 eggs',
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop',
      },
    ],
    subtotal: 650,
    deliveryFee: 150,
    discount: 0,
    total: 800,
    earnedPoints: 8,
    rider: {
      name: 'REUBEN MATOKE',
      phone: '+254799014136',
      vehicle: 'Motorbike KMD 432B',
    },
  },
];

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(140); // Initial welcome points
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
        setOrders(storedOrders ? JSON.parse(storedOrders) : initialDemoOrders);

        const storedPoints = localStorage.getItem(LOYALTY_POINTS_KEY);
        if (storedPoints !== null) {
          setLoyaltyPoints(Number(storedPoints));
        }
      } catch {
        setOrders(initialDemoOrders);
      }
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
        localStorage.setItem(LOYALTY_POINTS_KEY, String(loyaltyPoints));
      } catch {
        // Silently fail
      }
    }
  }, [orders, loyaltyPoints, isHydrated]);

  const createOrder = useCallback(
    (orderData) => {
      const orderId = `QKM-${Math.floor(10000 + Math.random() * 90000)}`;
      const newOrder = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: 'received',
        statusText: 'Order received at Quickmart branch and confirmed by system',
        estimatedTime: '30 - 45 mins',
        rider: {
          name: 'REUBEN MATOKE',
          phone: '+254799014136',
          vehicle: 'Express Dispatch KME 789A',
        },
        ...orderData,
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Add earned loyalty points
      if (orderData.earnedPoints) {
        setLoyaltyPoints((prev) => prev + orderData.earnedPoints);
      }

      // Deduct used loyalty points if applied
      if (orderData.redeemedPoints) {
        setLoyaltyPoints((prev) => Math.max(0, prev - orderData.redeemedPoints));
      }

      return newOrder;
    },
    []
  );

  const getOrderById = useCallback(
    (id) => {
      return orders.find((o) => o.id === id);
    },
    [orders]
  );

  const updateOrderStatus = useCallback((orderId, status, statusText) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, statusText: statusText || o.statusText } : o))
    );
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loyaltyPoints,
        createOrder,
        getOrderById,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}

