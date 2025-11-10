# Quick Start Guide

Get up and running with Voice Transcript Test Builder in 5 minutes!

## 1. Setup (2 minutes)

```bash
# Clone and navigate to the project
cd Claude-and-Cursor-Project

# Run the setup script
chmod +x setup.sh
./setup.sh
```

## 2. Configure (2 minutes)

Edit the `.env` file with your credentials:

```bash
# Open .env in your editor
nano .env
# or
vim .env
```

**Minimum required configuration**:

```env
# Choose ONE AI provider:

# Option A: Anthropic Claude (Recommended)
ANTHROPIC_API_KEY=sk-ant-xxxxx
AI_PROVIDER=anthropic

# Option B: OpenAI
# OPENAI_API_KEY=sk-xxxxx
# AI_PROVIDER=openai

# ServiceNow (Required)
SERVICENOW_INSTANCE=yourcompany.service-now.com
SERVICENOW_USERNAME=your.email@company.com
SERVICENOW_PASSWORD=your-password
```

## 3. Test It (1 minute)

### Try the CLI with a sample transcript:

```bash
# Generate a test script from sample transcript
python cli.py generate examples/sample_transcript.txt

# View the generated test script
python cli.py list
python cli.py view 1
```

### Or try the Web API:

```bash
# Terminal 1: Start the web server
python app.py

# Terminal 2: Upload a transcript
curl -X POST -F "file=@examples/sample_transcript.txt" \
  http://localhost:5000/upload
```

## Common Use Cases

### Use Case 1: Quick Test Generation (No Approval)

```bash
python cli.py generate transcript.txt --auto-approve --create-story
```

This will:
1. ✅ Read the transcript
2. ✅ Generate test script
3. ✅ Auto-approve it
4. ✅ Create ServiceNow user story

### Use Case 2: With Approval Workflow

```bash
# Generate and request approval
python cli.py generate transcript.txt

# Product owner receives email and approves
python cli.py approve 1

# Story is automatically created in ServiceNow
```

### Use Case 3: Batch Processing

```python
from test_generator import TestScriptGenerator

generator = TestScriptGenerator()
results = generator.generate_batch([
    'meeting1.txt',
    'meeting2.txt',
    'meeting3.txt'
])
```

## Key Commands

```bash
# CLI Commands
python cli.py init              # Initialize database
python cli.py config-check      # Verify configuration
python cli.py generate FILE     # Generate test script
python cli.py list              # List all test scripts
python cli.py view ID           # View a test script
python cli.py approve ID        # Approve a test script

# Web API
python app.py                   # Start web server
curl localhost:5000/health      # Check API health
```

## Transcript Formats Supported

- **TXT**: Plain text with speaker labels
- **JSON**: Structured JSON with timestamps
- **VTT**: WebVTT subtitle format
- **SRT**: SubRip subtitle format

## Test Script Formats Available

Set in `.env` file:

```env
TEST_SCRIPT_FORMAT=gherkin
```

Options:
- `gherkin` - Behavior-Driven Development (BDD) format
- `pytest` - Python test framework format
- `manual` - Manual test case format
- `cucumber` - Cucumber test format

## Troubleshooting

### "Configuration error"
```bash
python cli.py config-check
# Fix any missing values in .env file
```

### "Database not initialized"
```bash
python cli.py init
```

### "API key invalid"
```bash
# Verify your API key in .env
# Make sure there are no extra spaces or quotes
```

## What's Next?

1. **Customize Test Generation**: Edit prompts in `test_generator.py`
2. **Add Custom Fields**: Modify `servicenow_integration.py` for your ServiceNow instance
3. **Integrate with CI/CD**: Use the CLI in your pipelines
4. **Build a UI**: The Flask API is ready for a frontend

## Getting Help

- 📖 Full documentation: See [README.md](README.md)
- 🐛 Issues: Create an issue in the repository
- 💡 Examples: Check the `examples/` directory

## Sample Output

When you run the generate command, you'll see:

```
Reading transcript: examples/sample_transcript.txt
✓ Transcript loaded (txt format)
  Lines: 12

Generating test script using anthropic...
✓ Test script generated!
  Title: User Authentication Feature
  Format: gherkin

╭─────────────────── Generated Test Script ────────────────────╮
│ Feature: User Authentication                                  │
│   As a user                                                   │
│   I want to login with email and password                     │
│   So that I can access my account                             │
│                                                                │
│   Scenario: Successful login with valid credentials           │
│     Given I am on the login page                              │
│     When I enter valid email and password                     │
│     Then I should be logged in successfully                   │
│     ...                                                        │
╰───────────────────────────────────────────────────────────────╯

✓ Test script ID: 1
```

Ready to generate test scripts from your voice transcripts! 🚀
