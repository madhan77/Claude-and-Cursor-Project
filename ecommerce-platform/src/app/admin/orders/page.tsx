import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Eye, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-gray-600">Manage and fulfill customer orders</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <QuickStat label="Total Orders" value="1,234" />
        <QuickStat label="Pending" value="45" />
        <QuickStat label="Processing" value="23" />
        <QuickStat label="Shipped" value="167" />
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search orders by number, customer, or email..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>A list of all orders in your store</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <OrderRow
                orderNumber="ORD-2024-001"
                date={new Date("2024-01-15")}
                customer="John Doe"
                email="john@example.com"
                payment="paid"
                fulfillment="fulfilled"
                total={125.00}
              />
              <OrderRow
                orderNumber="ORD-2024-002"
                date={new Date("2024-01-15")}
                customer="Jane Smith"
                email="jane@example.com"
                payment="paid"
                fulfillment="unfulfilled"
                total={89.99}
              />
              <OrderRow
                orderNumber="ORD-2024-003"
                date={new Date("2024-01-14")}
                customer="Bob Johnson"
                email="bob@example.com"
                payment="pending"
                fulfillment="unfulfilled"
                total={234.50}
              />
              <OrderRow
                orderNumber="ORD-2024-004"
                date={new Date("2024-01-14")}
                customer="Alice Brown"
                email="alice@example.com"
                payment="paid"
                fulfillment="partial"
                total={67.00}
              />
              <OrderRow
                orderNumber="ORD-2024-005"
                date={new Date("2024-01-13")}
                customer="Charlie Wilson"
                email="charlie@example.com"
                payment="refunded"
                fulfillment="cancelled"
                total={156.75}
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </CardContent>
    </Card>
  );
}

function OrderRow({
  orderNumber,
  date,
  customer,
  email,
  payment,
  fulfillment,
  total,
}: {
  orderNumber: string;
  date: Date;
  customer: string;
  email: string;
  payment: "paid" | "pending" | "refunded";
  fulfillment: "fulfilled" | "unfulfilled" | "partial" | "cancelled";
  total: number;
}) {
  const paymentBadge = {
    paid: <Badge variant="success">Paid</Badge>,
    pending: <Badge variant="warning">Pending</Badge>,
    refunded: <Badge variant="destructive">Refunded</Badge>,
  };

  const fulfillmentBadge = {
    fulfilled: <Badge variant="success">Fulfilled</Badge>,
    unfulfilled: <Badge variant="warning">Unfulfilled</Badge>,
    partial: <Badge variant="info">Partial</Badge>,
    cancelled: <Badge variant="destructive">Cancelled</Badge>,
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{orderNumber}</TableCell>
      <TableCell className="text-gray-500">
        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{customer}</div>
          <div className="text-sm text-gray-500">{email}</div>
        </div>
      </TableCell>
      <TableCell>{paymentBadge[payment]}</TableCell>
      <TableCell>{fulfillmentBadge[fulfillment]}</TableCell>
      <TableCell className="text-right font-medium">{formatCurrency(total)}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}
