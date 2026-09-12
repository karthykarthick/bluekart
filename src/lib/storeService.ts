import { Category, Product, Order, OrderStatus, DeliveryEvent, RevenueAnalytics } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/seedData';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'bluecart_products_v2',
  CATEGORIES: 'bluecart_categories_v2',
  ORDERS: 'bluecart_orders_v2',
};

// Initialize local cache if missing or merge newly added categories/products
function initLocalData() {
  if (typeof window === 'undefined') return;

  const existingCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!existingCats) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  } else {
    try {
      const parsed: Category[] = JSON.parse(existingCats);
      const existingIds = new Set(parsed.map((c) => c.id));
      const missing = INITIAL_CATEGORIES.filter((c) => !existingIds.has(c.id));
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([...parsed, ...missing]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
  }

  const existingProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!existingProds) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  } else {
    try {
      const parsed: Product[] = JSON.parse(existingProds);
      const existingIds = new Set(parsed.map((p) => p.id));
      const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
      if (missing.length > 0) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([...parsed, ...missing]));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    const v1Orders = localStorage.getItem('bluecart_orders_v1');
    localStorage.setItem(STORAGE_KEYS.ORDERS, v1Orders || JSON.stringify(INITIAL_ORDERS));
  }
}

initLocalData();

export const storeService = {
  // ---------------- CATEGORIES ----------------
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
          return data as Category[];
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local storage:', err);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return local ? JSON.parse(local) : INITIAL_CATEGORIES;
  },

  async addCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}`,
      created_at: new Date().toISOString(),
      is_active: true,
      product_count: 0,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('categories').insert([newCategory]).select();
        if (!error && data && data[0]) {
          newCategory.id = data[0].id;
        }
      } catch (err) {
        console.warn('Supabase insert failed:', err);
      }
    }

    const categories = await this.getCategories();
    const updated = [...categories, newCategory];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const categories = await this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Category not found');

    const updatedCat = { ...categories[index], ...updates };
    categories[index] = updatedCat;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase update failed:', err);
      }
    }
    return updatedCat;
  },

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const updated = categories.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }
  },

  // ---------------- PRODUCTS ----------------
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
          return data as Product[];
        }
      } catch (err) {
        console.warn('Supabase products fetch failed, using fallback:', err);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return local ? JSON.parse(local) : INITIAL_PRODUCTS;
  },

  async addProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('products').insert([newProduct]).select();
        if (!error && data && data[0]) {
          newProduct.id = data[0].id;
        }
      } catch (err) {
        console.warn('Supabase product insert failed:', err);
      }
    }

    const products = await this.getProducts();
    const updated = [newProduct, ...products];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const products = await this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Product not found');

    const updatedProduct = { ...products[index], ...updates };
    products[index] = updatedProduct;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase product update failed:', err);
      }
    }
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await this.getProducts();
    const updated = products.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase product delete failed:', err);
      }
    }
  },

  // ---------------- ORDERS & DELIVERY TRACKING ----------------
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data));
          return data as Order[];
        }
      } catch (err) {
        console.warn('Supabase orders fetch failed:', err);
      }
    }
    const local = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return local ? JSON.parse(local) : INITIAL_ORDERS;
  },

  async getOrdersByUser(userId: string): Promise<Order[]> {
    const all = await this.getOrders();
    return all.filter((o) => o.user_id === userId);
  },

  async getOrderByTrackingOrNumber(query: string): Promise<Order | null> {
    const clean = query.trim().toUpperCase();
    const all = await this.getOrders();
    return (
      all.find(
        (o) =>
          o.order_number.toUpperCase() === clean ||
          (o.tracking_number && o.tracking_number.toUpperCase() === clean) ||
          o.id.toUpperCase() === clean
      ) || null
    );
  },

  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('orders').insert([newOrder]).select();
        if (!error && data && data[0]) {
          newOrder.id = data[0].id;
        }
      } catch (err) {
        console.warn('Supabase order insert failed:', err);
      }
    }

    // Decrement product inventory count
    const products = await this.getProducts();
    for (const item of newOrder.items) {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        prod.inventory_count = Math.max(0, prod.inventory_count - item.quantity);
      }
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    const orders = await this.getOrders();
    const updated = [newOrder, ...orders];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    location?: string
  ): Promise<Order> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    const now = new Date().toISOString();

    const newEvent: DeliveryEvent = {
      id: `del_${Date.now()}`,
      timestamp: now,
      status,
      location: location || 'Regional Logistics Hub',
      description:
        note ||
        `Status updated to ${status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}`,
    };

    const updatedOrder: Order = {
      ...order,
      order_status: status,
      updated_at: now,
      delivery_history: [...order.delivery_history, newEvent],
    };

    orders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            order_status: status,
            updated_at: now,
            delivery_history: updatedOrder.delivery_history,
          })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Supabase update status failed:', err);
      }
    }

    return updatedOrder;
  },

  async updateTrackingDetails(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery?: string
  ): Promise<Order> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');

    const order = orders[index];
    const now = new Date().toISOString();

    const newEvent: DeliveryEvent = {
      id: `del_${Date.now()}`,
      timestamp: now,
      status: order.order_status === 'placed' ? 'processing' : order.order_status,
      location: `${carrier} Dispatch Center`,
      description: `Carrier tracking number assigned: ${trackingNumber} (${carrier})`,
    };

    const updatedOrder: Order = {
      ...order,
      tracking_number: trackingNumber,
      carrier,
      estimated_delivery: estimatedDelivery || order.estimated_delivery,
      updated_at: now,
      delivery_history: [...order.delivery_history, newEvent],
    };

    orders[index] = updatedOrder;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('orders')
          .update({
            tracking_number: trackingNumber,
            carrier,
            estimated_delivery: updatedOrder.estimated_delivery,
            updated_at: now,
            delivery_history: updatedOrder.delivery_history,
          })
          .eq('id', orderId);
      } catch (err) {
        console.warn('Supabase update tracking failed:', err);
      }
    }

    return updatedOrder;
  },

  // ---------------- REVENUE & ANALYTICS ----------------
  async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    const orders = await this.getOrders();
    const paidOrders = orders.filter((o) => o.payment_status === 'paid');

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    const completedDeliveries = orders.filter((o) => o.order_status === 'delivered').length;
    const activeShipments = orders.filter((o) =>
      ['shipped', 'in_transit', 'out_for_delivery'].includes(o.order_status)
    ).length;

    // Daily revenue calculation for past 7 days
    const daysMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = { revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const dateKey = o.created_at.split('T')[0];
      if (daysMap[dateKey]) {
        daysMap[dateKey].orders += 1;
        if (o.payment_status === 'paid') {
          daysMap[dateKey].revenue += o.total;
        }
      }
    });

    const dailySales = Object.entries(daysMap).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(data.revenue * 100) / 100,
      orders: data.orders,
    }));

    // Status distribution
    const statusCounts: Record<OrderStatus, number> = {
      placed: 0,
      processing: 0,
      shipped: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((o) => {
      if (statusCounts[o.order_status] !== undefined) {
        statusCounts[o.order_status]++;
      }
    });

    const statusDistribution = (Object.keys(statusCounts) as OrderStatus[]).map((status) => ({
      status,
      count: statusCounts[status],
      percentage: totalOrders > 0 ? Math.round((statusCounts[status] / totalOrders) * 100) : 0,
    }));

    // Category revenue breakdown
    const categoryRevMap: Record<string, { revenue: number; count: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const cat = 'Retail Goods';
        if (!categoryRevMap[cat]) categoryRevMap[cat] = { revenue: 0, count: 0 };
        categoryRevMap[cat].revenue += item.price * item.quantity;
        categoryRevMap[cat].count += item.quantity;
      });
    });

    const categoryRevenue = Object.entries(categoryRevMap).map(([category, val]) => ({
      category,
      revenue: Math.round(val.revenue * 100) / 100,
      count: val.count,
    }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      completedDeliveries,
      activeShipments,
      dailySales,
      categoryRevenue,
      statusDistribution,
    };
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  },
};
