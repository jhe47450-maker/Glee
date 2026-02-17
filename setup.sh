#!/bin/bash

# GleeJeYly - Complete Setup Guide
# This script sets up your Node.js full-stack application

echo "╔════════════════════════════════════════════════════╗"
echo "║     🍰 GleeJeYly - Node.js Setup Guide 🍰        ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found! Install from https://nodejs.org/"
    exit 1
fi
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo ""

# Check Git
echo "✓ Checking Git installation..."
if ! command -v git &> /dev/null; then
    echo "✗ Git not found! Install from https://git-scm.com/"
    exit 1
fi
echo "  Git: $(git --version)"
echo ""

# Install dependencies
echo "✓ Installing dependencies..."
echo "  This may take a minute..."
npm install --silent
echo "  ✓ Dependencies installed!"
echo ""

# Create .env if not exists
if [ ! -f .env.development ]; then
    echo "✓ Setting up environment..."
    cp .env.example .env.development 2>/dev/null || true
    echo "  Created .env.development"
fi
echo ""

# Build frontend
echo "✓ Building frontend..."
npm run build --silent
echo "  ✓ Frontend built!"
echo ""

# All done
echo "╔════════════════════════════════════════════════════╗"
echo "║              ✅ SETUP COMPLETE! ✅               ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1️⃣  Start Development:"
echo "    npm run dev:all"
echo ""
echo "2️⃣  Open in Browser:"
echo "    Frontend: http://localhost:5173"
echo "    API:      http://localhost:5000/api"
echo ""
echo "3️⃣  Create Test Order:"
echo "    Go to http://localhost:5173/order.html"
echo ""
echo "4️⃣  Deploy to GitHub:"
echo "    git add ."
echo "    git commit -m 'Initial Node.js setup'"
echo "    git push origin main"
echo ""
echo "📚 Documentation:"
echo "   - NODE_SERVER.md      → Quick start"
echo "   - DEPLOYMENT.md       → How to deploy"
echo "   - MIGRATION_COMPLETE  → What changed"
echo ""
echo "🚀 Ready to grow! Happy coding!"
echo ""
