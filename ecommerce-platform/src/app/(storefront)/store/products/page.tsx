import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Star, ShoppingCart, SlidersHorizontal, Grid3x3, List } from "lucide-react";

export default function ProductsListingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Categories</h4>
                <div className="space-y-2">
                  <FilterCheckbox label="Electronics" count={234} />
                  <FilterCheckbox label="Accessories" count={156} />
                  <FilterCheckbox label="Clothing" count={89} />
                  <FilterCheckbox label="Home & Garden" count={67} />
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Price Range</h4>
                <div className="space-y-2">
                  <FilterCheckbox label="Under $25" count={45} />
                  <FilterCheckbox label="$25 - $50" count={89} />
                  <FilterCheckbox label="$50 - $100" count={123} />
                  <FilterCheckbox label="Over $100" count={67} />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <FilterCheckbox
                      key={rating}
                      label={
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-1">& up</span>
                        </div>
                      }
                      count={Math.floor(Math.random() * 100)}
                    />
                  ))}
                </div>
              </div>

              <Button className="w-full" variant="outline">Clear Filters</Button>
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">All Products</h1>
              <p className="text-gray-600">Showing 324 products</p>
            </div>
            <div className="flex items-center gap-4">
              <select className="border rounded-lg px-4 py-2 text-sm">
                <option>Sort: Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Top Rated</option>
              </select>
              <div className="hidden md:flex gap-1 border rounded-lg p-1">
                <Button variant="ghost" size="icon">
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productList.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-12">
            <Button variant="outline">Previous</Button>
            <Button variant="outline">1</Button>
            <Button>2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">4</Button>
            <Button variant="outline">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterCheckbox({ label, count }: { label: React.ReactNode; count: number }) {
  return (
    <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
      <div className="flex items-center gap-2">
        <input type="checkbox" className="rounded" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm text-gray-500">({count})</span>
    </label>
  );
}

function ProductCard({
  name,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
}: {
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/store/products/${name.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
          {badge && (
            <Badge className="absolute top-2 left-2 z-10" variant={badge === "Sale" ? "destructive" : "default"}>
              {badge}
            </Badge>
          )}
          <div className="text-6xl">📷</div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2 line-clamp-2">{name}</h3>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({reviews})</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Button className="w-full" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}

const productList = [
  { name: "Wireless Headphones", price: 79.99, originalPrice: 99.99, rating: 4.5, reviews: 128, badge: "Sale" },
  { name: "Smart Watch Pro", price: 299.99, rating: 4.8, reviews: 256, badge: "Popular" },
  { name: "Laptop Stand", price: 49.99, rating: 4.6, reviews: 89 },
  { name: "USB-C Hub", price: 34.99, originalPrice: 44.99, rating: 4.4, reviews: 67, badge: "Sale" },
  { name: "Mechanical Keyboard", price: 129.99, rating: 4.9, reviews: 445 },
  { name: "Wireless Mouse", price: 39.99, rating: 4.7, reviews: 334 },
  { name: "Webcam HD", price: 89.99, rating: 4.5, reviews: 223 },
  { name: "Desk Lamp", price: 45.99, rating: 4.6, reviews: 156 },
  { name: "Monitor Arm", price: 119.99, rating: 4.7, reviews: 189 },
];
