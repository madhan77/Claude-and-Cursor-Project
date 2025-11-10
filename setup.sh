#!/bin/bash
# Setup script for Voice Transcript Test Builder

set -e

echo "🚀 Voice Transcript Test Builder - Setup Script"
echo "================================================"

# Check Python version
echo ""
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Found Python $python_version"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi
echo "✓ pip3 is available"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt
echo "✓ Dependencies installed"

# Create necessary directories
echo ""
echo "Creating directories..."
mkdir -p uploads outputs templates examples
touch uploads/.gitkeep outputs/.gitkeep templates/.gitkeep
echo "✓ Directories created"

# Setup environment file
echo ""
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your configuration:"
    echo "   - Add your AI API key (Anthropic or OpenAI)"
    echo "   - Add your ServiceNow credentials"
    echo "   - Configure email settings (optional)"
else
    echo "✓ .env file already exists"
fi

# Initialize database
echo ""
echo "Initializing database..."
python cli.py init
echo "✓ Database initialized"

# Run configuration check
echo ""
echo "Checking configuration..."
python cli.py config-check

echo ""
echo "================================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys and credentials"
echo "2. Run 'source venv/bin/activate' to activate the virtual environment"
echo "3. Try the CLI: python cli.py generate examples/sample_transcript.txt"
echo "4. Or start the web server: python app.py"
echo ""
echo "For more information, see README.md"
