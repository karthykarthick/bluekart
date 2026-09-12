import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onShopNow: () => void;
  onTrackNow: () => void;
  isSupabaseActive?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, onTrackNow }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 p-8 sm:p-12 lg:p-16 shadow-xl border border-blue-700/50">
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Spring & Summer Collection • Free Express Delivery Over $50</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Engineered for Quality. <br />
          <span className="text-blue-300">Delivered to Your Door.</span>
        </h1>

        <p className="text-base sm:text-lg text-blue-100/90 mb-8 max-w-2xl leading-relaxed font-normal">
          Explore our curated selection of high-grade audio, minimalist everyday apparel, and functional workspace essentials. Seamlessly checkout with Stripe and follow your parcel step-by-step.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={onShopNow}
            className="px-6 py-3.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Shop All Products</span>
            <ArrowRight className="w-4 h-4 text-blue-800" />
          </button>

          <button
            onClick={onTrackNow}
            className="px-6 py-3.5 bg-blue-700/60 hover:bg-blue-700 text-white border border-blue-400/30 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-blue-200" />
            <span>Track Delivery</span>
          </button>
        </div>

        {/* Feature Badges - Purely customer-centric */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-blue-700/40 text-xs text-blue-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-800/80 text-blue-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Stripe Checkout</p>
              <p className="text-[11px] text-blue-200/70">Card & 3D Secure</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-800/80 text-blue-300">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Live Tracking</p>
              <p className="text-[11px] text-blue-200/70">Real-time carrier updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-800/80 text-blue-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Authentic Goods</p>
              <p className="text-[11px] text-blue-200/70">100% verified quality</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-800/80 text-blue-300">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Easy Returns</p>
              <p className="text-[11px] text-blue-200/70">30-day return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
