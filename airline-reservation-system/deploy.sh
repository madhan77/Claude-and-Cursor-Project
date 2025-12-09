#!/bin/bash

# Deployment Script for Airline Reservation System
# This script helps automate the deployment process

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║   🛫 Airline Reservation System - Deployment         ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    echo ""

    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI is not installed."
        echo "Install it with: npm install -g @railway/cli"
        exit 1
    fi

    # Login check
    echo "Checking Railway login status..."
    if ! railway whoami &> /dev/null; then
        echo "Please login to Railway:"
        railway login
    fi

    # Deploy
    cd backend
    echo "Deploying backend to Railway..."
    railway up

    echo ""
    echo "✅ Backend deployed to Railway!"
    echo "💡 Don't forget to:"
    echo "   1. Add PostgreSQL plugin in Railway dashboard"
    echo "   2. Set environment variables (JWT_SECRET, etc.)"
    echo "   3. Run: railway run npm run migrate"
    echo "   4. Run: railway run npm run seed"
}

# Function to deploy to Render
deploy_render() {
    echo "🎨 Deploying to Render..."
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://render.com"
    echo "2. Create a new Web Service"
    echo "3. Connect your GitHub repository"
    echo "4. Use render.yaml for configuration"
    echo "5. Set environment variables in Render dashboard"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
}

# Function to deploy with Docker
deploy_docker() {
    echo "🐳 Deploying with Docker..."
    echo ""

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed."
        echo "Install it from: https://docs.docker.com/get-docker/"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed."
        exit 1
    fi

    # Check for .env file
    if [ ! -f ".env" ]; then
        echo "⚠️  No .env file found. Creating from example..."
        cp .env.production.example .env
        echo "Please edit .env with your configuration"
        echo "Required: DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET"
        read -p "Press Enter after editing .env..."
    fi

    # Build and start
    echo "Building Docker images..."
    docker-compose build

    echo "Starting services..."
    docker-compose up -d

    echo ""
    echo "⏳ Waiting for services to be ready..."
    sleep 10

    # Run migrations
    echo "Running database migrations..."
    docker-compose exec backend npm run migrate

    echo "Seeding database..."
    docker-compose exec backend npm run seed

    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "Services are running at:"
    echo "  - Frontend: http://localhost"
    echo "  - Backend:  http://localhost:5000"
    echo "  - Database: localhost:5432"
    echo ""
    echo "View logs with: docker-compose logs -f"
    echo "Stop services with: docker-compose down"
}

# Function to deploy frontend to Vercel
deploy_vercel() {
    echo "▲ Deploying frontend to Vercel..."
    echo ""

    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi

    # Login check
    echo "Checking Vercel login status..."
    if ! vercel whoami &> /dev/null; then
        echo "Please login to Vercel:"
        vercel login
    fi

    # Deploy
    cd frontend
    echo "Deploying to Vercel..."
    vercel --prod

    echo ""
    echo "✅ Frontend deployed to Vercel!"
    echo "💡 Don't forget to set VITE_API_URL environment variable"
}

# Main menu
echo "Choose deployment option:"
echo ""
echo "  1) Railway + Vercel (Recommended)"
echo "  2) Render + Vercel"
echo "  3) Docker (Local/Self-hosted)"
echo "  4) Vercel only (Frontend)"
echo "  5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_railway
        echo ""
        deploy_vercel
        ;;
    2)
        deploy_render
        echo ""
        deploy_vercel
        ;;
    3)
        deploy_docker
        ;;
    4)
        deploy_vercel
        ;;
    5)
        echo "Deployment cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║   🎉 Deployment Complete!                             ║"
echo "║                                                        ║"
echo "║   Next Steps:                                          ║"
echo "║   1. Test your application                             ║"
echo "║   2. Monitor logs for errors                           ║"
echo "║   3. Set up monitoring and alerts                      ║"
echo "║   4. Configure custom domain (optional)                ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
