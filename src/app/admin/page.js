'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { useBranch } from '@/context/BranchContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { formatKsh, categories } from '@/data/products';
import {
  FiBox,
  FiTruck,
  FiCheckCircle,
  FiTrendingUp,
  FiAlertTriangle,
  FiPhone,
  FiMapPin,
  FiSmartphone,
  FiPlus,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiDatabase,
  FiLock,
  FiLogOut,
  FiShield,
} from 'react-icons/fi';

const ADMIN_STORAGE_KEY = 'matokes_admin_authenticated';
const ADMIN_USER = 'Reuben@2026';
const ADMIN_PASS = 'Matoke@v799';

export default function AdminDashboardPage() {
  const { orders, updateOrderStatus, createOrder } = useOrder();
  const { selectedBranch } = useBranch();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    try {
      const auth = sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthChecking(false);
    }
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (usernameInput.trim() === ADMIN_USER && passwordInput === ADMIN_PASS) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(ADMIN_STORAGE_KEY, 'true');
      } catch (err) {}
      addToast('Welcome, Administrator Reuben Matoke!', 'success');
      setAuthError('');
    } else {
      setAuthError('Invalid Admin Username or Password. Access denied.');
    }
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {}
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
    addToast('Admin session locked securely.', 'info');
  };

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'mpesa' | 'database'
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [dataSource, setDataSource] = useState('loading');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Fresh Vegetables & Greens',
    price: '',
    unit: '1 kg',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    stockCount: 50,
  });

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProductsList(data.products || []);
        setDataSource(data.source || 'local');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate live branch metrics
  const branchOrders = orders.filter((o) => o.branch?.id === selectedBranch.id || !o.branch);
  const totalRevenueKsh = branchOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = branchOrders.filter((o) => o.status !== 'delivered').length;

  const handleSimulateIncomingOrder = () => {
    const randomProduct = productsList.length > 0 ? productsList[Math.floor(Math.random() * productsList.length)] : null;
    const newOrder = createOrder({
      branch: selectedBranch,
      fulfillmentMode: 'delivery',
      deliveryAddress: {
        fullName: 'Jane Atieno',
        phone: '0733987654',
        street: 'Lenana Road, Hurlingham',
        building: 'Greenhouse Suites Apt 2',
        city: 'Nairobi',
      },
      payment: {
        method: 'mpesa',
        mpesaReceipt: 'QKM' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        status: 'Paid',
        phone: '0733987654',
      },
      items: randomProduct ? [
        {
          id: randomProduct.id,
          name: randomProduct.name,
          price: randomProduct.price,
          quantity: 2,
          unit: randomProduct.unit,
          image: randomProduct.image,
        },
      ] : [],
      subtotal: randomProduct ? randomProduct.price * 2 : 500,
      deliveryFee: 150,
      total: (randomProduct ? randomProduct.price * 2 : 500) + 150,
    });

    addToast(`Incoming delivery order #${newOrder.id} simulated!`, 'success');
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      addToast('Please enter name and price', 'error');
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          stockCount: Number(newProduct.stockCount || 50),
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Product added (${data.source})!`, 'success');
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          category: 'Fresh Vegetables & Greens',
          price: '',
          unit: '1 kg',
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
          stockCount: 50,
        });
        fetchProducts();
      } else {
        addToast(data.message || 'Failed to add product', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleToggleStock = async (prod) => {
    const newStock = !prod.inStock;
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: newStock }),
      });
      if (res.ok) {
        addToast(`${prod.name} marked ${newStock ? 'In Stock' : 'Out of Stock'}`, 'info');
        setProductsList((prev) =>
          prev.map((p) => (p.id === prod.id ? { ...p, inStock: newStock } : p))
        );
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (prod) => {
    if (!confirm(`Are you sure you want to delete ${prod.name}?`)) return;
    try {
      const res = await fetch(`/api/products/${prod.id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast(`${prod.name} removed`, 'info');
        setProductsList((prev) => prev.filter((p) => p.id !== prod.id));
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleSeedDatabase = async () => {
    try {
      addToast('Seeding MongoDB...', 'info');
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast(data.message, 'success');
        fetchProducts();
      } else {
        addToast(data.message, 'error');
      }
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const filteredProducts = productsList.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Security Gate Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-16 h-16 bg-[#E31E24] rounded-2xl mx-auto flex items-center justify-center text-white font-black text-2xl shadow-lg mb-4">
            <FiShield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-950 tracking-tight">
            MATOKE&apos;S SUPERMARKET
          </h2>
          <p className="mt-1 text-xs uppercase tracking-widest text-red-600 font-bold">
            Authorized Personnel &amp; Owner Portal
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
          <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-100 sm:px-10">
            <form onSubmit={handleAdminLogin} className="space-y-5">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <FiAlertTriangle className="flex-shrink-0 w-4 h-4" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter Admin Username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1.5">
                  Admin Security Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#E31E24] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E31E24] hover:bg-[#c9181e] text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FiLock className="w-4 h-4" />
                <span>Verify &amp; Unlock Dashboard</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
              <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 font-medium">
                &larr; Return to Supermarket Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F2F2F2] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">

        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-red-100 text-[#E31E24] rounded-2xl flex items-center justify-center font-black text-2xl flex-shrink-0">
              MS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-gray-950">MATOKE&apos;S SUPERMARKET Portal</h1>
                <span className="text-xs bg-red-100 text-[#E31E24] font-bold px-2.5 py-0.5 rounded-full">
                  LIVE DISPATCH
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  dataSource === 'mongodb' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  DB: {dataSource}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <FiMapPin className="text-[#E31E24]" />
                <span className="font-semibold text-gray-800">{selectedBranch.name}</span>
                <span>• Till: <strong className="text-gray-800">{selectedBranch.tillNumber}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleAdminLogout}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
              title="Lock Dashboard"
            >
              <FiLogOut />
              <span>Lock Admin</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#009639] hover:bg-[#007a2e] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <FiPlus />
              <span>Add New Product</span>
            </button>
            <button
              onClick={handleSimulateIncomingOrder}
              className="bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <FiPlus />
              <span>Simulate Customer Order</span>
            </button>
          </div>
        </div>

        {/* Branch Performance KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Branch Daily Revenue</span>
            <p className="text-2xl font-black text-gray-950 mt-1">{formatKsh(totalRevenueKsh)}</p>
            <span className="text-[10px] font-bold text-[#009639] mt-1 block">+18% vs yesterday</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Queue</span>
            <p className="text-2xl font-black text-[#E31E24] mt-1">{pendingCount} orders</p>
            <span className="text-[10px] text-gray-400 mt-1 block">Packing &amp; in-transit</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Catalog Items</span>
            <p className="text-2xl font-black text-gray-950 mt-1">{productsList.length}</p>
            <span className="text-[10px] text-gray-400 mt-1 block">Synced with POS database</span>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">M-Pesa STK Push</span>
            <p className="text-2xl font-black text-[#009639] mt-1">100% Ok</p>
            <span className="text-[10px] text-[#009639] font-bold mt-1 block">Daraja 2.0 Webhook Active</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white rounded-2xl px-3 p-1.5 shadow-sm gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'orders' ? 'bg-[#E31E24] text-white shadow-sm' : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            Fulfillment Queue ({branchOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'inventory' ? 'bg-[#E31E24] text-white shadow-sm' : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            Product Catalog &amp; Inventory ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab('mpesa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'mpesa' ? 'bg-[#E31E24] text-white shadow-sm' : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            Lipa na M-Pesa Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'database' ? 'bg-[#E31E24] text-white shadow-sm' : 'text-gray-600 hover:text-gray-950'
            }`}
          >
            Database &amp; Cloud Run
          </button>
        </div>

        {/* Tab 1: Orders Queue */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-gray-700">
              Live Picking, Packing &amp; Dispatch Board
            </h3>
            <div className="divide-y divide-gray-100">
              {branchOrders.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">No orders in queue for this branch.</div>
              ) : (
                branchOrders.map((order) => (
                  <div key={order.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{order.id}</span>
                        <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                          {order.fulfillmentMode === 'delivery' ? 'Quickmart Rider Delivery' : 'Click & Collect'}
                        </span>
                        <span className="text-xs text-[#009639] font-bold bg-green-50 px-2 py-0.5 rounded-full">
                          Paid via M-Pesa
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {order.deliveryAddress?.fullName || 'Walk-in Customer'} • {order.deliveryAddress?.phone || '0700000000'} • {order.deliveryAddress?.street || 'Branch pickup'}
                      </p>
                      <div className="flex flex-wrap gap-1 text-[11px] pt-1">
                        {order.items?.map((it, i) => (
                          <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">
                            {it.quantity}x {it.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                      <span className="font-black text-sm text-gray-900 mr-2">{formatKsh(order.total)}</span>
                      {order.status === 'received' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'packing', 'Packing items at Deli & Butchery');
                            addToast(`Order ${order.id} moved to Packing`, 'info');
                          }}
                          className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Start Packing
                        </button>
                      )}
                      {order.status === 'packing' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'out_for_delivery', 'Rider dispatched');
                            addToast(`Order ${order.id} dispatched with rider!`, 'success');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Dispatch Rider
                        </button>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => {
                            updateOrderStatus(order.id, 'delivered', 'Handed over successfully');
                            addToast(`Order ${order.id} marked as Delivered!`, 'success');
                          }}
                          className="bg-[#E31E24] hover:bg-[#c41a1f] text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                        >
                          Mark Delivered
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="text-xs font-bold text-[#E31E24] flex items-center gap-1">
                          <FiCheckCircle className="w-4 h-4" />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Inventory & Catalog Management */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-gray-700">
                Supermarket Shelf Inventory &amp; Price Controls
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search products in catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#E31E24] focus:outline-none w-full sm:w-64"
                />
                <button
                  onClick={fetchProducts}
                  className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600"
                  title="Refresh"
                >
                  <FiRefreshCw className={loadingProducts ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock Units</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-3 flex items-center gap-2">
                        <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <p className="font-bold text-gray-900">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.unit || 'unit'}</p>
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{p.category}</td>
                      <td className="p-3 font-bold text-gray-900">{formatKsh(p.price)}</td>
                      <td className="p-3 font-semibold text-gray-700">{p.stockCount ?? 50}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleStock(p)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.inStock !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Delete Product"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: M-Pesa Log Tab */}
        {activeTab === 'mpesa' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-gray-700">
              Safaricom Daraja Lipa na M-Pesa Audit Trail
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">M-Pesa Ref</th>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Payer Phone</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Branch Till</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {branchOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#009639]">{o.payment?.mpesaReceipt || 'QKM8921LA'}</td>
                      <td className="p-3 font-sans font-semibold">{o.id}</td>
                      <td className="p-3">{o.payment?.phone || o.deliveryAddress?.phone || '0712345678'}</td>
                      <td className="p-3 font-sans font-bold">{formatKsh(o.total)}</td>
                      <td className="p-3 font-sans">{selectedBranch.tillNumber}</td>
                      <td className="p-3 font-sans">
                        <span className="bg-[#009639]/15 text-[#009639] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Confirmed (ETR Synced)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Database & Cloud Run Setup */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                <FiDatabase className="text-[#009639]" />
                MongoDB Integration &amp; Cloud Run Deployment
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Manage your persistent database connection and deploy containerized instances to Google Cloud Run.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
                <h4 className="font-bold text-sm text-gray-900 mb-2">1. Connect MongoDB Atlas</h4>
                <p className="text-xs text-gray-600 mb-4">
                  Add your connection string to <code className="bg-gray-200 px-1 py-0.5 rounded">.env.local</code>:
                </p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-xl text-xs font-mono mb-4 break-all">
                  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quickmart
                </div>
                <button
                  onClick={handleSeedDatabase}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
                >
                  Auto-Seed Products into MongoDB
                </button>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
                <h4 className="font-bold text-sm text-gray-900 mb-2">2. Google Cloud Run Deployment</h4>
                <p className="text-xs text-gray-600 mb-3">
                  A multi-stage production Dockerfile is configured at the project root. Build and deploy with 1 command:
                </p>
                <div className="bg-gray-900 text-gray-100 p-3 rounded-xl text-xs font-mono space-y-1">
                  <p className="text-gray-400"># Deploy directly from source:</p>
                  <p>gcloud run deploy quickmart-supermarket \</p>
                  <p>&nbsp;&nbsp;--source . \</p>
                  <p>&nbsp;&nbsp;--region africa-south1 \</p>
                  <p>&nbsp;&nbsp;--allow-unauthenticated</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <h3 className="font-black text-lg text-gray-900">Add New Product to Supermarket</h3>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farmer's Choice Beef Sausages"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#E31E24] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Aisle / Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#E31E24] focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Price (KSh)</label>
                  <input
                    type="number"
                    required
                    placeholder="250"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#E31E24] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. 500g pack"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#E31E24] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-[#E31E24] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#E31E24] hover:bg-[#c9181e] text-white font-bold text-xs px-5 py-2 rounded-xl transition"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
