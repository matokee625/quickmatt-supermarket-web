'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiShoppingCart,
  FiSearch,
  FiMenu,
  FiX,
  FiMapPin,
  FiPackage,
  FiAward,
  FiChevronDown,
  FiTrendingUp,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useBranch } from '@/context/BranchContext';
import { useOrder } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import SearchBar from '@/components/SearchBar';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'All Products', href: '/products' },
  { name: 'Weekly Deals', href: '/deals' },
  { name: 'Branches', href: '/branches' },
  { name: 'My Orders', href: '/orders' },
  { name: 'About Us', href: '/about' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const pathname = usePathname();

  const { getCartCount, subtotal, formatKsh } = useCart();
  const { selectedBranch, branches, changeBranch, fulfillmentMode, changeFulfillmentMode } = useBranch();
  const { loyaltyPoints } = useOrder();
  const { user } = useAuth();

  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">

      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#E31E24] text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-3">
            <span className="bg-white text-[#E31E24] font-black px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
              Fresh &amp; Easy
            </span>
            <span>
              🚚 Free 45-minute delivery on orders over <strong>KSh 3,000</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {/* Fulfillment toggle */}
            <div className="flex items-center bg-[#c41a1f] rounded-full p-0.5 border border-white/20">
              <button
                onClick={() => changeFulfillmentMode('delivery')}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-all text-[11px] ${
                  fulfillmentMode === 'delivery'
                    ? 'bg-white text-[#E31E24] font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                🚚 Delivery
              </button>
              <button
                onClick={() => changeFulfillmentMode('pickup')}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-all text-[11px] ${
                  fulfillmentMode === 'pickup'
                    ? 'bg-white text-[#E31E24] font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                🏪 Pick Up
              </button>
            </div>
            {/* Loyalty */}
            <Link href="/orders" className="flex items-center gap-1 text-amber-300 font-semibold hover:text-amber-200">
              <FiAward className="w-3.5 h-3.5" />
              <span>{loyaltyPoints} Points</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-[#E31E24] flex items-center justify-center text-white font-black text-lg shadow-md group-hover:bg-[#c41a1f] transition-colors">
              Q
            </div>
            <div className="leading-tight">
              <span className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
                MATOKE&apos;S <span className="text-[#E31E24]">SUPERMARKET</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block -mt-1">
                Fresh &amp; Easy Online Shopping
              </span>
            </div>
          </Link>

          {/* Branch Selector (Desktop) */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#E31E24] bg-[#F2F2F2] hover:bg-red-50 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-[#E31E24]/30 transition-all max-w-[200px]"
            >
              <FiMapPin className="w-3.5 h-3.5 text-[#E31E24] flex-shrink-0" />
              <span className="truncate">{selectedBranch.name}</span>
              <FiChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${branchDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {branchDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-72 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-900">Choose Your Branch</p>
                  <p className="text-[10px] text-gray-500">Orders fulfilled from selected branch</p>
                </div>
                <div className="p-2">
                  {branches.slice(0, 12).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => { changeBranch(b.id); setBranchDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        selectedBranch.id === b.id
                          ? 'bg-red-50 text-[#E31E24] font-bold border border-red-100'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{b.name}</p>
                        <p className="text-[10px] text-gray-400">{b.address}</p>
                      </div>
                      {selectedBranch.id === b.id && (
                        <span className="w-5 h-5 rounded-full bg-[#E31E24] text-white flex items-center justify-center text-[10px]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <SearchBar />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2.5 text-gray-600 hover:text-[#E31E24] bg-[#F2F2F2] rounded-xl transition-colors"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Orders */}
            <Link
              href="/orders"
              className="hidden sm:flex items-center gap-1.5 p-2.5 text-gray-600 hover:text-[#E31E24] bg-[#F2F2F2] hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold"
            >
              <FiPackage className="w-4 h-4" />
              <span className="hidden lg:block">Orders</span>
            </Link>

            {/* Account / Login */}
            <Link
              href="/account"
              className="flex items-center gap-1.5 p-2.5 text-gray-700 hover:text-[#E31E24] bg-[#F2F2F2] hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold"
              title={user ? user.fullName : 'Sign In'}
            >
              <FiUser className="w-4 h-4 text-[#E31E24]" />
              <span className="hidden md:block max-w-[85px] truncate">
                {user ? user.fullName.split(' ')[0] : 'Sign In'}
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-[#E31E24] hover:bg-[#c41a1f] text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <FiShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-gray-900 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
              <span className="text-xs font-bold hidden sm:block">
                {cartCount > 0 ? formatKsh(subtotal) : 'Cart'}
              </span>
            </Link>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2.5 text-gray-700 hover:text-[#E31E24] bg-[#F2F2F2] rounded-xl"
            >
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Secondary Nav */}
        <div className="hidden md:flex items-center justify-between border-t border-gray-100 py-2.5 text-xs font-medium">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 flex items-center gap-1.5 transition-colors ${
                    isActive ? 'text-[#E31E24] font-bold' : 'text-gray-600 hover:text-[#E31E24]'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="bg-red-100 text-[#E31E24] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E31E24] rounded-full" />}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <span className="flex items-center gap-1.5 text-[#E31E24] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#E31E24] animate-pulse" />
              Open Now: {selectedBranch.hours}
            </span>
            <span className="text-gray-300">|</span>
            <span className="font-medium text-gray-500">📞 +254 709 123 000</span>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <SearchBar />
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col md:hidden">
          <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 bg-[#E31E24]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-black">Q</div>
              <span className="text-xl font-black text-white">Quickmart</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white/80 hover:text-white">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-100 bg-[#F2F2F2]">
            <p className="text-xs text-gray-500 mb-0.5">Shopping from:</p>
            <p className="font-bold text-gray-900 text-sm">{selectedBranch.name}</p>
            <p className="text-xs text-gray-400">{selectedBranch.address}</p>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-3 px-4 rounded-xl font-medium text-sm transition-colors ${
                    isActive ? 'bg-red-50 text-[#E31E24] font-bold border border-red-100' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#E31E24]" />}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-4 rounded-xl font-medium text-sm text-gray-700 hover:bg-gray-50"
            >
              <span>Store Admin</span>
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">Manager</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-3 bg-[#F2F2F2]">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Helpline:</span>
              <strong className="text-gray-900">+254 709 123 000</strong>
            </div>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#E31E24] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#c41a1f] transition-colors"
            >
              <FiShoppingCart className="w-4 h-4" />
              View Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
