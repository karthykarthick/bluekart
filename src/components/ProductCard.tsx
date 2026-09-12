import React, { useState } from 'react';
import { Product } from '../types';
import { Star, ShoppingBag, Check, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addItem } = useCart();
  const { t, language, formatPrice } = useLanguage();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inventory_count <= 0) return;
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  const discountPercent = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : (product.flash_deal_discount || 0);

  const isLowStock = product.inventory_count > 0 && product.inventory_count <= 10;
  const isOutOfStock = product.inventory_count <= 0;

  const productTitle = language === 'de' && product.title_de ? product.title_de : product.title;
  const categoryName = language === 'de' && product.category_name_de ? product.category_name_de : product.category_name;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 flex flex-col cursor-pointer relative"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'}
          alt={productTitle}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Origin / Special badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.origin_country && (
            <span className="bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <span>🇩🇪</span>
              <span>{product.origin_country}</span>
            </span>
          )}
          {product.featured_badge && (
            <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider shadow-sm">
              {product.featured_badge}
            </span>
          )}
        </div>

        {discountPercent > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Quick View Hover Pill */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-slate-900/85 backdrop-blur-xs text-white text-xs font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5" />
            <span>{t('product.quickView')}</span>
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {categoryName || 'Department'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[11px]">({product.reviews_count})</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
            {productTitle}
          </h3>
        </div>

        {/* Pricing & Stock & Add Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 mt-2">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            {/* Stock status indicator */}
            <span
              className={`text-[11px] font-medium ${
                isOutOfStock
                  ? 'text-red-600 dark:text-red-400'
                  : isLowStock
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isOutOfStock
                ? t('product.outOfStock')
                : isLowStock
                ? `${t('product.onlyLeft')} ${product.inventory_count}`
                : t('product.inStock')}
            </span>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('product.added')}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isOutOfStock ? t('product.outOfStock') : t('product.addToCart')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
