import { LayoutDashboard, Package, ShoppingCart, Users, Settings, BarChart3, Tag, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <NavLink href="/admin" icon={<LayoutDashboard className="h-5 w-5" />}>
              Dashboard
            </NavLink>
            <NavLink href="/admin/products" icon={<Package className="h-5 w-5" />}>
              Products
            </NavLink>
            <NavLink href="/admin/orders" icon={<ShoppingCart className="h-5 w-5" />}>
              Orders
            </NavLink>
            <NavLink href="/admin/customers" icon={<Users className="h-5 w-5" />}>
              Customers
            </NavLink>
            <NavLink href="/admin/analytics" icon={<BarChart3 className="h-5 w-5" />}>
              Analytics
            </NavLink>
            <NavLink href="/admin/discounts" icon={<Tag className="h-5 w-5" />}>
              Discounts
            </NavLink>
            <NavLink href="/admin/reviews" icon={<MessageSquare className="h-5 w-5" />}>
              Reviews
            </NavLink>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <NavLink href="/admin/settings" icon={<Settings className="h-5 w-5" />}>
                Settings
              </NavLink>
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">AD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">admin@store.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
