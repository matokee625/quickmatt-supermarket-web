import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { products as localProducts } from '@/data/products';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const conn = await connectToDatabase();

    if (conn) {
      let product = null;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id).lean();
      } else {
        product = await Product.findOne({ id: id }).lean();
      }

      if (product) {
        return NextResponse.json({
          success: true,
          product: { ...product, id: product._id.toString() },
        });
      }
    }

    const localProd = localProducts.find((p) => String(p.id) === String(id));
    if (localProd) {
      return NextResponse.json({ success: true, product: localProd });
    }

    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  // ── Admin-only: protect product updates ──
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const updates = await request.json();
    const conn = await connectToDatabase();

    if (conn && id.match(/^[0-9a-fA-F]{24}$/)) {
      const updated = await Product.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (updated) {
        return NextResponse.json({
          success: true,
          product: { ...updated, id: updated._id.toString() },
        });
      }
    }

    // Local fallback update
    const index = localProducts.findIndex((p) => String(p.id) === String(id));
    if (index !== -1) {
      localProducts[index] = { ...localProducts[index], ...updates };
      return NextResponse.json({
        success: true,
        product: localProducts[index],
      });
    }

    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  // ── Admin-only: protect product deletion ──
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const conn = await connectToDatabase();

    if (conn && id.match(/^[0-9a-fA-F]{24}$/)) {
      await Product.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Product deleted successfully' });
    }

    const index = localProducts.findIndex((p) => String(p.id) === String(id));
    if (index !== -1) {
      localProducts.splice(index, 1);
      return NextResponse.json({ success: true, message: 'Product deleted from memory' });
    }

    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
