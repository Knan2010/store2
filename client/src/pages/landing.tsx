import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Star, Clock, Users, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product, Category } from "@shared/schema";
import ProductCard from "@/components/product-card";
import CategoryNav from "@/components/category-nav";

export default function Landing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedCategory === "all" ? undefined : selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        const category = categories.find(c => c.slug === selectedCategory);
        if (category) {
          params.set('categoryId', category.id);
        }
      }
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      const response = await fetch(`/api/products?${params}`);
      return response.json();
    },
  });

  const { data: stats } = useQuery<{
    total: number;
    inStock: number;
    outOfStock: number;
  }>({
    queryKey: ['/api/products/stats'],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-primary">Tạp Hóa Online</h1>
            </div>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Admin Login Button */}
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.href = '/admin'}
                className="bg-primary hover:bg-primary/90"
              >
                <Users className="w-4 h-4 mr-2" />
                Quản trị
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <CategoryNav 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-gray-600">Sản phẩm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.inStock}</div>
                <div className="text-sm text-gray-600">Còn hàng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">{stats.outOfStock}</div>
                <div className="text-sm text-gray-600">Hết hàng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{categories.length}</div>
                <div className="text-sm text-gray-600">Danh mục</div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-2">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-primary">Tạp Hóa Online</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Hệ thống niêm yết giá sản phẩm tạp hóa trực tuyến, cập nhật liên tục giá cả và tình trạng hàng hóa.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Danh mục sản phẩm</h4>
              <ul className="space-y-2">
                {categories.slice(0, 6).map((category) => (
                  <li key={category.id}>
                    <button 
                      onClick={() => setSelectedCategory(category.slug)}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Thông tin liên hệ</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  6:00 - 22:00 hàng ngày
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Tạp Hóa Online. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
