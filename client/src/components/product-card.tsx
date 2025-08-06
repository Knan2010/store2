import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isInStock = product.stock && product.stock > 0;
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(Number(product.price));

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Không có hình ảnh</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge 
            variant={isInStock ? "default" : "destructive"}
            className={isInStock ? "bg-primary text-white" : ""}
          >
            {isInStock ? "Còn hàng" : "Hết hàng"}
          </Badge>
        </div>
      </div>
      
      <CardContent className={`p-4 ${!isInStock ? "opacity-75" : ""}`}>
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold ${isInStock ? "text-primary" : "text-gray-500 line-through"}`}>
            {formattedPrice}đ
          </span>
          <span className="text-sm text-gray-500">/ {product.unit}</span>
        </div>
      </CardContent>
    </Card>
  );
}
