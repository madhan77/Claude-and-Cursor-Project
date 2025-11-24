import Link from "next/link";
import { ShoppingBag, LayoutDashboard, Package, Users, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">E-Commerce Platform</span>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/store"
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Store
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Build Your Dream Store
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A complete e-commerce solution with powerful features for product management,
          order processing, and customer engagement.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/admin"
            className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/store"
            className="px-8 py-3 border-2 border-gray-300 rounded-lg font-medium hover:border-primary hover:text-primary transition-colors"
          >
            View Demo Store
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Package className="h-10 w-10 text-blue-600" />}
            title="Product Management"
            description="Manage unlimited products with variants, inventory tracking, and bulk operations"
          />
          <FeatureCard
            icon={<ShoppingBag className="h-10 w-10 text-green-600" />}
            title="Smart Checkout"
            description="Optimized checkout flow with multiple payment gateways and shipping options"
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-purple-600" />}
            title="Customer Management"
            description="Customer accounts, order history, wishlists, and segmentation"
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-orange-600" />}
            title="Analytics & Reports"
            description="Real-time analytics, sales reports, and business intelligence"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="99.9%" label="Uptime SLA" />
            <StatCard number="<2s" label="Page Load Time" />
            <StatCard number="10k+" label="Concurrent Users" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 E-Commerce Platform. Built with Next.js, TypeScript, and Prisma.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-white/80">{label}</div>
    </div>
  );
}
