import React, { useState, useEffect } from 'react';
import {
  Category,
  Product,
  Order,
  OrderStatus,
  RevenueAnalytics,
} from '../types';
import { storeService } from '../lib/storeService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  Database,
  ExternalLink,
  X,
  HelpCircle,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onClose: () => void;
  onRefreshData?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, onRefreshData }) => {
  const { isAdmin } = useAuth();

  // Strict role guard: Never render admin details if the current user is not an administrator
  if (!isAdmin) {
    return null;
  }

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'deliveries' | 'setup'
  >('overview');

  // State
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modals inside Admin
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [managingDeliveryOrder, setManagingDeliveryOrder] = useState<Order | null>(null);

  // New product form
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    compare_at_price: '',
    category_id: '',
    inventory_count: '25',
    sku: '',
    images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    featured_badge: '' as any,
  });

  // New category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    icon_name: 'Layers',
  });

  // Delivery update form
  const [deliveryStatusUpdate, setDeliveryStatusUpdate] = useState<OrderStatus>('processing');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats, ords, an] = await Promise.all([
        storeService.getProducts(),
        storeService.getCategories(),
        storeService.getOrders(),
        storeService.getRevenueAnalytics(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setAnalytics(an);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Product actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === productForm.category_id);
    const productPayload = {
      title: productForm.title,
      slug: productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: productForm.description,
      price: parseFloat(productForm.price) || 0,
      compare_at_price: productForm.compare_at_price ? parseFloat(productForm.compare_at_price) : undefined,
      category_id: productForm.category_id || categories[0]?.id || 'cat_electronics',
      category_name: cat?.name || 'General',
      inventory_count: parseInt(productForm.inventory_count, 10) || 0,
      sku: productForm.sku || `BC-SKU-${Math.floor(100 + Math.random() * 900)}`,
      images: [productForm.images.trim()],
      featured_badge: productForm.featured_badge || null,
      rating: 5.0,
      reviews_count: 1,
      is_active: true,
    };

    if (editingProduct) {
      await storeService.updateProduct(editingProduct.id, productPayload);
    } else {
      await storeService.addProduct(productPayload);
    }

    setIsAddProductOpen(false);
    setEditingProduct(null);
    resetProductForm();
    await loadAllData();
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to remove this product from inventory?')) {
      await storeService.deleteProduct(id);
      await loadAllData();
      if (onRefreshData) onRefreshData();
    }
  };

  const resetProductForm = () => {
    setProductForm({
      title: '',
      description: '',
      price: '',
      compare_at_price: '',
      category_id: categories[0]?.id || '',
      inventory_count: '25',
      sku: '',
      images: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      featured_badge: '' as any,
    });
  };

  // Category actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: categoryForm.description,
      image_url: categoryForm.image_url,
      icon_name: categoryForm.icon_name,
      is_active: true,
    };

    if (editingCategory) {
      await storeService.updateCategory(editingCategory.id, payload);
    } else {
      await storeService.addCategory(payload);
    }

    setIsAddCategoryOpen(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', description: '', image_url: '', icon_name: 'Layers' });
    await loadAllData();
    if (onRefreshData) onRefreshData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category? Products in this category will become unassigned.')) {
      await storeService.deleteCategory(id);
      await loadAllData();
      if (onRefreshData) onRefreshData();
    }
  };

  // Delivery & Order Tracking actions
  const handleOpenManageDelivery = (order: Order) => {
    setManagingDeliveryOrder(order);
    setDeliveryStatusUpdate(order.order_status);
    setTrackingNumberInput(order.tracking_number || '');
    setCarrierInput(order.carrier || 'BlueLogistics Express');
    setDeliveryLocation('Seattle Regional Sorting Hub');
    setDeliveryNote('');
  };

  const handleApplyDeliveryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingDeliveryOrder) return;

    try {
      // Update tracking number if changed
      if (
        trackingNumberInput !== managingDeliveryOrder.tracking_number ||
        carrierInput !== managingDeliveryOrder.carrier
      ) {
        await storeService.updateTrackingDetails(
          managingDeliveryOrder.id,
          trackingNumberInput,
          carrierInput
        );
      }

      // Update status & append event
      const updated = await storeService.updateOrderStatus(
        managingDeliveryOrder.id,
        deliveryStatusUpdate,
        deliveryNote || `Milestone reached: ${deliveryStatusUpdate.replace('_', ' ')}`,
        deliveryLocation || 'Fulfillment Terminal'
      );

      setManagingDeliveryOrder(updated);
      await loadAllData();
      if (onRefreshData) onRefreshData();
      setManagingDeliveryOrder(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat =
      selectedProductCategory === 'all' || p.category_id === selectedProductCategory;
    return matchesSearch && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.order_status === orderStatusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Admin Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  BlueCart Admin Central
                </h1>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-md border border-blue-400/30">
                  {isSupabaseConfigured ? 'Supabase Live' : 'Local + Sync'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage products, categories, track shipments, and inspect revenue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100/80 px-6 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Revenue & Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deliveries')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'deliveries'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Delivery Tracking ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'setup'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Vercel & Supabase Guide</span>
          </button>
        </div>

        {/* Dashboard Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* TAB 1: REVENUE & OVERVIEW */}
              {activeTab === 'overview' && analytics && (
                <div className="space-y-6">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Total Revenue
                        </span>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        ${analytics.totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        +14.2% from prior cycle
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Total Orders
                        </span>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <ShoppingCart className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {analytics.totalOrders}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Avg: ${analytics.avgOrderValue.toFixed(2)} / order
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Active Shipments
                        </span>
                        <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                          <Truck className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {analytics.activeShipments}
                      </p>
                      <p className="text-[11px] text-blue-600 font-semibold mt-1">
                        In transit with carrier
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Delivered Packages
                        </span>
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {analytics.completedDeliveries}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                        100% on-time rate
                      </p>
                    </div>
                  </div>

                  {/* Daily Sales Chart & Status Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Visual Daily Revenue Bars */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">
                            Daily Revenue Trend (USD)
                          </h3>
                          <p className="text-xs text-slate-400">Recent 7-day performance</p>
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          Live Stripe Metrics
                        </span>
                      </div>

                      <div className="h-52 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
                        {analytics.dailySales.map((day, i) => {
                          const maxRev = Math.max(...analytics.dailySales.map((d) => d.revenue), 100);
                          const heightPct = Math.max(12, Math.round((day.revenue / maxRev) * 100));

                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center gap-2 group relative"
                            >
                              {/* Hover Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-md">
                                ${day.revenue.toFixed(2)} ({day.orders} orders)
                              </div>

                              <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg h-44 flex items-end justify-center overflow-hidden">
                                <div
                                  className="w-full bg-blue-600 hover:bg-blue-700 transition-all rounded-t-lg"
                                  style={{ height: `${heightPct}%` }}
                                />
                              </div>

                              <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                                {day.date}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-1">
                          Delivery Status Distribution
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">Pipeline fulfillment stages</p>

                        <div className="space-y-3">
                          {analytics.statusDistribution.map((item) => (
                            <div key={item.status} className="text-xs">
                              <div className="flex justify-between font-semibold mb-1">
                                <span className="capitalize text-slate-700">
                                  {item.status.replace('_', ' ')}
                                </span>
                                <span className="text-slate-900">{item.count} orders</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full transition-all"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 mt-4">
                        <button
                          onClick={() => setActiveTab('deliveries')}
                          className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span>Inspect Live Shipments</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search product or SKU..."
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
                        />
                      </div>

                      <select
                        value={selectedProductCategory}
                        onChange={(e) => setSelectedProductCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 outline-none"
                      >
                        <option value="all">All Departments</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        resetProductForm();
                        setEditingProduct(null);
                        setIsAddProductOpen(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Product</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock Level</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={prod.images[0]}
                                    alt={prod.title}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                                  />
                                  <div>
                                    <p className="font-bold text-slate-900 leading-tight">
                                      {prod.title}
                                    </p>
                                    {prod.featured_badge && (
                                      <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                                        {prod.featured_badge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 font-medium">
                                {prod.category_name}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-500">{prod.sku}</td>
                              <td className="px-4 py-3 font-bold text-slate-900">
                                ${prod.price.toFixed(2)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    prod.inventory_count <= 0
                                      ? 'bg-red-100 text-red-800'
                                      : prod.inventory_count <= 10
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {prod.inventory_count} in stock
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(prod);
                                      setProductForm({
                                        title: prod.title,
                                        description: prod.description,
                                        price: prod.price.toString(),
                                        compare_at_price: prod.compare_at_price?.toString() || '',
                                        category_id: prod.category_id,
                                        inventory_count: prod.inventory_count.toString(),
                                        sku: prod.sku,
                                        images: prod.images[0] || '',
                                        featured_badge: prod.featured_badge || ('' as any),
                                      });
                                      setIsAddProductOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORIES MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Product Categories</h3>
                      <p className="text-xs text-slate-500">
                        Organize your store catalog into shopper departments
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setCategoryForm({
                          name: '',
                          slug: '',
                          description: '',
                          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
                          icon_name: 'Layers',
                        });
                        setIsAddCategoryOpen(true);
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => {
                      const count = products.filter((p) => p.category_id === cat.id).length;
                      return (
                        <div
                          key={cat.id}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between"
                        >
                          <div className="h-32 bg-slate-100 relative overflow-hidden">
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent flex items-end p-4">
                              <div>
                                <h4 className="text-base font-bold text-white leading-tight">
                                  {cat.name}
                                </h4>
                                <span className="text-[11px] text-blue-200 font-mono">
                                  slug: {cat.slug}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                              {cat.description}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                                {count} Products Active
                              </span>

                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setCategoryForm({
                                      name: cat.name,
                                      slug: cat.slug,
                                      description: cat.description,
                                      image_url: cat.image_url,
                                      icon_name: cat.icon_name || 'Layers',
                                    });
                                    setIsAddCategoryOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                                  title="Edit Category"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: DELIVERIES & SHIPMENT TRACKING */}
              {activeTab === 'deliveries' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Orders & Delivery Tracking
                      </h3>
                      <p className="text-xs text-slate-500">
                        Dispatch orders, update tracking numbers, and log carrier waypoints
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Filter status:</span>
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl text-xs px-3 py-2 outline-none font-semibold"
                      >
                        <option value="all">All Statuses ({orders.length})</option>
                        <option value="placed">Placed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="in_transit">In Transit</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Order & Customer</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Total Paid</th>
                            <th className="px-4 py-3">Carrier & Tracking</th>
                            <th className="px-4 py-3">Delivery Status</th>
                            <th className="px-4 py-3 text-right">Update Delivery</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-mono font-bold text-slate-900">
                                  {ord.order_number}
                                </p>
                                <p className="text-slate-600 font-medium">{ord.customer_name}</p>
                                <p className="text-[11px] text-slate-400">{ord.customer_email}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-semibold text-slate-800">
                                  {ord.items.length} item(s)
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-extrabold text-blue-600 text-sm">
                                  ${ord.total.toFixed(2)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-bold text-slate-800">
                                  {ord.carrier || 'BlueLogistics'}
                                </p>
                                <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {ord.tracking_number || 'Unassigned'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                                    ord.order_status === 'delivered'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : ord.order_status === 'in_transit' ||
                                        ord.order_status === 'out_for_delivery'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {ord.order_status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleOpenManageDelivery(ord)}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Manage Tracking</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: VERCEL & SUPABASE GUIDE */}
              {activeTab === 'setup' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase mb-2">
                        <Database className="w-3.5 h-3.5" />
                        <span>Production Deployment Guide</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        How to Run Locally, Connect Supabase, and Deploy to Vercel
                      </h2>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        BlueCart is designed with hybrid persistence: it works instantly right now
                        with full interactive features (catalog, carts, Stripe payments, tracking,
                        and analytics), and is 100% pre-configured for Supabase and Vercel.
                      </p>
                    </div>

                    {/* Step 1: Run locally */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                          1
                        </span>
                        Running Locally on Your Computer
                      </h3>
                      <p className="text-xs text-slate-600 mb-3">
                        Clone or export the project to your computer and run:
                      </p>
                      <pre className="p-3 bg-slate-900 text-blue-200 text-xs rounded-xl font-mono overflow-x-auto">
                        npm install{'\n'}npm run dev
                      </pre>
                      <p className="text-xs text-slate-500 mt-2">
                        The Express server and Vite development bundler will launch at{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                          http://localhost:3000
                        </code>
                      </p>
                    </div>

                    {/* Step 2: Supabase database setup */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                          2
                        </span>
                        Configuring Supabase Backend
                      </h3>
                      <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 mb-3">
                        <li>
                          Create a free database at{' '}
                          <a
                            href="https://supabase.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline font-semibold"
                          >
                            supabase.com
                          </a>
                        </li>
                        <li>
                          Open <strong>SQL Editor</strong> in your Supabase project dashboard.
                        </li>
                        <li>
                          Copy and paste the contents of{' '}
                          <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">
                            supabase-schema.sql
                          </code>{' '}
                          (located in this project root) and click <strong>Run</strong>.
                        </li>
                        <li>
                          Add your project URL and anon key to <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono">.env</code>:
                        </li>
                      </ol>
                      <pre className="p-3 bg-slate-900 text-emerald-300 text-xs rounded-xl font-mono overflow-x-auto">
                        VITE_SUPABASE_URL="https://your-project-ref.supabase.co"{'\n'}
                        VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      </pre>
                    </div>

                    {/* Step 3: Vercel deployment */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                          3
                        </span>
                        Deploying to Vercel (1-Click Ready)
                      </h3>
                      <p className="text-xs text-slate-600 mb-3">
                        A ready-to-deploy <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">vercel.json</code> is included.
                      </p>
                      <pre className="p-3 bg-slate-900 text-blue-200 text-xs rounded-xl font-mono overflow-x-auto">
                        # Install Vercel CLI (or push to GitHub and import via vercel.com){'\n'}
                        npm i -g vercel{'\n'}
                        vercel deploy --prod
                      </pre>
                      <p className="text-xs text-slate-500 mt-2">
                        Under Vercel project Settings &gt; Environment Variables, add{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">
                          STRIPE_SECRET_KEY
                        </code>
                        ,{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">
                          VITE_SUPABASE_URL
                        </code>
                        , and{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">
                          VITE_SUPABASE_ANON_KEY
                        </code>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL: ADD / EDIT PRODUCT */}
        {isAddProductOpen && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="fixed inset-0"
              onClick={() => setIsAddProductOpen(false)}
            />
            <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Retail Product'}
                </h3>
                <button
                  onClick={() => setIsAddProductOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Cobalt Horizon Smart Watch"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Department</label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      placeholder="BC-AU-105"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="149.99"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Compare Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.compare_at_price}
                      onChange={(e) =>
                        setProductForm({ ...productForm, compare_at_price: e.target.value })
                      }
                      placeholder="189.99"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Stock Count</label>
                    <input
                      type="number"
                      required
                      value={productForm.inventory_count}
                      onChange={(e) =>
                        setProductForm({ ...productForm, inventory_count: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Featured Badge</label>
                  <select
                    value={productForm.featured_badge}
                    onChange={(e) => setProductForm({ ...productForm, featured_badge: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="">None (Standard)</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="New">New Arrival</option>
                    <option value="Sale">On Sale</option>
                    <option value="Featured">Featured</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="High-grade materials, ergonomic specs..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT CATEGORY */}
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="fixed inset-0"
              onClick={() => setIsAddCategoryOpen(false)}
            />
            <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Add New Department Category'}
                </h3>
                <button
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g. Footwear & Boots"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Slug</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="footwear-boots"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    required
                    value={categoryForm.image_url}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, image_url: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={categoryForm.description}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, description: e.target.value })
                    }
                    placeholder="Collection summary for shoppers..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCategoryOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE DELIVERY TIMELINE & TRACKING */}
        {managingDeliveryOrder && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="fixed inset-0"
              onClick={() => setManagingDeliveryOrder(null)}
            />
            <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Update Delivery Milestone</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Order: {managingDeliveryOrder.order_number}
                  </p>
                </div>
                <button
                  onClick={() => setManagingDeliveryOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleApplyDeliveryUpdate} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Order Delivery Status
                  </label>
                  <select
                    value={deliveryStatusUpdate}
                    onChange={(e) => setDeliveryStatusUpdate(e.target.value as OrderStatus)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-900 outline-none"
                  >
                    <option value="placed">Placed</option>
                    <option value="processing">Processing (Packing & Picking)</option>
                    <option value="shipped">Shipped (Departed Facility)</option>
                    <option value="in_transit">In Transit (Cross-dock en route)</option>
                    <option value="out_for_delivery">Out for Delivery (On Courier Van)</option>
                    <option value="delivered">Delivered (Handed to Customer)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Carrier Name
                    </label>
                    <input
                      type="text"
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Tracking Code
                    </label>
                    <input
                      type="text"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Checkpoint Location
                  </label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="e.g. Seattle Regional Logistics Depot, WA"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Milestone Log Description
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. Package scanned and loaded onto outbound transport truck"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setManagingDeliveryOrder(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                  >
                    Publish Milestone Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
