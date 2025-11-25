import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search products..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>A list of all products in your store</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <ProductRow
                image="/placeholder.jpg"
                name="Wireless Headphones"
                sku="WH-001"
                stock={45}
                price="$79.99"
                status="active"
              />
              <ProductRow
                image="/placeholder.jpg"
                name="Smart Watch Pro"
                sku="SW-234"
                stock={23}
                price="$299.99"
                status="active"
              />
              <ProductRow
                image="/placeholder.jpg"
                name="Laptop Stand"
                sku="LS-445"
                stock={67}
                price="$49.99"
                status="active"
              />
              <ProductRow
                image="/placeholder.jpg"
                name="USB-C Hub"
                sku="UH-889"
                stock={12}
                price="$34.99"
                status="low_stock"
              />
              <ProductRow
                image="/placeholder.jpg"
                name="Mechanical Keyboard"
                sku="MK-123"
                stock={0}
                price="$129.99"
                status="out_of_stock"
              />
              <ProductRow
                image="/placeholder.jpg"
                name="Wireless Mouse"
                sku="WM-567"
                stock={89}
                price="$39.99"
                status="active"
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductRow({
  image,
  name,
  sku,
  stock,
  price,
  status,
}: {
  image: string;
  name: string;
  sku: string;
  stock: number;
  price: string;
  status: "active" | "low_stock" | "out_of_stock" | "draft";
}) {
  const statusBadge = {
    active: <Badge variant="success">Active</Badge>,
    low_stock: <Badge variant="warning">Low Stock</Badge>,
    out_of_stock: <Badge variant="destructive">Out of Stock</Badge>,
    draft: <Badge variant="secondary">Draft</Badge>,
  };

  return (
    <TableRow>
      <TableCell>
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <Package className="h-6 w-6 text-gray-400" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{name}</TableCell>
      <TableCell className="text-gray-500">{sku}</TableCell>
      <TableCell>{stock} units</TableCell>
      <TableCell className="font-medium">{price}</TableCell>
      <TableCell>{statusBadge[status]}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Placeholder icon
function Package({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}
