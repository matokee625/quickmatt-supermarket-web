import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { products as localProducts } from '@/data/products';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request) {
  // ── Admin-only: protect database seeding ──
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const conn = await connectToDatabase();
    if (!conn) {
      return NextResponse.json({
        success: false,
        message: 'No MONGODB_URI configured. Set MONGODB_URI in your environment to seed MongoDB.',
      }, { status: 400 });
    }

    const existingCount = await Product.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({
        success: true,
        message: `Database already seeded. Contains ${existingCount} products.`,
        count: existingCount,
      });
    }

    // Prepare products for insertion without local fixed ID collision
    const formatted = localProducts.map((p) => {
      const { id, ...rest } = p;
      return {
        ...rest,
        stockCount: p.stockCount || 50,
        inStock: p.inStock !== false,
      };
    });

    const inserted = await Product.insertMany(formatted);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} Quickmart products into MongoDB!`,
      count: inserted.length,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Seeding failed',
    }, { status: 500 });
  }
}

