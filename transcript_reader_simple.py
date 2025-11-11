"""
Simplified Voice Transcript Reader (TXT and JSON only - no external dependencies)
"""
import json
import re
from pathlib import Path
from typing import Dict


class TranscriptReader:
    """Reads and parses voice transcripts from TXT and JSON formats"""

    def __init__(self, file_path: str):
        """
        Initialize transcript reader

        Args:
            file_path: Path to the transcript file
        """
        self.file_path = Path(file_path)
        self.format = self.file_path.suffix.lower().lstrip('.')

        if self.format not in ['txt', 'json']:
            raise ValueError(
                f"Unsupported format: {self.format}. "
                f"Supported formats: txt, json"
            )

    def read(self) -> Dict:
        """
        Read and parse the transcript file

        Returns:
            Dict with transcript content and metadata
        """
        if self.format == 'txt':
            return self._read_txt()
        elif self.format == 'json':
            return self._read_json()

    def _read_txt(self) -> Dict:
        """Read plain text transcript"""
        with open(self.file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Try to extract speaker information if formatted as "Speaker: text"
        lines = content.split('\n')
        structured_content = []

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Check for "Speaker: text" format
            match = re.match(r'^([^:]+):\s*(.+)$', line)
            if match:
                speaker, text = match.groups()
                structured_content.append({
                    'speaker': speaker.strip(),
                    'text': text.strip()
                })
            else:
                structured_content.append({
                    'speaker': 'Unknown',
                    'text': line
                })

        return {
            'format': 'txt',
            'content': content,
            'structured_content': structured_content,
            'metadata': {
                'filename': self.file_path.name,
                'line_count': len(lines)
            }
        }

    def _read_json(self) -> Dict:
        """Read JSON transcript"""
        with open(self.file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Support various JSON structures
        if isinstance(data, list):
            # List of transcript entries
            structured_content = data
            full_text = ' '.join([
                item.get('text', item.get('content', ''))
                for item in data
            ])
        elif isinstance(data, dict):
            # Single object or with metadata
            if 'transcript' in data:
                structured_content = data['transcript']
                full_text = ' '.join([
                    item.get('text', item.get('content', ''))
                    for item in structured_content
                ])
            else:
                structured_content = [data]
                full_text = data.get('text', data.get('content', ''))
        else:
            raise ValueError("Invalid JSON structure")

        return {
            'format': 'json',
            'content': full_text,
            'structured_content': structured_content,
            'metadata': {
                'filename': self.file_path.name,
                'entry_count': len(structured_content)
            }
        }

    def get_summary(self) -> str:
        """
        Get a summary of the transcript

        Returns:
            Summary string
        """
        data = self.read()

        summary = f"Transcript: {data['metadata']['filename']}\n"
        summary += f"Format: {data['format'].upper()}\n"

        if 'line_count' in data['metadata']:
            summary += f"Lines: {data['metadata']['line_count']}\n"
        elif 'entry_count' in data['metadata']:
            summary += f"Entries: {data['metadata']['entry_count']}\n"

        # Extract unique speakers
        speakers = set()
        for item in data['structured_content']:
            if 'speaker' in item:
                speakers.add(item['speaker'])

        if speakers and speakers != {'Unknown'}:
            summary += f"Speakers: {', '.join(sorted(speakers))}\n"

        summary += f"\nContent preview:\n{data['content'][:200]}..."

        return summary


def parse_transcript(file_path: str) -> Dict:
    """
    Convenience function to parse a transcript

    Args:
        file_path: Path to transcript file

    Returns:
        Parsed transcript data
    """
    reader = TranscriptReader(file_path)
    return reader.read()
