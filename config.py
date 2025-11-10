"""
Configuration management for Voice Transcript Test Builder
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""

    # Application Settings
    APP_NAME = os.getenv('APP_NAME', 'Voice Transcript Test Builder')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./app.db')

    # AI/LLM Settings
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    AI_PROVIDER = os.getenv('AI_PROVIDER', 'anthropic')  # anthropic or openai
    AI_MODEL = os.getenv('AI_MODEL', 'claude-3-5-sonnet-20241022')

    # ServiceNow Settings
    SERVICENOW_INSTANCE = os.getenv('SERVICENOW_INSTANCE')
    SERVICENOW_USERNAME = os.getenv('SERVICENOW_USERNAME')
    SERVICENOW_PASSWORD = os.getenv('SERVICENOW_PASSWORD')
    SERVICENOW_CLIENT_ID = os.getenv('SERVICENOW_CLIENT_ID')
    SERVICENOW_CLIENT_SECRET = os.getenv('SERVICENOW_CLIENT_SECRET')

    # Email Settings
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
    NOTIFICATION_EMAIL_FROM = os.getenv('NOTIFICATION_EMAIL_FROM', 'noreply@example.com')
    PRODUCT_OWNER_EMAIL = os.getenv('PRODUCT_OWNER_EMAIL')

    # Approval Settings
    APPROVAL_REQUIRED = os.getenv('APPROVAL_REQUIRED', 'true').lower() == 'true'
    AUTO_CREATE_STORY_ON_APPROVAL = os.getenv('AUTO_CREATE_STORY_ON_APPROVAL', 'true').lower() == 'true'

    # Test Script Settings
    TEST_SCRIPT_FORMAT = os.getenv('TEST_SCRIPT_FORMAT', 'gherkin')
    # Supported formats: gherkin, pytest, manual, cucumber

    # Directories
    BASE_DIR = Path(__file__).parent
    UPLOAD_DIR = BASE_DIR / 'uploads'
    OUTPUT_DIR = BASE_DIR / 'outputs'
    TEMPLATES_DIR = BASE_DIR / 'templates'

    @classmethod
    def validate(cls):
        """Validate required configuration"""
        errors = []

        # Check AI provider settings
        if cls.AI_PROVIDER == 'anthropic' and not cls.ANTHROPIC_API_KEY:
            errors.append("ANTHROPIC_API_KEY is required when using Anthropic")
        elif cls.AI_PROVIDER == 'openai' and not cls.OPENAI_API_KEY:
            errors.append("OPENAI_API_KEY is required when using OpenAI")

        # Check ServiceNow settings
        if not cls.SERVICENOW_INSTANCE:
            errors.append("SERVICENOW_INSTANCE is required")

        if not (cls.SERVICENOW_USERNAME and cls.SERVICENOW_PASSWORD) and \
           not (cls.SERVICENOW_CLIENT_ID and cls.SERVICENOW_CLIENT_SECRET):
            errors.append("ServiceNow credentials are required (username/password or client_id/client_secret)")

        return errors

    @classmethod
    def create_directories(cls):
        """Create necessary directories"""
        cls.UPLOAD_DIR.mkdir(exist_ok=True)
        cls.OUTPUT_DIR.mkdir(exist_ok=True)
        cls.TEMPLATES_DIR.mkdir(exist_ok=True)


config = Config()
