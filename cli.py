#!/usr/bin/env python3
"""
Command Line Interface for Voice Transcript Test Builder
"""
import click
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import print as rprint
import json

from config import config, Config
from models import init_db, get_session, Transcript, TestScript
from transcript_reader import TranscriptReader
from test_generator import TestScriptGenerator
from approval_workflow import ApprovalWorkflow
from servicenow_integration import ServiceNowIntegration

console = Console()


@click.group()
@click.version_option(version='1.0.0')
def cli():
    """Voice Transcript Test Builder - Generate test scripts from voice transcripts"""
    # Create necessary directories
    Config.create_directories()


@cli.command()
def init():
    """Initialize the database"""
    try:
        init_db()
        console.print("[green]✓[/green] Database initialized successfully!")
    except Exception as e:
        console.print(f"[red]✗[/red] Error initializing database: {e}")


@cli.command()
@click.argument('transcript_file', type=click.Path(exists=True))
@click.option('--format', '-f', help='Transcript format (auto-detected if not specified)')
@click.option('--context', '-c', help='Additional context for test generation')
@click.option('--output', '-o', type=click.Path(), help='Output file for test script')
@click.option('--auto-approve', is_flag=True, help='Skip approval workflow')
@click.option('--create-story', is_flag=True, help='Create ServiceNow story immediately')
def generate(transcript_file, format, context, output, auto_approve, create_story):
    """Generate test script from a voice transcript"""
    try:
        console.print(f"\n[cyan]Reading transcript:[/cyan] {transcript_file}")

        # Read transcript
        reader = TranscriptReader(transcript_file)
        transcript_data = reader.read()

        console.print(f"[green]✓[/green] Transcript loaded ({transcript_data['format']} format)")
        console.print(f"  Lines: {len(transcript_data['structured_content'])}")

        # Save transcript to database
        session = get_session()
        db_transcript = Transcript(
            filename=Path(transcript_file).name,
            file_path=str(Path(transcript_file).absolute()),
            file_format=transcript_data['format'],
            content=transcript_data['content'],
            metadata=transcript_data['metadata']
        )
        session.add(db_transcript)
        session.commit()

        console.print(f"\n[cyan]Generating test script using {config.AI_PROVIDER}...[/cyan]")

        # Generate test script
        generator = TestScriptGenerator()
        test_script_data = generator.generate(transcript_data, context)

        console.print(f"[green]✓[/green] Test script generated!")
        console.print(f"  Title: {test_script_data['title']}")
        console.print(f"  Format: {test_script_data['format']}")

        # Save test script to database
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

        # Display test script
        console.print(Panel(test_script_data['content'], title="Generated Test Script", border_style="green"))

        # Save to file if specified
        if output:
            output_path = Path(output)
            output_path.write_text(test_script_data['content'])
            console.print(f"\n[green]✓[/green] Test script saved to: {output}")

        # Handle approval workflow
        if not auto_approve and config.APPROVAL_REQUIRED:
            console.print(f"\n[yellow]⚠[/yellow] Approval required")
            workflow = ApprovalWorkflow()
            approval_result = workflow.request_approval(db_test_script.id)

            if approval_result['success']:
                console.print(f"[green]✓[/green] Approval request sent to {config.PRODUCT_OWNER_EMAIL}")
                console.print(f"  Token: {approval_result['approval_token']}")
            else:
                console.print(f"[red]✗[/red] Failed to send approval request: {approval_result.get('error')}")

        # Create ServiceNow story if requested
        if (auto_approve or not config.APPROVAL_REQUIRED) and create_story:
            console.print(f"\n[cyan]Creating ServiceNow user story...[/cyan]")
            snow = ServiceNowIntegration()
            story_result = snow.create_user_story(test_script_data, transcript_data)

            if story_result['success']:
                console.print(f"[green]✓[/green] User story created!")
                console.print(f"  Story ID: {story_result['story_number']}")
                console.print(f"  Link: {story_result['story_link']}")

                # Update database
                db_test_script.servicenow_story_id = story_result['story_id']
                db_test_script.servicenow_story_number = story_result['story_number']
                session.commit()
            else:
                console.print(f"[red]✗[/red] Failed to create story: {story_result.get('error')}")

        console.print(f"\n[green]✓[/green] Test script ID: {db_test_script.id}")

        session.close()

    except Exception as e:
        console.print(f"[red]✗[/red] Error: {e}")
        raise


