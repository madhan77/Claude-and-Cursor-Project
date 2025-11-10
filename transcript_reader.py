"""
Voice Transcript Reader Module
Supports multiple transcript formats: TXT, VTT, SRT, JSON
"""
import json
import re
from pathlib import Path
from typing import Dict, List, Optional
import webvtt
import pysrt


class TranscriptReader:
    """Reads and parses voice transcripts from various formats"""

    SUPPORTED_FORMATS = ['txt', 'vtt', 'srt', 'json']

    def __init__(self, file_path: str):
        """
        Initialize transcript reader

        Args:
            file_path: Path to the transcript file
        """
        self.file_path = Path(file_path)
        self.format = self.file_path.suffix.lower().lstrip('.')

        if self.format not in self.SUPPORTED_FORMATS:
            raise ValueError(
                f"Unsupported format: {self.format}. "
                f"Supported formats: {', '.join(self.SUPPORTED_FORMATS)}"
            )

    def read(self) -> Dict:
        """
        Read and parse the transcript file

        Returns:
            Dict with transcript content and metadata
        """
        if self.format == 'txt':
            return self._read_txt()
        elif self.format == 'vtt':
            return self._read_vtt()
        elif self.format == 'srt':
            return self._read_srt()
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

    def _read_vtt(self) -> Dict:
        """Read WebVTT transcript"""
        captions = webvtt.read(str(self.file_path))

        structured_content = []
        full_text = []

        for caption in captions:
            structured_content.append({
                'start': caption.start,
                'end': caption.end,
                'text': caption.text,
                'speaker': self._extract_speaker(caption.text)
            })
            full_text.append(caption.text)

        return {
            'format': 'vtt',
            'content': '\n'.join(full_text),
            'structured_content': structured_content,
            'metadata': {
                'filename': self.file_path.name,
                'caption_count': len(captions)
            }
        }

    def _read_srt(self) -> Dict:
        """Read SRT subtitle transcript"""
        subs = pysrt.open(str(self.file_path))

        structured_content = []
        full_text = []

        for sub in subs:
            structured_content.append({
                'start': str(sub.start),
                'end': str(sub.end),
                'text': sub.text,
                'speaker': self._extract_speaker(sub.text)
            })
            full_text.append(sub.text)

        return {
            'format': 'srt',
            'content': '\n'.join(full_text),
            'structured_content': structured_content,
            'metadata': {
                'filename': self.file_path.name,
                'subtitle_count': len(subs)
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

    def _extract_speaker(self, text: str) -> str:
        """
        Extract speaker name from text if present

        Args:
            text: Text that might contain speaker name

        Returns:
            Speaker name or 'Unknown'
        """
        # Look for patterns like "Speaker:", "[Speaker]", "<Speaker>"
        patterns = [
            r'^([^:]+):\s*',
            r'^\[([^\]]+)\]\s*',
            r'^<([^>]+)>\s*'
        ]

        for pattern in patterns:
            match = re.match(pattern, text)
            if match:
                return match.group(1).strip()

        return 'Unknown'

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
        elif 'caption_count' in data['metadata']:
            summary += f"Captions: {data['metadata']['caption_count']}\n"
        elif 'subtitle_count' in data['metadata']:
            summary += f"Subtitles: {data['metadata']['subtitle_count']}\n"
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
