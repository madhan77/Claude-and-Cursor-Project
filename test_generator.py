"""
AI-Powered Test Script Generator
Uses LLMs (Anthropic Claude or OpenAI) to generate test scripts from voice transcripts
"""
import json
from typing import Dict, List, Optional
from anthropic import Anthropic
import openai
from config import config


class TestScriptGenerator:
    """Generates test scripts from voice transcripts using AI"""

    def __init__(self):
        """Initialize the test script generator"""
        self.ai_provider = config.AI_PROVIDER
        self.ai_model = config.AI_MODEL
        self.test_format = config.TEST_SCRIPT_FORMAT

        # Initialize AI client
        if self.ai_provider == 'anthropic':
            self.client = Anthropic(api_key=config.ANTHROPIC_API_KEY)
        elif self.ai_provider == 'openai':
            openai.api_key = config.OPENAI_API_KEY
            self.client = openai
        else:
            raise ValueError(f"Unsupported AI provider: {self.ai_provider}")

    def generate(self, transcript_data: Dict, additional_context: Optional[str] = None) -> Dict:
        """
        Generate test script from transcript

        Args:
            transcript_data: Parsed transcript data from TranscriptReader
            additional_context: Optional additional context for test generation

        Returns:
            Dict containing the generated test script and metadata
        """
        # Build the prompt
        prompt = self._build_prompt(transcript_data, additional_context)

        # Generate test script using AI
        if self.ai_provider == 'anthropic':
            response = self._generate_with_anthropic(prompt)
        else:
            response = self._generate_with_openai(prompt)

        # Parse and structure the response
        return self._parse_response(response, transcript_data)

    def _build_prompt(self, transcript_data: Dict, additional_context: Optional[str] = None) -> str:
        """Build the prompt for AI"""
        format_instructions = {
            'gherkin': """
Generate test scripts in Gherkin/BDD format with the following structure:
Feature: [Feature name]
  As a [role]
  I want [goal]
  So that [benefit]

  Scenario: [Scenario name]
    Given [precondition]
    When [action]
    Then [expected result]
""",
            'pytest': """
Generate test scripts in pytest format with the following structure:
```python
import pytest

class TestFeatureName:
    def test_scenario_name(self):
        # Arrange
        ...
        # Act
        ...
        # Assert
        assert expected_result
```
""",
            'manual': """
Generate manual test cases with the following structure:
Test Case ID: TC-XXX
Title: [Test case title]
Preconditions: [What needs to be set up]
Test Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]
Expected Results:
1. [Expected result for step 1]
2. [Expected result for step 2]
3. [Expected result for step 3]
""",
            'cucumber': """
Generate test scripts in Cucumber format similar to Gherkin with scenario outlines when needed.
"""
        }

        prompt = f"""You are an expert QA engineer and test script writer. Your task is to analyze a voice transcript
from a product discussion or requirements gathering session and generate comprehensive test scripts.

TRANSCRIPT CONTENT:
{transcript_data['content']}

FORMAT REQUIRED: {self.test_format.upper()}
{format_instructions.get(self.test_format, '')}

INSTRUCTIONS:
1. Carefully analyze the transcript to identify:
   - Features and functionalities discussed
   - User requirements and expectations
   - Edge cases and error scenarios
   - Acceptance criteria
   - Integration points

2. Generate comprehensive test scripts that cover:
   - Happy path scenarios
   - Negative test cases
   - Edge cases
   - Data validation
   - Error handling

3. Extract and include:
   - Feature title
   - User story (if applicable)
   - Test scenarios
   - Clear preconditions
   - Step-by-step test actions
   - Expected results

4. Make the test scripts:
   - Clear and unambiguous
   - Executable by any QA team member
   - Complete with all necessary details
   - Organized and well-structured

"""

        if additional_context:
            prompt += f"\nADDITIONAL CONTEXT:\n{additional_context}\n"

        prompt += "\nPlease generate the test scripts now."

        return prompt

    def _generate_with_anthropic(self, prompt: str) -> str:
        """Generate test script using Anthropic Claude"""
        message = self.client.messages.create(
            model=self.ai_model,
            max_tokens=4096,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        return message.content[0].text

    def _generate_with_openai(self, prompt: str) -> str:
        """Generate test script using OpenAI"""
        response = self.client.chat.completions.create(
            model=self.ai_model,
            messages=[
                {"role": "system", "content": "You are an expert QA engineer and test script writer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=4096
        )

        return response.choices[0].message.content

    def _parse_response(self, response: str, transcript_data: Dict) -> Dict:
        """Parse and structure the AI response"""
        # Extract title from response or use default
        title = self._extract_title(response) or f"Test Script for {transcript_data['metadata']['filename']}"

        # Extract user story if present
        user_story = self._extract_user_story(response)

        return {
            'title': title,
            'description': user_story or 'Generated from voice transcript',
            'content': response,
            'format': self.test_format,
            'ai_provider': self.ai_provider,
            'ai_model': self.ai_model,
            'transcript_metadata': transcript_data['metadata']
        }

    def _extract_title(self, content: str) -> Optional[str]:
        """Extract title from generated content"""
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            # Look for Feature: or Test Suite: or similar
            if line.startswith('Feature:'):
                return line.replace('Feature:', '').strip()
            if line.startswith('Test Suite:'):
                return line.replace('Test Suite:', '').strip()
            if line.startswith('# '):
                return line.replace('#', '').strip()
        return None

    def _extract_user_story(self, content: str) -> Optional[str]:
        """Extract user story from generated content"""
        # Look for "As a ... I want ... So that ..." pattern
        import re
        match = re.search(r'(As a .+?So that .+?)(?:\n|$)', content, re.DOTALL)
        if match:
            return match.group(1).strip()
        return None

    def generate_batch(self, transcript_files: List[str], additional_context: Optional[str] = None) -> List[Dict]:
        """
        Generate test scripts for multiple transcripts

        Args:
            transcript_files: List of transcript file paths
            additional_context: Optional additional context

        Returns:
            List of generated test scripts
        """
        from transcript_reader import TranscriptReader

        results = []
        for file_path in transcript_files:
            try:
                reader = TranscriptReader(file_path)
                transcript_data = reader.read()
                test_script = self.generate(transcript_data, additional_context)
                test_script['source_file'] = file_path
                results.append(test_script)
            except Exception as e:
                results.append({
                    'source_file': file_path,
                    'error': str(e),
                    'status': 'failed'
                })

        return results


def generate_test_script(transcript_file: str, additional_context: Optional[str] = None) -> Dict:
    """
    Convenience function to generate a test script

    Args:
        transcript_file: Path to transcript file
        additional_context: Optional additional context

    Returns:
        Generated test script data
    """
    from transcript_reader import TranscriptReader

    reader = TranscriptReader(transcript_file)
    transcript_data = reader.read()

    generator = TestScriptGenerator()
    return generator.generate(transcript_data, additional_context)
