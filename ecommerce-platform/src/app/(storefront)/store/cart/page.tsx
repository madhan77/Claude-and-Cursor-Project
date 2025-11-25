import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <CartItem
            name="Wireless Headphones"
            price={79.99}
            quantity={1}
            image="/placeholder.jpg"
          />
          <CartItem
            name="Smart Watch Pro"
            price={299.99}
            quantity={1}
            image="/placeholder.jpg"
          />
          <CartItem
            name="USB-C Hub"
            price={34.99}
            quantity={2}
            image="/placeholder.jpg"
          />

          <div className="pt-4">
            <Link href="/store/products">
              <Button variant="outline" className="w-full md:w-auto">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">$449.96</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (estimated)</span>
                  <span className="font-medium">$36.00</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold">$485.96</span>
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">Discount Code</label>
                <div className="flex gap-2">
                  <Input placeholder="Enter code" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>

              {/* Checkout Button */}
              <Button className="w-full" size="lg">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Trust Badges */}
              <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">✓</Badge>
                  <span>Ships within 24-48 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Empty Cart State (commented out for demo) */}
      {/* <EmptyCart /> */}
    </div>
  );
}

function CartItem({
  name,
  price,
  quantity,
  image,
}: {
  name: string;
  price: number;
  quantity: number;
  image: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="text-3xl">📷</div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <div>
                <h3 className="font-semibold">{name}</h3>
                <p className="text-sm text-gray-600">SKU: WH-001</p>
              </div>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="font-bold text-lg">${(price * quantity).toFixed(2)}</div>
                <div className="text-sm text-gray-600">${price.toFixed(2)} each</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyCart() {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <ShoppingBag className="h-24 w-24 mx-auto text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-600 mb-6">Add some products to get started!</p>
      <Link href="/store/products">
        <Button size="lg">
          Start Shopping
        </Button>
      </Link>
    </div>
  );
}
