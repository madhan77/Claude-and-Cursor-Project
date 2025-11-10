#!/usr/bin/env python3
"""
Demo script to preview Voice Transcript Test Builder without full setup
"""
import sys
from pathlib import Path

print("🎬 Voice Transcript Test Builder - Demo Mode")
print("=" * 60)
print()

# Step 1: Test Transcript Reading
print("📖 STEP 1: Testing Transcript Reader")
print("-" * 60)

try:
    from transcript_reader import TranscriptReader

    # Read the sample transcript
    reader = TranscriptReader('examples/sample_transcript.txt')
    data = reader.read()

    print(f"✅ Successfully loaded transcript!")
    print(f"   Format: {data['format']}")
    print(f"   Lines: {len(data['structured_content'])}")

    # Show a preview
    print(f"\n📝 Transcript Preview:")
    print("-" * 60)
    for i, item in enumerate(data['structured_content'][:5], 1):
        speaker = item.get('speaker', 'Unknown')
        text = item.get('text', '')[:80]
        print(f"{i}. {speaker}: {text}...")

    if len(data['structured_content']) > 5:
        print(f"   ... and {len(data['structured_content']) - 5} more lines")

    print()

except Exception as e:
    print(f"❌ Error reading transcript: {e}")
    sys.exit(1)

# Step 2: Check Configuration
print("\n⚙️  STEP 2: Checking Configuration")
print("-" * 60)

try:
    from config import config

    print(f"AI Provider: {config.AI_PROVIDER}")
    print(f"AI Model: {config.AI_MODEL}")
    print(f"Test Format: {config.TEST_SCRIPT_FORMAT}")
    print(f"ServiceNow Instance: {config.SERVICENOW_INSTANCE or 'Not configured'}")
    print(f"Approval Required: {config.APPROVAL_REQUIRED}")

    # Check if we can do AI generation
    has_ai_key = False
    if config.AI_PROVIDER == 'anthropic' and config.ANTHROPIC_API_KEY:
        has_ai_key = True
        print(f"\n✅ Anthropic API key is configured")
    elif config.AI_PROVIDER == 'openai' and config.OPENAI_API_KEY:
        has_ai_key = True
        print(f"\n✅ OpenAI API key is configured")
    else:
        print(f"\n⚠️  No AI API key configured")
        print(f"   AI test generation will not work without an API key")
        print(f"\n   To enable AI generation, add to .env file:")
        print(f"   ANTHROPIC_API_KEY=your-key-here")
        print(f"   or")
        print(f"   OPENAI_API_KEY=your-key-here")

    print()

except Exception as e:
    print(f"❌ Error checking configuration: {e}")

# Step 3: Test Database
print("\n💾 STEP 3: Testing Database")
print("-" * 60)

try:
    from models import get_session, Transcript, TestScript

    session = get_session()

    transcript_count = session.query(Transcript).count()
    script_count = session.query(TestScript).count()

    print(f"✅ Database connected!")
    print(f"   Transcripts in database: {transcript_count}")
    print(f"   Test scripts in database: {script_count}")

    if script_count > 0:
        print(f"\n   Recent test scripts:")
        recent = session.query(TestScript).order_by(TestScript.created_at.desc()).limit(3).all()
        for script in recent:
            print(f"   - {script.id}: {script.title} ({script.status})")

    session.close()
    print()

except Exception as e:
    print(f"⚠️  Database not initialized: {e}")
    print(f"   Run: python cli.py init")
    print()

# Step 4: Show what's possible
print("\n🚀 STEP 4: What You Can Do Next")
print("-" * 60)
print()
print("WITHOUT AI API Key:")
print("  ✓ Read and parse transcripts")
print("  ✓ View database records")
print("  ✓ Test the CLI commands")
print()
print("WITH AI API Key:")
print("  ✓ Generate test scripts from transcripts")
print("  ✓ Use the full workflow")
print("  ✓ Create ServiceNow user stories")
print()
print("Try these commands:")
print("  1. View sample transcript:")
print("     cat examples/sample_transcript.txt")
print()
print("  2. Check configuration:")
print("     python cli.py config-check")
print()
print("  3. Generate test script (requires AI key):")
print("     python cli.py generate examples/sample_transcript.txt")
print()
print("  4. Start web server:")
print("     python app.py")
print()
print("=" * 60)
print("✨ Demo complete! Review the output above.")
