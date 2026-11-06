import { NextResponse } from 'next/server';
import { products as localProducts, categories, searchProducts, getProductsByCategory } from '@/data/products';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const limit = searchParams.get('limit');

    const conn = await connectToDatabase();

    if (conn) {
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      } else if (category && category !== 'all') {
        query.categorySlug = category;
      }

      let mongoQuery = Product.find(query);

      if (sort === 'price-asc') {
        mongoQuery = mongoQuery.sort({ price: 1 });
      } else if (sort === 'price-desc') {
        mongoQuery = mongoQuery.sort({ price: -1 });
      } else if (sort === 'rating') {
        mongoQuery = mongoQuery.sort({ rating: -1 });
      } else if (sort === 'popular') {
        mongoQuery = mongoQuery.sort({ reviewsCount: -1 });
      }

      if (limit) {
        mongoQuery = mongoQuery.limit(parseInt(limit, 10));
      }

      const productsFromDb = await mongoQuery.lean();

      if (productsFromDb && productsFromDb.length > 0) {
        const normalized = productsFromDb.map((p) => ({
          ...p,
          id: p._id.toString(),
        }));
        return NextResponse.json({
          success: true,
          source: 'mongodb',
          count: normalized.length,
          categories,
          products: normalized,
        });
      }
    }

    // Graceful fallback to rich local catalog if MongoDB isn't populated or connected
    let result = [...localProducts];

    if (search) {
      result = searchProducts(search);
    } else if (category && category !== 'all') {
      result = getProductsByCategory(category);
    }

    if (sort === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'popular') {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    if (limit) {
      result = result.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json({
      success: true,
      source: 'local',
      count: result.length,
      categories,
      products: result,
    });
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Quickmart products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  // ── Admin-only: protect product creation ──
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const conn = await connectToDatabase();
    const data = await request.json();

    if (!data.name || !data.price || !data.category) {
      return NextResponse.json(
        { success: false, message: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    if (conn) {
      const newProduct = await Product.create({
        ...data,
        categorySlug: data.categorySlug || data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        image: data.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop',
        inStock: data.inStock !== false,
      });

      return NextResponse.json({
        success: true,
        source: 'mongodb',
        product: { ...newProduct.toObject(), id: newProduct._id.toString() },
      }, { status: 201 });
    }

    // In-memory addition fallback
    const id = Date.now();
    const fallbackProduct = {
      id,
      ...data,
      categorySlug: data.categorySlug || data.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: data.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop',
      inStock: data.inStock !== false,
    };
    localProducts.unshift(fallbackProduct);

    return NextResponse.json({
      success: true,
      source: 'local_memory',
      product: fallbackProduct,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/products:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
