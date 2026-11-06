/**
 * adminAuth.js
 * Server-side admin authentication middleware for API routes.
 * All mutating product/order/seed endpoints call requireAdmin()
 * to verify the X-Admin-Token header before proceeding.
 */

import { NextResponse } from 'next/server';

// This token is set when the admin successfully logs in via the dashboard.
// It is generated server-side and stored in a secure HTTP-only cookie in production.
// For this demo, we use a constant secret passed as a request header.
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'quickmart-admin-secret-2026';

/**
 * Call at the top of any mutating API handler.
 * Returns null if the request is authorised as admin.
 * Returns a NextResponse 403 JSON if not.
 */
export function requireAdmin(request) {
  const token = request.headers.get('x-admin-token');
  if (!token || token !== ADMIN_TOKEN_SECRET) {
    return NextResponse.json(
      { success: false, message: 'Forbidden: Admin access required.' },
      { status: 403 }
    );
  }
  return null; // authorised
}

/**
 * Retrieve the admin token secret (used by the client-side admin dashboard
 * to include in its fetch headers).
 * Only expose this via a server-side API — never hardcode on the client.
 */
export function getAdminToken() {
  return ADMIN_TOKEN_SECRET;
}

