import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { storeService } from '../lib/storeService';
import { useAuth } from '../context/AuthContext';
import { X, Package, Truck, ArrowRight, ExternalLink, Calendar } from 'lucide-react';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder,
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadOrders();
    }
  }, [isOpen, user]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const all = await storeService.getOrders();
      // Filter for this user or show sample orders
      const userOrders = all.filter(
        (o) => o.user_id === user?.id || o.customer_email.toLowerCase() === user?.email.toLowerCase()
      );
      setOrders(userOrders.length > 0 ? userOrders : all.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden z-10 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Orders & Shipments</h2>
              <p className="text-xs text-slate-500">Live parcel tracking and delivery timeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No orders found yet</p>
            <p className="text-xs text-slate-400 mt-1">
              When you purchase items via Stripe checkout, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {order.order_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(
                          order.order_status
                        )}`}
                      >
                        {order.order_status.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Total</span>
                      <span className="text-sm font-extrabold text-blue-600">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onTrackOrder(order);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </button>
                  </div>
                </div>

                {/* Tracking & Carrier Info */}
                <div className="py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Carrier:</span>
                    <span className="font-semibold text-slate-800">{order.carrier || 'BlueLogistics'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-700 font-semibold">{order.tracking_number}</span>
                  </div>

                  <div className="text-slate-500 text-[11px]">
                    Est. Delivery: <strong>{order.estimated_delivery}</strong>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 overflow-x-auto">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shrink-0 text-xs"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded object-cover"
                      />
                      <span className="truncate max-w-[120px] text-slate-700 font-medium">
                        {item.title}
                      </span>
                      <span className="text-slate-400 font-mono">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
