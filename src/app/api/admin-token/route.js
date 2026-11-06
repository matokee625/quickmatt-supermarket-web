/**
 * GET /api/admin-token
 * Returns the admin API token to the admin dashboard only after they
 * supply the correct admin credentials in the request body.
 *
 * This keeps ADMIN_TOKEN_SECRET server-side – never bundled into client JS.
 */
import { NextResponse } from 'next/server';
import { getAdminToken } from '@/lib/adminAuth';

const ADMIN_USER = process.env.ADMIN_USERNAME || 'Reuben@2026';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Matoke@v799';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      return NextResponse.json({ success: true, token: getAdminToken() });
    }
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
  }
}

