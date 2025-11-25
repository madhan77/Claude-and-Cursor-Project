import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Star, ShoppingCart, TrendingUp } from "lucide-react";

export default function StorefrontHome() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Shop the latest trends with free shipping on orders over $50
            </p>
            <div className="flex gap-4">
              <Link href="/store/products">
                <Button size="lg">
                  Shop Now
                </Button>
              </Link>
              <Link href="/store/deals">
                <Button variant="outline" size="lg">
                  View Deals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CategoryCard
            name="Electronics"
            image="/placeholder-electronics.jpg"
            count={234}
          />
          <CategoryCard
            name="Accessories"
            image="/placeholder-accessories.jpg"
            count={156}
          />
          <CategoryCard
            name="Clothing"
            image="/placeholder-clothing.jpg"
            count={89}
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link href="/store/products">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductCard
              name="Wireless Headphones"
              price={79.99}
              originalPrice={99.99}
              rating={4.5}
              reviews={128}
              image="/placeholder-product.jpg"
              badge="Sale"
            />
            <ProductCard
              name="Smart Watch Pro"
              price={299.99}
              rating={4.8}
              reviews={256}
              image="/placeholder-product.jpg"
              badge="Popular"
            />
            <ProductCard
              name="Laptop Stand"
              price={49.99}
              rating={4.6}
              reviews={89}
              image="/placeholder-product.jpg"
            />
            <ProductCard
              name="USB-C Hub"
              price={34.99}
              originalPrice={44.99}
              rating={4.4}
              reviews={67}
              image="/placeholder-product.jpg"
              badge="Sale"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Best Sellers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            name="Mechanical Keyboard"
            price={129.99}
            rating={4.9}
            reviews={445}
            image="/placeholder-product.jpg"
            badge="Best Seller"
          />
          <ProductCard
            name="Wireless Mouse"
            price={39.99}
            rating={4.7}
            reviews={334}
            image="/placeholder-product.jpg"
          />
          <ProductCard
            name="Webcam HD"
            price={89.99}
            rating={4.5}
            reviews={223}
            image="/placeholder-product.jpg"
          />
          <ProductCard
            name="Desk Lamp"
            price={45.99}
            rating={4.6}
            reviews={156}
            image="/placeholder-product.jpg"
          />
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <FeatureCard
              icon="🚚"
              title="Free Shipping"
              description="On orders over $50"
            />
            <FeatureCard
              icon="🔒"
              title="Secure Payment"
              description="100% secure transactions"
            />
            <FeatureCard
              icon="↩️"
              title="Easy Returns"
              description="30-day return policy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ name, image, count }: { name: string; image: string; count: number }) {
  return (
    <Link href={`/store/categories/${name.toLowerCase()}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-6xl">📦</div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-1">{name}</h3>
          <p className="text-gray-600">{count} products</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProductCard({
  name,
  price,
  originalPrice,
  rating,
  reviews,
  image,
  badge,
}: {
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
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

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
