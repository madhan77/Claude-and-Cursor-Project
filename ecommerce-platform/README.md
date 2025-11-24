# E-Commerce Platform

A modern, full-featured e-commerce platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

### Phase 1 - Foundation (Current)
- ✅ Next.js 15 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Prisma ORM with PostgreSQL
- ✅ Comprehensive database schema
- 🔄 Authentication with NextAuth.js
- 🔄 Admin dashboard
- 🔄 Storefront theme

### Planned Features
- Product management with variants
- Shopping cart and checkout
- Multiple payment gateways (Stripe, PayPal)
- Order management and fulfillment
- Customer accounts and profiles
- Inventory tracking
- Discount codes and promotions
- Email notifications
- Analytics and reporting
- Multi-store support
- B2B features

## 📋 Tech Stack

**Frontend:**
- Next.js 15 (React 19)
- TypeScript
- Tailwind CSS
- Radix UI components
- Lucide Icons

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js

**Payments:**
- Stripe
- PayPal (planned)

**Email:**
- Nodemailer
- SendGrid (planned)

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd ecommerce-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your database credentials and other secrets:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db"
NEXTAUTH_SECRET="your-secret-here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

4. **Set up the database**
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
ecommerce-platform/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── (storefront)/      # Customer-facing pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── admin/             # Admin components
│   │   └── storefront/        # Storefront components
│   ├── lib/                   # Utility functions
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript types
├── .env.example               # Environment variables template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## 🗄️ Database Schema

The platform uses a comprehensive database schema with the following main entities:

- **Merchants** - Multi-store support
- **Products** - Products with variants, images, and inventory
- **Categories & Collections** - Product organization
- **Orders** - Order management with items
- **Customers** - Customer accounts and addresses
- **Carts** - Shopping cart functionality
- **Discount Codes** - Promotional discounts
- **Reviews** - Product reviews and ratings

See `prisma/schema.prisma` for the complete schema.

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database with sample data
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- Email service credentials
- AWS S3 credentials (for images)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Set up PostgreSQL database
3. Run database migrations
4. Start the production server:
```bash
npm start
```

## 📖 Documentation

- [Product Requirements Document](../ECOMMERCE_PRD.md) - Full PRD with features and specifications
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🗺️ Roadmap

### Phase 1: Foundation (Months 1-2) ✅
- [x] Project setup
- [x] Database schema
- [ ] Authentication system
- [ ] Basic API infrastructure
- [ ] Admin panel framework
- [ ] Storefront theme framework

### Phase 2: Core Features (Months 3-4)
- [ ] Product management (CRUD)
- [ ] Product variants and inventory
- [ ] Shopping cart
- [ ] Basic checkout
- [ ] Stripe payment integration
- [ ] Order management
- [ ] Customer accounts
- [ ] Email notifications

### Phase 3: Launch Preparation (Months 5-6)
- [ ] Shipping rate calculation
- [ ] Tax calculation
- [ ] Discount codes
- [ ] Basic analytics
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

## 📧 Support

For support, email support@yourecommerce.com or open an issue on GitHub.

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**