@cli.command()
@click.option('--status', '-s', help='Filter by status (pending, approved, rejected)')
@click.option('--limit', '-l', default=10, help='Number of records to show')
def list(status, limit):
    """List generated test scripts"""
    session = get_session()

    query = session.query(TestScript)

    if status:
        query = query.filter_by(status=status)

    scripts = query.order_by(TestScript.created_at.desc()).limit(limit).all()

    if not scripts:
        console.print("[yellow]No test scripts found[/yellow]")
        return

    table = Table(title=f"Test Scripts ({len(scripts)})")
    table.add_column("ID", style="cyan")
    table.add_column("Title", style="white")
    table.add_column("Format", style="blue")
    table.add_column("Status", style="yellow")
    table.add_column("Created", style="green")
    table.add_column("ServiceNow", style="magenta")

    for script in scripts:
        status_color = {
            'pending': 'yellow',
            'approved': 'green',
            'rejected': 'red'
        }.get(script.status, 'white')

        table.add_row(
            str(script.id),
            script.title[:50],
            script.script_format,
            f"[{status_color}]{script.status}[/{status_color}]",
            script.created_at.strftime('%Y-%m-%d %H:%M'),
            script.servicenow_story_number or '-'
        )

    console.print(table)
    session.close()


@cli.command()
@click.argument('test_script_id', type=int)
def view(test_script_id):
    """View a test script"""
    session = get_session()

    script = session.query(TestScript).filter_by(id=test_script_id).first()

    if not script:
        console.print(f"[red]✗[/red] Test script {test_script_id} not found")
        return

    console.print(Panel(f"""
[cyan]ID:[/cyan] {script.id}
[cyan]Title:[/cyan] {script.title}
[cyan]Format:[/cyan] {script.script_format}
[cyan]Status:[/cyan] {script.status}
[cyan]Created:[/cyan] {script.created_at}
[cyan]AI Model:[/cyan] {script.ai_model}
{f'[cyan]ServiceNow:[/cyan] {script.servicenow_story_number}' if script.servicenow_story_number else ''}
""", title="Test Script Details", border_style="blue"))

    console.print(Panel(script.content, title="Content", border_style="green"))

    session.close()


@cli.command()
@click.argument('test_script_id', type=int)
@click.option('--approve/--reject', default=True, help='Approve or reject')
@click.option('--note', '-n', help='Approval note')
def approve(test_script_id, approve, note):
    """Approve or reject a test script"""
    session = get_session()

    script = session.query(TestScript).filter_by(id=test_script_id).first()

    if not script:
        console.print(f"[red]✗[/red] Test script {test_script_id} not found")
        return

    if approve:
        script.status = 'approved'
        script.approved_at = script.updated_at
        script.approved_by = 'cli'
        console.print(f"[green]✓[/green] Test script approved")
    else:
        script.status = 'rejected'
        script.rejection_reason = note
        console.print(f"[yellow]✓[/yellow] Test script rejected")

    session.commit()

    # Create ServiceNow story if approved
    if approve and config.AUTO_CREATE_STORY_ON_APPROVAL:
        console.print(f"\n[cyan]Creating ServiceNow user story...[/cyan]")

        # Get transcript
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
            console.print(f"[green]✓[/green] User story created!")
            console.print(f"  Story ID: {story_result['story_number']}")
            console.print(f"  Link: {story_result['story_link']}")

            script.servicenow_story_id = story_result['story_id']
            script.servicenow_story_number = story_result['story_number']
            session.commit()
        else:
            console.print(f"[red]✗[/red] Failed to create story: {story_result.get('error')}")

    session.close()


@cli.command()
def config_check():
    """Check configuration"""
    errors = Config.validate()

    if errors:
        console.print("[red]Configuration Errors:[/red]")
        for error in errors:
            console.print(f"  [red]✗[/red] {error}")
    else:
        console.print("[green]✓[/green] Configuration is valid")

    console.print(f"\n[cyan]Current Configuration:[/cyan]")
    console.print(f"  AI Provider: {config.AI_PROVIDER}")
    console.print(f"  AI Model: {config.AI_MODEL}")
    console.print(f"  Test Format: {config.TEST_SCRIPT_FORMAT}")
    console.print(f"  ServiceNow Instance: {config.SERVICENOW_INSTANCE}")
    console.print(f"  Approval Required: {config.APPROVAL_REQUIRED}")


if __name__ == '__main__':
    cli()
