import { Button } from "@/components/ui/button";
import type { Category } from "@shared/schema";

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export default function CategoryNav({ categories, selectedCategory, onCategorySelect }: CategoryNavProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide space-x-8 py-4">
          <Button
            variant="ghost"
            onClick={() => onCategorySelect("all")}
            className={`whitespace-nowrap ${
              selectedCategory === "all" 
                ? "text-primary border-b-2 border-primary" 
                : "text-gray-600 hover:text-primary"
            }`}
          >
            <i className="fas fa-th-large mr-2"></i>
            Tất cả
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => onCategorySelect(category.slug)}
              className={`whitespace-nowrap ${
                selectedCategory === category.slug 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              {category.icon && <i className={`${category.icon} mr-2`}></i>}
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
