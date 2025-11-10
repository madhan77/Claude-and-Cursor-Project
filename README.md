# Voice Transcript Test Builder

A powerful tool that reads voice transcripts from meetings or requirements gathering sessions and automatically generates comprehensive test scripts using AI. The generated test scripts can be reviewed and approved before being automatically integrated with ServiceNow to create user stories.

## Features

- **Multi-format Transcript Support**: Reads transcripts in TXT, VTT, SRT, and JSON formats
- **AI-Powered Test Generation**: Uses Anthropic Claude or OpenAI GPT to generate intelligent test scripts
- **Multiple Test Formats**: Supports Gherkin/BDD, pytest, manual test cases, and Cucumber formats
- **Approval Workflow**: Built-in approval system with email notifications
- **ServiceNow Integration**: Automatically creates user stories with test scripts
- **Dual Interface**: Both CLI and Web API interfaces
- **Database Storage**: Tracks transcripts, test scripts, and approval history

## Architecture

```
┌─────────────────┐
│ Voice Transcript│
│   (TXT/VTT/     │
│   SRT/JSON)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Transcript      │
│ Reader          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ AI Test Script  │
│ Generator       │
│ (Claude/GPT)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Approval        │
│ Workflow        │
│ (Email/Web)     │
└────────┬────────┘
         │
         ▼ (if approved)
┌─────────────────┐
│ ServiceNow      │
│ Integration     │
│ (User Story)    │
└─────────────────┘
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- ServiceNow account and credentials
- API key for Anthropic Claude or OpenAI (choose one)

### Quick Setup

```bash
# Run the setup script
chmod +x setup.sh
./setup.sh
```

### Manual Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize the database**:
   ```bash
   python cli.py init
   ```

## Configuration

Edit the `.env` file with your settings:

### AI Provider Settings

**For Anthropic Claude** (Recommended):
```env
ANTHROPIC_API_KEY=your-anthropic-api-key
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20241022
```

**For OpenAI**:
```env
OPENAI_API_KEY=your-openai-api-key
AI_PROVIDER=openai
AI_MODEL=gpt-4-turbo-preview
```

### ServiceNow Settings

```env
SERVICENOW_INSTANCE=your-instance.service-now.com
SERVICENOW_USERNAME=your-username
SERVICENOW_PASSWORD=your-password
```

### Test Script Format

Choose your preferred test format:
```env
TEST_SCRIPT_FORMAT=gherkin
# Options: gherkin, pytest, manual, cucumber
```

## Usage

### Command Line Interface (CLI)

#### Generate Test Script from Transcript

```bash
python cli.py generate path/to/transcript.txt
```

**With options**:
```bash
# Add context for better test generation
python cli.py generate transcript.txt -c "This is for a mobile app"

# Auto-approve and create ServiceNow story
python cli.py generate transcript.txt --auto-approve --create-story

# Save output to file
python cli.py generate transcript.txt -o output.feature
```

#### List Generated Test Scripts

```bash
# List all test scripts
python cli.py list

# Filter by status
python cli.py list --status pending
python cli.py list --status approved

# Limit results
python cli.py list --limit 5
```

#### View a Test Script

```bash
python cli.py view 1
```

#### Approve or Reject a Test Script

```bash
# Approve
python cli.py approve 1

# Reject with note
python cli.py approve 1 --reject --note "Needs more edge cases"
```

### Web API

Start the Flask web server:

```bash
python app.py
```

The API will be available at `http://localhost:5000`

#### API Endpoints

**Upload Transcript**:
```bash
curl -X POST -F "file=@transcript.txt" \
  -F "context=Additional context here" \
  -F "auto_approve=false" \
  -F "create_story=false" \
  http://localhost:5000/upload
```

**List Test Scripts**:
```bash
curl http://localhost:5000/test-scripts?status=pending
```

**View Test Script**:
```bash
curl http://localhost:5000/test-script/1
```

**Approve Test Script**:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"approved": true, "note": "Looks good"}' \
  http://localhost:5000/approve-script/1
```

## Transcript Formats

Supports TXT, VTT, SRT, and JSON formats. See `examples/` directory for sample files.

## Project Structure

```
Claude-and-Cursor-Project/
├── config.py                  # Configuration management
├── models.py                  # Database models
├── transcript_reader.py       # Transcript parsing
├── test_generator.py          # AI-powered test generation
├── approval_workflow.py       # Approval system
├── servicenow_integration.py  # ServiceNow API client
├── cli.py                     # Command-line interface
├── app.py                     # Flask web application
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
├── examples/                 # Example transcript files
└── README.md                # This file
```

## Examples

Try the sample transcripts:
```bash
python cli.py generate examples/sample_transcript.txt
python cli.py generate examples/sample_transcript.json
```

## Security Considerations

- Store API keys in `.env` file (never commit to git)
- Use environment variables in production
- Enable HTTPS for the web application
- Implement authentication for the web API

## Troubleshooting

### Check Configuration
```bash
python cli.py config-check
```

### Reinitialize Database
```bash
rm app.db
python cli.py init
```

## License

[Add your license here]

## Support

For issues and questions, create an issue in the repository.