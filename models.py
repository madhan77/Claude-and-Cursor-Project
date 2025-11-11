"""
Database models for Voice Transcript Test Builder
"""
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import config

Base = declarative_base()


class Transcript(Base):
    """Model for storing voice transcripts"""
    __tablename__ = 'transcripts'

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_format = Column(String(50))  # txt, vtt, srt, json
    content = Column(Text, nullable=False)
    transcript_metadata = Column(JSON)  # Store additional metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Transcript(id={self.id}, filename='{self.filename}')>"


class TestScript(Base):
    """Model for storing generated test scripts"""
    __tablename__ = 'test_scripts'

    id = Column(Integer, primary_key=True)
    transcript_id = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    script_format = Column(String(50))  # gherkin, pytest, manual
    content = Column(Text, nullable=False)
    ai_provider = Column(String(50))
    ai_model = Column(String(100))

    # Approval workflow
    status = Column(String(50), default='pending')  # pending, approved, rejected
    approved_by = Column(String(255))
    approved_at = Column(DateTime)
    rejection_reason = Column(Text)

    # ServiceNow integration
    servicenow_story_id = Column(String(100))
    servicenow_story_number = Column(String(100))
    servicenow_created_at = Column(DateTime)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<TestScript(id={self.id}, title='{self.title}', status='{self.status}')>"


class ApprovalRequest(Base):
    """Model for tracking approval requests"""
    __tablename__ = 'approval_requests'

    id = Column(Integer, primary_key=True)
    test_script_id = Column(Integer, nullable=False)
    requested_by = Column(String(255))
    requested_at = Column(DateTime, default=datetime.utcnow)

    # Approval token for email links
    approval_token = Column(String(255), unique=True)
    token_expires_at = Column(DateTime)

    # Notification tracking
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime)

    # Response tracking
    responded_at = Column(DateTime)
    response = Column(String(50))  # approved, rejected
    response_note = Column(Text)

    def __repr__(self):
        return f"<ApprovalRequest(id={self.id}, test_script_id={self.test_script_id})>"


# Database setup
def get_engine():
    """Create database engine"""
    return create_engine(config.DATABASE_URL, echo=config.FLASK_ENV == 'development')


def get_session():
    """Get database session"""
    engine = get_engine()
    Session = sessionmaker(bind=engine)
    return Session()


def init_db():
    """Initialize database tables"""
    engine = get_engine()
    Base.metadata.create_all(engine)
    print("Database initialized successfully!")


if __name__ == '__main__':
    init_db()
