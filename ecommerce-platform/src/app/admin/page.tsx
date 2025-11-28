import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="$45,231"
          change="+20.1%"
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Orders"
          value="356"
          change="+12.5%"
          trend="up"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          title="Customers"
          value="2,345"
          change="+8.2%"
          trend="up"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Conversion Rate"
          value="3.24%"
          change="-2.4%"
          trend="down"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders from your store</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">#ORD-001</TableCell>
                  <TableCell>John Doe</TableCell>
                  <TableCell>
                    <Badge variant="success">Completed</Badge>
                  </TableCell>
                  <TableCell className="text-right">$125.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#ORD-002</TableCell>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>
                    <Badge variant="warning">Processing</Badge>
                  </TableCell>
                  <TableCell className="text-right">$89.99</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#ORD-003</TableCell>
                  <TableCell>Bob Johnson</TableCell>
                  <TableCell>
                    <Badge variant="info">Shipped</Badge>
                  </TableCell>
                  <TableCell className="text-right">$234.50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">#ORD-004</TableCell>
                  <TableCell>Alice Brown</TableCell>
                  <TableCell>
                    <Badge variant="default">Pending</Badge>
                  </TableCell>
                  <TableCell className="text-right">$67.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best selling products this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ProductItem name="Wireless Headphones" sales={234} revenue="$11,234" />
              <ProductItem name="Smart Watch Pro" sales={189} revenue="$9,450" />
              <ProductItem name="Laptop Stand" sales={156} revenue="$4,680" />
              <ProductItem name="USB-C Hub" sales={142} revenue="$3,550" />
              <ProductItem name="Mechanical Keyboard" sales={98} revenue="$8,820" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alert</CardTitle>
          <CardDescription>Products that need restocking</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Wireless Mouse</TableCell>
                <TableCell>WM-001</TableCell>
                <TableCell>5 units</TableCell>
                <TableCell>
                  <Badge variant="destructive">Critical</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Phone Case</TableCell>
                <TableCell>PC-234</TableCell>
                <TableCell>12 units</TableCell>
                <TableCell>
                  <Badge variant="warning">Low</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Screen Protector</TableCell>
                <TableCell>SP-445</TableCell>
                <TableCell>8 units</TableCell>
                <TableCell>
                  <Badge variant="warning">Low</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">{icon}</div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center gap-1 text-sm">
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            )}
            <span className={trend === "up" ? "text-green-500" : "text-red-500"}>{change}</span>
            <span className="text-gray-500">from last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductItem({ name, sales, revenue }: { name: string; sales: number; revenue: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-gray-500">{sales} sales</p>
      </div>
      <div className="text-right">
        <p className="font-medium">{revenue}</p>
      </div>
    </div>
  );
}
