"""
Flask Web Application for Voice Transcript Test Builder
Provides web interface for managing transcripts, test scripts, and approvals
"""
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pathlib import Path
import os

from config import config, Config
from models import init_db, get_session, Transcript, TestScript, ApprovalRequest
from transcript_reader import TranscriptReader
from test_generator import TestScriptGenerator
from approval_workflow import ApprovalWorkflow
from servicenow_integration import ServiceNowIntegration

# Initialize Flask app
app = Flask(__name__)
app.secret_key = config.FLASK_SECRET_KEY
CORS(app)

# Create necessary directories
Config.create_directories()

# Allowed file extensions
ALLOWED_EXTENSIONS = {'txt', 'vtt', 'srt', 'json'}


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/')
def index():
    """Home page"""
    session = get_session()

    # Get statistics
    total_transcripts = session.query(Transcript).count()
    total_scripts = session.query(TestScript).count()
    pending_approvals = session.query(TestScript).filter_by(status='pending').count()
    approved_scripts = session.query(TestScript).filter_by(status='approved').count()

    # Get recent test scripts
    recent_scripts = session.query(TestScript).order_by(
        TestScript.created_at.desc()
    ).limit(5).all()

    session.close()

    return jsonify({
        'app_name': config.APP_NAME,
        'statistics': {
            'total_transcripts': total_transcripts,
            'total_scripts': total_scripts,
            'pending_approvals': pending_approvals,
            'approved_scripts': approved_scripts
        },
        'recent_scripts': [
            {
                'id': script.id,
                'title': script.title,
                'status': script.status,
                'created_at': script.created_at.isoformat(),
                'format': script.script_format
            }
            for script in recent_scripts
        ]
    })


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    """Upload and process a transcript"""
    if request.method == 'POST':
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({'error': f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

        try:
            # Save file
            filename = secure_filename(file.filename)
            filepath = config.UPLOAD_DIR / filename
            file.save(filepath)

            # Get additional parameters
            additional_context = request.form.get('context', '')
            auto_approve = request.form.get('auto_approve') == 'true'
            create_story = request.form.get('create_story') == 'true'

            # Read transcript
            reader = TranscriptReader(str(filepath))
            transcript_data = reader.read()

            # Save to database
            session = get_session()
            db_transcript = Transcript(
                filename=filename,
                file_path=str(filepath),
                file_format=transcript_data['format'],
                content=transcript_data['content'],
                metadata=transcript_data['metadata']
            )
            session.add(db_transcript)
            session.commit()

            # Generate test script
            generator = TestScriptGenerator()
            test_script_data = generator.generate(transcript_data, additional_context)

            # Save test script
            db_test_script = TestScript(
                transcript_id=db_transcript.id,
                title=test_script_data['title'],
                description=test_script_data['description'],
                script_format=test_script_data['format'],
                content=test_script_data['content'],
                ai_provider=test_script_data['ai_provider'],
                ai_model=test_script_data['ai_model'],
                status='approved' if auto_approve else 'pending'
            )

            if auto_approve:
                db_test_script.approved_at = db_test_script.created_at
                db_test_script.approved_by = 'auto'

            session.add(db_test_script)
            session.commit()

            result = {
                'success': True,
                'transcript_id': db_transcript.id,
                'test_script_id': db_test_script.id,
                'test_script': {
                    'title': test_script_data['title'],
                    'format': test_script_data['format'],
                    'content': test_script_data['content']
                }
            }

            # Handle approval workflow
            if not auto_approve and config.APPROVAL_REQUIRED:
                workflow = ApprovalWorkflow()
                approval_result = workflow.request_approval(db_test_script.id)
                result['approval_request'] = approval_result

            # Create ServiceNow story if requested
            if (auto_approve or not config.APPROVAL_REQUIRED) and create_story:
                snow = ServiceNowIntegration()
                story_result = snow.create_user_story(test_script_data, transcript_data)
                result['servicenow_story'] = story_result

                if story_result['success']:
                    db_test_script.servicenow_story_id = story_result['story_id']
                    db_test_script.servicenow_story_number = story_result['story_number']
                    session.commit()

            session.close()
            return jsonify(result), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    return jsonify({'message': 'Upload endpoint ready', 'allowed_extensions': list(ALLOWED_EXTENSIONS)})


@app.route('/test-scripts')
def list_scripts():
    """List all test scripts"""
    session = get_session()

    status_filter = request.args.get('status')
    limit = int(request.args.get('limit', 50))

    query = session.query(TestScript)

    if status_filter:
        query = query.filter_by(status=status_filter)

    scripts = query.order_by(TestScript.created_at.desc()).limit(limit).all()

    result = [
        {
            'id': script.id,
            'title': script.title,
            'description': script.description,
            'format': script.script_format,
            'status': script.status,
            'created_at': script.created_at.isoformat(),
            'approved_at': script.approved_at.isoformat() if script.approved_at else None,
            'servicenow_story_number': script.servicenow_story_number
        }
        for script in scripts
    ]

    session.close()
    return jsonify(result)


@app.route('/test-script/<int:script_id>')
def view_script(script_id):
    """View a specific test script"""
    session = get_session()

    script = session.query(TestScript).filter_by(id=script_id).first()

    if not script:
        return jsonify({'error': 'Test script not found'}), 404

    result = {
        'id': script.id,
        'title': script.title,
        'description': script.description,
        'format': script.script_format,
        'content': script.content,
        'status': script.status,
        'created_at': script.created_at.isoformat(),
        'approved_at': script.approved_at.isoformat() if script.approved_at else None,
        'approved_by': script.approved_by,
        'rejection_reason': script.rejection_reason,
        'servicenow_story_id': script.servicenow_story_id,
        'servicenow_story_number': script.servicenow_story_number,
        'ai_provider': script.ai_provider,
        'ai_model': script.ai_model
    }

    session.close()
    return jsonify(result)


@app.route('/approve/<token>')
def approve_with_token(token):
    """Handle approval via token (from email link)"""
    action = request.args.get('action', 'view')

    session = get_session()

    # Find approval request
    approval_request = session.query(ApprovalRequest).filter_by(
        approval_token=token
    ).first()

    if not approval_request:
        return jsonify({'error': 'Invalid approval token'}), 404

    # Check if expired
    from datetime import datetime
    if approval_request.token_expires_at < datetime.utcnow():
        return jsonify({'error': 'Approval token has expired'}), 403

    # Get test script
    test_script = session.query(TestScript).filter_by(
        id=approval_request.test_script_id
    ).first()

    if not test_script:
        return jsonify({'error': 'Test script not found'}), 404

    if action == 'view':
        # Just return the test script for review
        result = {
            'test_script': {
                'id': test_script.id,
                'title': test_script.title,
                'description': test_script.description,
                'content': test_script.content,
                'format': test_script.script_format,
                'created_at': test_script.created_at.isoformat()
            },
            'approval_request': {
                'id': approval_request.id,
                'requested_at': approval_request.requested_at.isoformat(),
                'expires_at': approval_request.token_expires_at.isoformat()
            },
            'actions': {
                'approve': f'/approve/{token}?action=approve',
                'reject': f'/approve/{token}?action=reject'
            }
        }
        session.close()
        return jsonify(result)

    elif action in ['approve', 'reject']:
        # Process approval/rejection
        workflow = ApprovalWorkflow()
        note = request.args.get('note', '')

        result = workflow.process_approval(
            token=token,
            approved=(action == 'approve'),
            note=note
        )

        session.close()
        return jsonify(result)

    session.close()
    return jsonify({'error': 'Invalid action'}), 400


@app.route('/approve-script/<int:script_id>', methods=['POST'])
def approve_script(script_id):
    """Approve or reject a test script"""
    data = request.get_json()
    approved = data.get('approved', True)
    note = data.get('note', '')

    session = get_session()

    script = session.query(TestScript).filter_by(id=script_id).first()

    if not script:
        return jsonify({'error': 'Test script not found'}), 404

    from datetime import datetime

    if approved:
        script.status = 'approved'
        script.approved_at = datetime.utcnow()
        script.approved_by = data.get('approved_by', 'web')
    else:
        script.status = 'rejected'
        script.rejection_reason = note

    session.commit()

    result = {'success': True, 'status': script.status}

    # Create ServiceNow story if approved and auto-create is enabled
    if approved and config.AUTO_CREATE_STORY_ON_APPROVAL:
        transcript = session.query(Transcript).filter_by(id=script.transcript_id).first()

        snow = ServiceNowIntegration()
        story_result = snow.create_user_story(
            {
                'title': script.title,
                'description': script.description,
                'content': script.content,
                'format': script.script_format
            },
            {
                'content': transcript.content,
                'metadata': transcript.metadata,
                'format': transcript.file_format
            } if transcript else None
        )

        if story_result['success']:
            script.servicenow_story_id = story_result['story_id']
            script.servicenow_story_number = story_result['story_number']
            session.commit()

        result['servicenow_story'] = story_result

    session.close()
    return jsonify(result)


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'app': config.APP_NAME,
        'ai_provider': config.AI_PROVIDER,
        'database': 'connected'
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Initialize database if it doesn't exist
    if not Path(config.DATABASE_URL.replace('sqlite:///', '')).exists():
        init_db()

    # Run the app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=(config.FLASK_ENV == 'development')
    )
