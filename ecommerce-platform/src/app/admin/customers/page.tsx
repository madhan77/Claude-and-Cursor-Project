import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Eye, Mail } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customers</h1>
          <p className="text-gray-600">Manage your customer base</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <QuickStat label="Total Customers" value="2,345" />
        <QuickStat label="New This Month" value="156" />
        <QuickStat label="Active" value="1,892" />
        <QuickStat label="Avg. LTV" value="$432" />
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search customers by name or email..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>A list of all customers in your store</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <CustomerRow
                name="John Doe"
                email="john@example.com"
                orders={12}
                totalSpent={1234.56}
                status="active"
              />
              <CustomerRow
                name="Jane Smith"
                email="jane@example.com"
                orders={8}
                totalSpent={892.00}
                status="active"
              />
              <CustomerRow
                name="Bob Johnson"
                email="bob@example.com"
                orders={25}
                totalSpent={3456.78}
                status="vip"
              />
              <CustomerRow
                name="Alice Brown"
                email="alice@example.com"
                orders={3}
                totalSpent={234.50}
                status="active"
              />
              <CustomerRow
                name="Charlie Wilson"
                email="charlie@example.com"
                orders={1}
                totalSpent={67.00}
                status="new"
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

function CustomerRow({
  name,
  email,
  orders,
  totalSpent,
  status,
}: {
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  status: "active" | "vip" | "new" | "inactive";
}) {
  const statusBadge = {
    active: <Badge variant="success">Active</Badge>,
    vip: <Badge className="bg-purple-500 hover:bg-purple-600">VIP</Badge>,
    new: <Badge variant="info">New</Badge>,
    inactive: <Badge variant="secondary">Inactive</Badge>,
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">{name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div className="font-medium">{name}</div>
        </div>
      </TableCell>
      <TableCell className="text-gray-500">{email}</TableCell>
      <TableCell>{orders} orders</TableCell>
      <TableCell className="font-medium">${totalSpent.toFixed(2)}</TableCell>
      <TableCell>{statusBadge[status]}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button variant="ghost" size="sm">
            <Mail className="h-4 w-4 mr-1" />
            Email
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
