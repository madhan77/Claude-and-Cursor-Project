"""
Approval Workflow Module
Handles approval requests and notifications for generated test scripts
"""
import secrets
from datetime import datetime, timedelta
from typing import Dict, Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from config import config
from models import TestScript, ApprovalRequest, get_session


class ApprovalWorkflow:
    """Manages approval workflow for test scripts"""

    def __init__(self):
        """Initialize approval workflow"""
        self.email_client = None
        if config.SENDGRID_API_KEY:
            self.email_client = SendGridAPIClient(config.SENDGRID_API_KEY)

    def request_approval(self, test_script_id: int, requested_by: str = 'system') -> Dict:
        """
        Request approval for a test script

        Args:
            test_script_id: ID of the test script
            requested_by: Who requested the approval

        Returns:
            Dict with approval request information
        """
        session = get_session()

        try:
            # Check if test script exists
            test_script = session.query(TestScript).filter_by(id=test_script_id).first()
            if not test_script:
                return {
                    'success': False,
                    'error': 'Test script not found'
                }

            # Generate approval token
            token = secrets.token_urlsafe(32)
            expires_at = datetime.utcnow() + timedelta(days=7)  # Token valid for 7 days

            # Create approval request
            approval_request = ApprovalRequest(
                test_script_id=test_script_id,
                requested_by=requested_by,
                approval_token=token,
                token_expires_at=expires_at
            )

            session.add(approval_request)
            session.commit()

            # Send notification email
            email_result = self._send_approval_email(test_script, approval_request)

            if email_result['success']:
                approval_request.email_sent = True
                approval_request.email_sent_at = datetime.utcnow()
                session.commit()

            return {
                'success': True,
                'approval_request_id': approval_request.id,
                'approval_token': token,
                'expires_at': expires_at.isoformat(),
                'email_sent': email_result['success']
            }

        except Exception as e:
            session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            session.close()

    def process_approval(self, token: str, approved: bool, note: Optional[str] = None) -> Dict:
        """
        Process an approval response

        Args:
            token: Approval token
            approved: Whether the test script was approved
            note: Optional note from approver

        Returns:
            Dict with processing result
        """
        session = get_session()

        try:
            # Find approval request by token
            approval_request = session.query(ApprovalRequest).filter_by(
                approval_token=token
            ).first()

            if not approval_request:
                return {
                    'success': False,
                    'error': 'Invalid approval token'
                }

            # Check if token is expired
            if approval_request.token_expires_at < datetime.utcnow():
                return {
                    'success': False,
                    'error': 'Approval token has expired'
                }

            # Check if already responded
            if approval_request.responded_at:
                return {
                    'success': False,
                    'error': 'This approval request has already been processed'
                }

            # Update approval request
            approval_request.responded_at = datetime.utcnow()
            approval_request.response = 'approved' if approved else 'rejected'
            approval_request.response_note = note

            # Update test script status
            test_script = session.query(TestScript).filter_by(
                id=approval_request.test_script_id
            ).first()

            if test_script:
                if approved:
                    test_script.status = 'approved'
                    test_script.approved_at = datetime.utcnow()
                    test_script.approved_by = config.PRODUCT_OWNER_EMAIL
                else:
                    test_script.status = 'rejected'
                    test_script.rejection_reason = note

            session.commit()

            # If approved and auto-create is enabled, create ServiceNow story
            story_result = None
            if approved and config.AUTO_CREATE_STORY_ON_APPROVAL:
                story_result = self._create_servicenow_story(test_script)

            return {
                'success': True,
                'test_script_id': test_script.id,
                'status': test_script.status,
                'servicenow_story': story_result
            }

        except Exception as e:
            session.rollback()
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            session.close()

    def _send_approval_email(self, test_script: TestScript, approval_request: ApprovalRequest) -> Dict:
        """
        Send approval request email to product owner

        Args:
            test_script: The test script to approve
            approval_request: The approval request

        Returns:
            Dict with email send result
        """
        if not self.email_client:
            return {
                'success': False,
                'error': 'Email client not configured'
            }

        if not config.PRODUCT_OWNER_EMAIL:
            return {
                'success': False,
                'error': 'Product owner email not configured'
            }

        # Build approval URLs (assuming web app is running)
        base_url = "http://localhost:5000"  # You might want to make this configurable
        approve_url = f"{base_url}/approve/{approval_request.approval_token}?action=approve"
        reject_url = f"{base_url}/approve/{approval_request.approval_token}?action=reject"

        # Email content
        subject = f"Approval Required: {test_script.title}"

        html_content = f"""
        <html>
        <body>
            <h2>Test Script Approval Request</h2>

            <p>A new test script has been generated and requires your approval.</p>

            <h3>Test Script Details:</h3>
            <ul>
                <li><strong>Title:</strong> {test_script.title}</li>
                <li><strong>Format:</strong> {test_script.script_format}</li>
                <li><strong>Generated:</strong> {test_script.created_at}</li>
                <li><strong>AI Model:</strong> {test_script.ai_model}</li>
            </ul>

            <h3>Description:</h3>
            <p>{test_script.description}</p>

            <h3>Test Script Preview:</h3>
            <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
{test_script.content[:500]}...
            </pre>

            <h3>Actions:</h3>
            <p>
                <a href="{approve_url}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Approve
                </a>
                &nbsp;&nbsp;
                <a href="{reject_url}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Reject
                </a>
            </p>

            <p>Or review the full details at: <a href="{base_url}/test-script/{test_script.id}">{base_url}/test-script/{test_script.id}</a></p>

            <p><small>This link will expire on {approval_request.token_expires_at.strftime('%Y-%m-%d %H:%M UTC')}</small></p>
        </body>
        </html>
        """

        try:
            message = Mail(
                from_email=config.NOTIFICATION_EMAIL_FROM,
                to_emails=config.PRODUCT_OWNER_EMAIL,
                subject=subject,
                html_content=html_content
            )

            response = self.email_client.send(message)

            return {
                'success': True,
                'status_code': response.status_code
            }

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def _create_servicenow_story(self, test_script: TestScript) -> Optional[Dict]:
        """
        Create ServiceNow user story after approval

        Args:
            test_script: Approved test script

        Returns:
            ServiceNow creation result
        """
        try:
            from servicenow_integration import ServiceNowIntegration
            from models import Transcript

            session = get_session()

            # Get original transcript data
            transcript = session.query(Transcript).filter_by(
                id=test_script.transcript_id
            ).first()

            transcript_data = None
            if transcript:
                transcript_data = {
                    'content': transcript.content,
                    'metadata': transcript.metadata,
                    'format': transcript.file_format
                }

            # Create ServiceNow story
            snow = ServiceNowIntegration()
            result = snow.create_user_story(
                test_script={
                    'title': test_script.title,
                    'description': test_script.description,
                    'content': test_script.content,
                    'format': test_script.script_format
                },
                transcript_data=transcript_data
            )

            if result['success']:
                # Update test script with ServiceNow info
                test_script.servicenow_story_id = result['story_id']
                test_script.servicenow_story_number = result.get('story_number')
                test_script.servicenow_created_at = datetime.utcnow()
                session.commit()

            session.close()
            return result

        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def get_approval_status(self, test_script_id: int) -> Dict:
        """
        Get approval status for a test script

        Args:
            test_script_id: ID of the test script

        Returns:
            Dict with approval status
        """
        session = get_session()

        try:
            test_script = session.query(TestScript).filter_by(id=test_script_id).first()

            if not test_script:
                return {
                    'success': False,
                    'error': 'Test script not found'
                }

            approval_requests = session.query(ApprovalRequest).filter_by(
                test_script_id=test_script_id
            ).order_by(ApprovalRequest.requested_at.desc()).all()

            return {
                'success': True,
                'test_script_id': test_script_id,
                'status': test_script.status,
                'approved_at': test_script.approved_at.isoformat() if test_script.approved_at else None,
                'approved_by': test_script.approved_by,
                'rejection_reason': test_script.rejection_reason,
                'approval_requests': [
                    {
                        'id': req.id,
                        'requested_at': req.requested_at.isoformat(),
                        'email_sent': req.email_sent,
                        'responded_at': req.responded_at.isoformat() if req.responded_at else None,
                        'response': req.response
                    }
                    for req in approval_requests
                ]
            }

        finally:
            session.close()


def request_test_script_approval(test_script_id: int) -> Dict:
    """
    Convenience function to request approval

    Args:
        test_script_id: ID of test script

    Returns:
        Approval request result
    """
    workflow = ApprovalWorkflow()
    return workflow.request_approval(test_script_id)
