import React from 'react';
import { Category } from '../types';
import { Headphones, Shirt, ShoppingBag, Home, Layers, Utensils, Compass, Beer, Coffee, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  totalProductsCount: number;
}

const getCategoryIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Headphones':
      return Headphones;
    case 'Shirt':
      return Shirt;
    case 'ShoppingBag':
      return ShoppingBag;
    case 'Home':
      return Home;
    case 'Utensils':
      return Utensils;
    case 'Compass':
      return Compass;
    case 'Beer':
      return Beer;
    case 'Coffee':
      return Coffee;
    default:
      return Layers;
  }
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
}) => {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {t('category.shopBy')}
        </h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {t('category.clearFilter')}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            selectedCategory === null
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('category.all')}</span>
          <span
            className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
              selectedCategory === null
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {totalProductsCount}
          </span>
        </button>

        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon_name);
          const isSelected = selectedCategory === cat.id;
          const categoryName = language === 'de' && cat.name_de ? cat.name_de : cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{categoryName}</span>
              {cat.product_count !== undefined && (
                <span
                  className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat.product_count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
