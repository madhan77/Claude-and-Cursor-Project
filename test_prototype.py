#!/usr/bin/env python3
"""
Real Prototype Test - Voice Transcript Test Builder
"""
import sys
sys.path.insert(0, '/home/user/Claude-and-Cursor-Project')

print("=" * 80)
print("🚀 VOICE TRANSCRIPT TEST BUILDER - REAL PROTOTYPE TEST")
print("=" * 80)
print()

# Step 1: Test Configuration
print("⚙️  STEP 1: Testing Configuration")
print("-" * 80)
try:
    from config import config

    print(f"✅ Configuration loaded")
    print(f"   AI Provider: {config.AI_PROVIDER}")
    print(f"   AI Model: {config.AI_MODEL}")
    print(f"   Test Format: {config.TEST_SCRIPT_FORMAT}")
    print(f"   Database: {config.DATABASE_URL}")

    # Check if AI key is configured
    if config.AI_PROVIDER == 'anthropic':
        if config.ANTHROPIC_API_KEY and config.ANTHROPIC_API_KEY != 'your-anthropic-key-here':
            print(f"   ✅ Anthropic API key: Configured")
            has_ai_key = True
        else:
            print(f"   ⚠️  Anthropic API key: Not configured")
            has_ai_key = False
    elif config.AI_PROVIDER == 'openai':
        if config.OPENAI_API_KEY and config.OPENAI_API_KEY != 'your-openai-key-here':
            print(f"   ✅ OpenAI API key: Configured")
            has_ai_key = True
        else:
            print(f"   ⚠️  OpenAI API key: Not configured")
            has_ai_key = False
    else:
        has_ai_key = False

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)

print()

# Step 2: Test Transcript Reader
print("📖 STEP 2: Testing Transcript Reader")
print("-" * 80)
try:
    from transcript_reader_simple import TranscriptReader

    # Read TXT transcript
    reader = TranscriptReader('examples/sample_transcript.txt')
    transcript_data = reader.read()

    print(f"✅ TXT transcript loaded")
    print(f"   Format: {transcript_data['format']}")
    print(f"   Lines: {len(transcript_data['structured_content'])}")
    print(f"   Characters: {len(transcript_data['content'])}")

    print(f"\n   📝 Content Preview:")
    for i, item in enumerate(transcript_data['structured_content'][:3], 1):
        speaker = item.get('speaker', 'Unknown')
        text = item.get('text', '')[:70]
        print(f"   {i}. {speaker}: {text}...")

    # Read JSON transcript
    reader_json = TranscriptReader('examples/sample_transcript.json')
    json_data = reader_json.read()
    print(f"\n✅ JSON transcript loaded")
    print(f"   Entries: {len(json_data['structured_content'])}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()

# Step 3: Test Database
print("💾 STEP 3: Testing Database")
print("-" * 80)
try:
    from models import init_db, get_session, Transcript, TestScript

    init_db()
    print("✅ Database initialized")

    session = get_session()

    # Save transcript to database
    db_transcript = Transcript(
        filename='sample_transcript.txt',
        file_path='examples/sample_transcript.txt',
        file_format='txt',
        content=transcript_data['content'],
        transcript_metadata=transcript_data['metadata']
    )
    session.add(db_transcript)
    session.commit()

    print(f"✅ Transcript saved to database (ID: {db_transcript.id})")

    # Check existing records
    transcript_count = session.query(Transcript).count()
    script_count = session.query(TestScript).count()

    print(f"   Total transcripts: {transcript_count}")
    print(f"   Total test scripts: {script_count}")

    session.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print()

# Step 4: Test AI Generation (if API key configured)
if has_ai_key:
    print("🤖 STEP 4: Testing AI Test Script Generation")
    print("-" * 80)
    print("⚡ Generating test script with AI (this may take 10-30 seconds)...")
    print()

    try:
        from test_generator import TestScriptGenerator

        generator = TestScriptGenerator()

        # Generate test script
        test_script = generator.generate(transcript_data, "Mobile app authentication feature")

        print(f"✅ Test script generated!")
        print(f"   Title: {test_script['title']}")
        print(f"   Format: {test_script['format']}")
        print(f"   AI Provider: {test_script['ai_provider']}")
        print(f"   AI Model: {test_script['ai_model']}")
        print(f"   Content length: {len(test_script['content'])} characters")

        print(f"\n   📋 Generated Test Script Preview:")
        print("   " + "-" * 70)
        preview = test_script['content'][:800]
        for line in preview.split('\n'):
            print(f"   {line}")
        if len(test_script['content']) > 800:
            print("   ...")
            print(f"   [... {len(test_script['content']) - 800} more characters]")
        print("   " + "-" * 70)

        # Save to database
        session = get_session()
        db_test_script = TestScript(
            transcript_id=db_transcript.id,
            title=test_script['title'],
            description=test_script['description'],
            script_format=test_script['format'],
            content=test_script['content'],
            ai_provider=test_script['ai_provider'],
            ai_model=test_script['ai_model'],
            status='approved'  # Auto-approve for testing
        )
        session.add(db_test_script)
        session.commit()
        test_script_id = db_test_script.id
        session.close()

        print(f"\n✅ Test script saved to database (ID: {test_script_id})")

    except Exception as e:
        print(f"❌ Error generating test script: {e}")
        import traceback
        traceback.print_exc()

else:
    print("⏭️  STEP 4: Skipping AI Test Generation")
    print("-" * 80)
    print("⚠️  No AI API key configured")
    print()
    print("To enable AI test generation:")
    print("  1. Get an API key:")
    print("     • Anthropic Claude: https://console.anthropic.com/")
    print("     • OR OpenAI: https://platform.openai.com/")
    print()
    print("  2. Edit .env file:")
    print("     nano .env")
    print()
    print("  3. Add your API key:")
    print("     ANTHROPIC_API_KEY=sk-ant-your-actual-key-here")
    print()
    print("  4. Run this test again:")
    print("     python3 test_prototype.py")

print()
print("=" * 80)
print("✅ PROTOTYPE TEST COMPLETE")
print("=" * 80)
print()

if has_ai_key:
    print("🎉 SUCCESS! Your Voice Transcript Test Builder is fully functional!")
    print()
    print("📚 Next Steps:")
    print("   1. View generated test scripts:")
    print("      python3 -c \"from models import get_session, TestScript; s=get_session(); print(s.query(TestScript).first().content); s.close()\"")
    print()
    print("   2. Try the CLI:")
    print("      python3 cli.py list")
    print("      python3 cli.py view 1")
    print()
    print("   3. Generate more test scripts:")
    print("      python3 cli.py generate examples/sample_transcript.json")
else:
    print("👉 To complete the setup, add your AI API key to the .env file")
    print("   Then run this test again to see the full prototype in action!")

print()
