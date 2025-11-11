#!/usr/bin/env python3
"""
Quick test of transcript reader without AI API
"""
import sys
sys.path.insert(0, '/home/user/Claude-and-Cursor-Project')

print("🎬 Testing Transcript Reader (No API Key Required)")
print("=" * 70)
print()

# Test 1: Read text transcript
print("📝 Test 1: Reading TXT transcript...")
try:
    from transcript_reader import TranscriptReader

    reader = TranscriptReader('examples/sample_transcript.txt')
    data = reader.read()

    print(f"✅ Success!")
    print(f"   Format: {data['format']}")
    print(f"   Lines: {len(data['structured_content'])}")
    print(f"   Characters: {len(data['content'])}")

    print(f"\n   Preview (first 3 speakers):")
    for item in data['structured_content'][:3]:
        speaker = item.get('speaker', 'Unknown')
        text = item.get('text', '')[:60]
        print(f"   • {speaker}: {text}...")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print()

# Test 2: Read JSON transcript
print("📝 Test 2: Reading JSON transcript...")
try:
    reader = TranscriptReader('examples/sample_transcript.json')
    data = reader.read()

    print(f"✅ Success!")
    print(f"   Format: {data['format']}")
    print(f"   Entries: {len(data['structured_content'])}")

    if 'participants' in data['structured_content'][0]:
        print(f"   Has metadata: Yes")

except Exception as e:
    print(f"❌ Error: {e}")

print()

# Test 3: Database setup
print("💾 Test 3: Database initialization...")
try:
    from models import init_db, get_session, Transcript

    init_db()
    print("✅ Database initialized!")

    session = get_session()
    count = session.query(Transcript).count()
    print(f"   Existing transcripts: {count}")
    session.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 70)
print("✅ Basic functionality test complete!")
print()
print("Next steps:")
print("  1. Add your Anthropic API key to .env file")
print("  2. Run full test with AI generation")
print()
