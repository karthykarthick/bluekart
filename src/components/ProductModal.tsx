import React, { useState } from 'react';
import { Product } from '../types';
import { X, Star, ShoppingBag, Truck, ShieldCheck, ArrowRight, Check, Globe } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantCheckout?: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onInstantCheckout }) => {
  if (!product) return null;

  const { addItem, setIsCartOpen } = useCart();
  const { t, language, formatPrice } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const isOutOfStock = product.inventory_count <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
    onClose();
    if (onInstantCheckout) {
      onInstantCheckout();
    } else {
      setIsCartOpen(true);
    }
  };

  const productTitle = language === 'de' && product.title_de ? product.title_de : product.title;
  const productDesc = language === 'de' && product.description_de ? product.description_de : product.description;
  const categoryName = language === 'de' && product.category_name_de ? product.category_name_de : product.category_name;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10 transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs rounded-full border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700">
            <div className="aspect-square bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-4 flex items-center justify-center relative">
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={productTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.origin_country && (
                <span className="absolute top-3 left-3 bg-amber-600/90 text-white font-bold text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-sm">
                  <span>🇩🇪</span>
                  <span>{product.origin_country}</span>
                </span>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImage === idx
                        ? 'border-blue-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {categoryName || 'Retail'}
                </span>
                <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                {productTitle}
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">({product.reviews_count} {t('product.reviews')})</span>
                <span className="text-xs text-slate-300 dark:text-slate-600">|</span>
                <span
                  className={`text-xs font-semibold ${
                    isOutOfStock
                      ? 'text-red-600 dark:text-red-400'
                      : product.inventory_count <= 10
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isOutOfStock ? t('product.outOfStock') : `${product.inventory_count} ${t('flash.leftInStock')}`}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && (
                  <span className="text-base text-slate-400 dark:text-slate-500 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {productDesc}
              </p>
            </div>

            <div>
              {/* Quantity & Actions */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-800 dark:text-slate-100">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.inventory_count, q + 1))}
                    disabled={quantity >= product.inventory_count || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('product.added')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('product.addToCart')} ({formatPrice(product.price * quantity)})</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white transition-colors flex items-center justify-center gap-2 mb-4 cursor-pointer disabled:opacity-40"
              >
                <span>{language === 'de' ? 'Sofort zur Stripe Kasse' : 'Instant Checkout with Stripe'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{t('slideshow.freeShipping')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t('slideshow.stripeSecurity')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
