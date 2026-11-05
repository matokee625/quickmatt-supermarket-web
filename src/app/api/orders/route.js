import { NextResponse } from 'next/server';

// Server-side in-memory orders store
let globalOrders = [
  {
    id: 'QKM-98124',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: 'packing',
    statusText: 'Groceries being packed fresh at Quickmart Kilimani Deli',
    estimatedTime: '20 - 30 mins',
    branch: { id: 'kilimani', name: 'Quickmart Kilimani', phone: '+254 709 123 001' },
    fulfillmentMode: 'delivery',
    deliveryAddress: {
      fullName: 'Brian Omondi',
      phone: '0722123456',
      street: 'Wood Avenue, Kilimani',
      building: 'Woodview Suites 3A',
      city: 'Nairobi',
    },
    payment: {
      method: 'mpesa',
      mpesaReceipt: 'QKM78129KP',
      status: 'Paid',
      phone: '0722123456',
    },
    items: [
      { id: 26, name: 'Jogoo Premium Fortified Maize Meal Unga', price: 175, quantity: 2 },
      { id: 28, name: 'Rina Pure Vegetable Cooking Oil', price: 720, quantity: 1 },
      { id: 9, name: 'Brookside Fresh Milk 500ml', price: 65, quantity: 4 },
      { id: 1, name: 'Fresh Sukuma Wiki (Collard Greens)', price: 35, quantity: 3 },
    ],
    subtotal: 1435,
    deliveryFee: 150,
    discount: 100,
    total: 1485,
    earnedPoints: 14,
  },
];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const order = globalOrders.find((o) => o.id === id);
      if (!order) {
        return NextResponse.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({
      success: true,
      totalOrders: globalOrders.length,
      orders: globalOrders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, branch, deliveryAddress, payment, subtotal, deliveryFee, discount, total, fulfillmentMode } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least 1 item' },
        { status: 400 }
      );
    }

    const orderId = `QKM-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'received',
      statusText: 'Order received at Quickmart branch and confirmed by system',
      estimatedTime: '30 - 45 mins',
      branch: branch || { id: 'kilimani', name: 'Quickmart Kilimani' },
      fulfillmentMode: fulfillmentMode || 'delivery',
      deliveryAddress: deliveryAddress || {},
      payment: payment || { method: 'mpesa', status: 'Paid', mpesaReceipt: 'QKM' + Date.now().toString().slice(-6) },
      items,
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      earnedPoints: Math.floor((Number(total) || 0) / 100),
      rider: {
        name: 'REUBEN MATOKE',
        phone: '+254799014136',
        vehicle: 'Express Dispatch KME 789A',
      },
    };

    globalOrders.unshift(newOrder);

    return NextResponse.json({
      success: true,
      message: 'Quickmart order created successfully',
      order: newOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

