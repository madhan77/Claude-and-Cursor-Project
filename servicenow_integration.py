"""
ServiceNow Integration Module
Handles creation of user stories in ServiceNow
"""
import requests
from datetime import datetime
from typing import Dict, Optional
import pysnow
from config import config


class ServiceNowIntegration:
    """Integrates with ServiceNow to create user stories"""

    def __init__(self):
        """Initialize ServiceNow client"""
        self.instance = config.SERVICENOW_INSTANCE

        # Initialize pysnow client
        if config.SERVICENOW_USERNAME and config.SERVICENOW_PASSWORD:
            self.client = pysnow.Client(
                instance=self.instance,
                user=config.SERVICENOW_USERNAME,
                password=config.SERVICENOW_PASSWORD
            )
        elif config.SERVICENOW_CLIENT_ID and config.SERVICENOW_CLIENT_SECRET:
            # OAuth authentication
            self.client = pysnow.OAuthClient(
                client_id=config.SERVICENOW_CLIENT_ID,
                client_secret=config.SERVICENOW_CLIENT_SECRET,
                instance=self.instance
            )
        else:
            raise ValueError("ServiceNow credentials not configured")

    def create_user_story(self, test_script: Dict, transcript_data: Optional[Dict] = None) -> Dict:
        """
        Create a user story in ServiceNow

        Args:
            test_script: Generated test script data
            transcript_data: Original transcript data

        Returns:
            Dict with created story information
        """
        # Prepare story data
        story_data = self._prepare_story_data(test_script, transcript_data)

        # Create the story in ServiceNow
        # Using the story table (rm_story)
        story_resource = self.client.resource(api_path='/table/rm_story')

        try:
            result = story_resource.create(payload=story_data)

            return {
                'success': True,
                'story_id': result['sys_id'],
                'story_number': result.get('number'),
                'story_link': f"https://{self.instance}/rm_story.do?sys_id={result['sys_id']}",
                'created_at': datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def _prepare_story_data(self, test_script: Dict, transcript_data: Optional[Dict] = None) -> Dict:
        """
        Prepare story data for ServiceNow

        Args:
            test_script: Generated test script
            transcript_data: Original transcript data

        Returns:
            Dict formatted for ServiceNow API
        """
        # Extract key information
        title = test_script.get('title', 'User Story from Voice Transcript')
        description = test_script.get('description', '')

        # Build the story description
        story_description = f"{description}\n\n"
        story_description += "=== TEST SCRIPT ===\n"
        story_description += test_script.get('content', '')

        if transcript_data:
            story_description += "\n\n=== SOURCE TRANSCRIPT ===\n"
            story_description += f"File: {transcript_data['metadata']['filename']}\n"
            story_description += f"Format: {transcript_data['format']}\n"

        # Prepare ServiceNow fields
        # Note: Field names may vary based on your ServiceNow configuration
        story_data = {
            'short_description': title[:160],  # ServiceNow short_description has length limit
            'description': story_description,
            'state': 'draft',  # or 'new', depending on your workflow
            'priority': '3',  # Medium priority
            'category': 'feature',  # or appropriate category
        }

        # Add custom fields if needed
        if transcript_data:
            story_data['u_source'] = 'Voice Transcript'
            story_data['u_transcript_file'] = transcript_data['metadata']['filename']

        story_data['u_test_format'] = test_script.get('format', 'gherkin')
        story_data['u_ai_generated'] = 'true'

        return story_data

    def update_user_story(self, story_id: str, updates: Dict) -> Dict:
        """
        Update an existing user story

        Args:
            story_id: ServiceNow sys_id of the story
            updates: Fields to update

        Returns:
            Dict with update result
        """
        story_resource = self.client.resource(api_path='/table/rm_story')

        try:
            result = story_resource.update(
                query={'sys_id': story_id},
                payload=updates
            )

            return {
                'success': True,
                'story_id': story_id,
                'updated_at': datetime.utcnow().isoformat()
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_user_story(self, story_id: str) -> Dict:
        """
        Retrieve a user story from ServiceNow

        Args:
            story_id: ServiceNow sys_id of the story

        Returns:
            Dict with story data
        """
        story_resource = self.client.resource(api_path='/table/rm_story')

        try:
            result = story_resource.get(query={'sys_id': story_id}).one()

            return {
                'success': True,
                'story': result
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def attach_file(self, story_id: str, file_path: str, file_name: Optional[str] = None) -> Dict:
        """
        Attach a file to a user story

        Args:
            story_id: ServiceNow sys_id of the story
            file_path: Path to file to attach
            file_name: Optional custom file name

        Returns:
            Dict with attachment result
        """
        if not file_name:
            from pathlib import Path
            file_name = Path(file_path).name

        # ServiceNow attachment API
        attachment_url = f"https://{self.instance}/api/now/attachment/upload"

        headers = {
            'Accept': 'application/json',
        }

        params = {
            'table_name': 'rm_story',
            'table_sys_id': story_id,
            'file_name': file_name
        }

        try:
            with open(file_path, 'rb') as f:
                response = requests.post(
                    attachment_url,
                    auth=(config.SERVICENOW_USERNAME, config.SERVICENOW_PASSWORD),
                    headers=headers,
                    params=params,
                    data=f
                )

            response.raise_for_status()

            return {
                'success': True,
                'attachment': response.json()['result']
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def create_test_cases(self, story_id: str, test_script: Dict) -> Dict:
        """
        Create test cases in ServiceNow linked to the user story

        Args:
            story_id: ServiceNow sys_id of the story
            test_script: Generated test script data

        Returns:
            Dict with created test case information
        """
        # This would create actual test case records in ServiceNow
        # Implementation depends on your ServiceNow test management setup

        test_resource = self.client.resource(api_path='/table/sn_atf_test')

        # Parse test script to extract individual test cases
        test_cases = self._parse_test_cases(test_script)

        created_tests = []

        for test_case in test_cases:
            try:
                test_data = {
                    'name': test_case['name'],
                    'description': test_case['description'],
                    'test_script': test_case['script'],
                    'story': story_id
                }

                result = test_resource.create(payload=test_data)
                created_tests.append({
                    'test_id': result['sys_id'],
                    'test_name': test_case['name']
                })

            except Exception as e:
                created_tests.append({
                    'test_name': test_case['name'],
                    'error': str(e),
                    'success': False
                })

        return {
            'success': len([t for t in created_tests if 'error' not in t]) > 0,
            'created_tests': created_tests
        }

    def _parse_test_cases(self, test_script: Dict) -> list:
        """
        Parse test script to extract individual test cases

        Args:
            test_script: Generated test script

        Returns:
            List of test case dicts
        """
        # This is a simplified parser
        # You might need more sophisticated parsing based on your format

        content = test_script.get('content', '')
        test_format = test_script.get('format', 'gherkin')

        test_cases = []

        if test_format == 'gherkin' or test_format == 'cucumber':
            # Split by Scenario
            scenarios = content.split('Scenario:')
            for i, scenario in enumerate(scenarios[1:], 1):  # Skip first split (before first Scenario)
                lines = scenario.strip().split('\n')
                name = lines[0].strip() if lines else f'Test Case {i}'
                test_cases.append({
                    'name': name,
                    'description': f'Scenario: {name}',
                    'script': f'Scenario: {scenario.strip()}'
                })

        else:
            # For other formats, create a single test case
            test_cases.append({
                'name': test_script.get('title', 'Generated Test'),
                'description': test_script.get('description', ''),
                'script': content
            })

        return test_cases


def create_story_from_test_script(test_script: Dict, transcript_data: Optional[Dict] = None) -> Dict:
    """
    Convenience function to create a ServiceNow user story

    Args:
        test_script: Generated test script
        transcript_data: Original transcript data

    Returns:
        Created story information
    """
    integration = ServiceNowIntegration()
    return integration.create_user_story(test_script, transcript_data)
