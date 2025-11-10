#!/bin/bash
# Quick demo/preview script for Voice Transcript Test Builder

echo "🎬 Voice Transcript Test Builder - Quick Preview"
echo "=================================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✅ Python 3 is available"
echo ""

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if python3 -c "import flask, anthropic, sqlalchemy" 2>/dev/null; then
    echo "✅ Core dependencies are installed"
else
    echo "⚠️  Some dependencies are missing"
    echo "   Installing dependencies..."
    pip install -r requirements.txt -q
fi
echo ""

# Create a demo .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating demo .env file..."
    cat > .env << 'EOF'
# Demo Configuration - Replace with your real credentials

# AI Provider (Required for test generation)
# Get your key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=your-anthropic-key-here
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20241022

# Or use OpenAI instead:
# OPENAI_API_KEY=your-openai-key-here
# AI_PROVIDER=openai
# AI_MODEL=gpt-4-turbo-preview

# ServiceNow (Can be dummy values for demo)
SERVICENOW_INSTANCE=demo.service-now.com
SERVICENOW_USERNAME=demo
SERVICENOW_PASSWORD=demo

# Disable approval for quick testing
APPROVAL_REQUIRED=false
AUTO_CREATE_STORY_ON_APPROVAL=false

# Test format
TEST_SCRIPT_FORMAT=gherkin

# App settings
FLASK_ENV=development
DATABASE_URL=sqlite:///./app.db
EOF
    echo "✅ Created .env file (edit it with your API keys)"
else
    echo "✅ .env file exists"
fi
echo ""

# Initialize database if needed
if [ ! -f "app.db" ]; then
    echo "💾 Initializing database..."
    python3 cli.py init
    echo ""
fi

# Run the Python demo script
echo "🎯 Running demo..."
echo ""
python3 demo.py

echo ""
echo "=================================================="
echo "📚 Next Steps:"
echo ""
echo "1. Edit .env file with your API key:"
echo "   nano .env"
echo ""
echo "2. Try generating a test script:"
echo "   python cli.py generate examples/sample_transcript.txt"
echo ""
echo "3. View the sample transcript first:"
echo "   cat examples/sample_transcript.txt"
echo ""
echo "4. Or start the web interface:"
echo "   python app.py"
echo ""
