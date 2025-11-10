# Voice Transcript Test Builder - Demo Output

This document shows what the application generates from voice transcripts.

## Input: Sample Transcript (TXT Format)

```
Product Owner: We need to implement a secure login system with email and password.
Developer: What are the requirements?
Product Owner: Users should be able to register, login, reset password, and logout.
QA Lead: What about password requirements?
Product Owner: Passwords must be at least 8 characters long, contain uppercase, lowercase, number, and special character.
...
```

## Output: Generated Test Script (Gherkin/BDD Format)

```gherkin
Feature: User Authentication System
  As a mobile app user
  I want to securely login with email and password
  So that I can access my account safely

  Background:
    Given the mobile app is installed and running
    And the authentication service is available

  Scenario: Successful user registration
    Given I am on the registration page
    When I enter a valid email address "user@example.com"
    And I enter a password "SecurePass123!"
    And I confirm the password "SecurePass123!"
    And I click the register button
    Then I should receive a verification email
    And the system should display "Please check your email to verify your account"

  Scenario: Email verification required before login
    Given I have registered but not verified my email
    When I attempt to login with my credentials
    Then I should see an error "Please verify your email before logging in"
    And I should not be granted access

  Scenario: Successful login with valid credentials
    Given I have a verified account
    And I am on the login page
    When I enter my email "user@example.com"
    And I enter my password "SecurePass123!"
    And I click the login button
    Then I should be successfully logged in
    And I should be redirected to the dashboard
    And the session should be created with 24 hours expiry

  Scenario: Login with Remember Me option
    Given I am on the login page
    When I enter valid credentials
    And I check the "Remember Me" checkbox
    And I click the login button
    Then I should be logged in
    And my session should remain active for 30 days

  Scenario: Failed login with invalid email
    Given I am on the login page
    When I enter an email that doesn't exist "nonexistent@example.com"
    And I enter any password
    And I click the login button
    Then I should see the error "Invalid email or password"
    And I should remain on the login page

  Scenario: Failed login with incorrect password
    Given I am on the login page
    And I have a valid account
    When I enter my correct email
    And I enter an incorrect password
    And I click the login button
    Then I should see the error "Invalid email or password"
    And the system should not reveal which field was wrong

  Scenario: Account lockout after multiple failed attempts
    Given I have a valid account
    And I am on the login page
    When I attempt to login with wrong password 5 times
    Then my account should be locked
    And I should see "Account locked due to multiple failed login attempts. Try again in 30 minutes"
    And subsequent login attempts should be blocked for 30 minutes

  Scenario: Password reset request
    Given I am on the login page
    When I click "Forgot Password?"
    And I enter my registered email
    And I click "Send Reset Link"
    Then I should receive a password reset email
    And the reset link should expire after 24 hours
    And I should see "Password reset link sent to your email"

  Scenario: Password reset with valid link
    Given I have requested a password reset
    And I click the reset link within 24 hours
    When I enter a new password "NewSecure456!"
    And I confirm the new password "NewSecure456!"
    And I click "Reset Password"
    Then my password should be updated
    And I should see "Password successfully reset"
    And I should be able to login with the new password

  Scenario: Password reset with expired link
    Given I have requested a password reset
    And the reset link has expired (>24 hours)
    When I click the expired reset link
    Then I should see "This reset link has expired"
    And I should be prompted to request a new link

  Scenario: Registration with weak password
    Given I am on the registration page
    When I enter an email "user@example.com"
    And I enter a weak password "pass"
    And I click register
    Then I should see "Password doesn't meet requirements"
    And I should see password rules:
      | Rule                          |
      | At least 8 characters long    |
      | Contains uppercase letter     |
      | Contains lowercase letter     |
      | Contains number               |
      | Contains special character    |

  Scenario: Registration with existing email
    Given an account already exists with email "existing@example.com"
    When I try to register with the same email
    Then I should see "Email already exists"
    And registration should be prevented

  Scenario: Session timeout after inactivity
    Given I am logged in
    When 24 hours of inactivity pass
    And I try to access a protected page
    Then my session should expire
    And I should be redirected to the login page
    And I should see "Your session has expired. Please login again"

  Scenario: Successful logout
    Given I am logged in
    When I click the logout button
    Then I should be logged out
    And my session should be destroyed
    And I should be redirected to the login page
    And I should not be able to access protected pages

  Scenario: UI validation - inline error display
    Given I am on the registration page
    When I enter an invalid email format "notanemail"
    And I move focus to the next field
    Then I should see inline validation error "Please enter a valid email"
    And the error should display in real-time as I type

  Scenario: Security - SQL injection attempt
    Given I am on the login page
    When I enter SQL injection payload in email field "' OR '1'='1"
    And I enter any password
    And I click login
    Then the system should safely handle the input
    And I should see "Invalid email or password"
    And no data breach should occur

  Scenario: Security - XSS attack prevention
    Given I am on the registration page
    When I enter XSS payload in name field "<script>alert('xss')</script>"
    And I submit the form
    Then the input should be sanitized
    And the script should not execute
    And the data should be safely stored

  Scenario: Security - brute force protection
    Given an attacker is attempting brute force
    When more than 5 failed login attempts occur from same IP
    Then rate limiting should be applied
    And subsequent attempts should be throttled
    And security alerts should be logged
```

## Database Records Created

### 1. Transcript Record
```json
{
  "id": 1,
  "filename": "sample_transcript.txt",
  "file_format": "txt",
  "content": "[Full transcript text...]",
  "metadata": {
    "filename": "sample_transcript.txt",
    "line_count": 24
  },
  "created_at": "2025-01-15T10:30:00Z"
}
```

### 2. Test Script Record
```json
{
  "id": 1,
  "transcript_id": 1,
  "title": "User Authentication System",
  "description": "Comprehensive test suite for user authentication",
  "script_format": "gherkin",
  "content": "[Full Gherkin script above...]",
  "ai_provider": "anthropic",
  "ai_model": "claude-3-5-sonnet-20241022",
  "status": "pending",
  "created_at": "2025-01-15T10:30:15Z"
}
```

### 3. Approval Request
```json
{
  "id": 1,
  "test_script_id": 1,
  "requested_by": "system",
  "requested_at": "2025-01-15T10:30:20Z",
  "approval_token": "abc123xyz789...",
  "token_expires_at": "2025-01-22T10:30:20Z",
  "email_sent": true
}
```

## Email Notification Sent

**To:** product.owner@company.com
**Subject:** Approval Required: User Authentication System

```
Test Script Approval Request
═══════════════════════════════════

A new test script has been generated and requires your approval.

Test Script Details:
• Title: User Authentication System
• Format: gherkin
• Generated: 2025-01-15 10:30 UTC
• AI Model: claude-3-5-sonnet-20241022

Description:
Comprehensive test suite for user authentication

Test Script Preview:
───────────────────────────────────
Feature: User Authentication System
  As a mobile app user
  I want to securely login with email and password
  So that I can access my account safely

  Scenario: Successful user registration
    Given I am on the registration page
    When I enter a valid email address "user@example.com"
...

Actions:
[Approve] [Reject]

Or review the full details at: http://localhost:5000/test-script/1

This link will expire on 2025-01-22 10:30 UTC
```

## After Approval: ServiceNow User Story Created

```
User Story: US-12345
═══════════════════════════════════

Title: User Authentication System

Description:
As a mobile app user, I want to securely login with email and password,
so that I can access my account safely.

Test Script:
───────────────────────────────────
[Full Gherkin test script included...]

Source Information:
• Source: Voice Transcript
• Transcript File: sample_transcript.txt
• Test Format: gherkin (BDD)
• AI Generated: Yes (Anthropic Claude)
• Generated On: 2025-01-15

Acceptance Criteria:
✓ 18 test scenarios covering:
  - User registration with email verification
  - Login with valid/invalid credentials
  - Remember Me functionality
  - Account lockout after failed attempts
  - Password reset flow
  - Session management
  - Input validation
  - Security testing (SQL injection, XSS, brute force)

Priority: Medium
Status: Draft
Assigned To: Development Team
```

## CLI Output Example

```bash
$ python cli.py generate examples/sample_transcript.txt

Reading transcript: examples/sample_transcript.txt
✓ Transcript loaded (txt format)
  Lines: 24

Generating test script using anthropic...
✓ Test script generated!
  Title: User Authentication System
  Format: gherkin

╭─────────────────── Generated Test Script ────────────────────╮
│                                                                │
│ Feature: User Authentication System                            │
│   As a mobile app user                                         │
│   I want to securely login with email and password             │
│   So that I can access my account safely                       │
│                                                                │
│   Scenario: Successful user registration                       │
│     Given I am on the registration page                        │
│     When I enter a valid email address                         │
│     Then I should receive a verification email                 │
│   ...                                                          │
│                                                                │
╰────────────────────────────────────────────────────────────────╯

⚠ Approval required
✓ Approval request sent to product.owner@company.com
  Token: sHk9mK3nP2vL8qR1...

✓ Test script ID: 1
```

## API Response Example

```bash
$ curl -X POST -F "file=@transcript.txt" http://localhost:5000/upload

{
  "success": true,
  "transcript_id": 1,
  "test_script_id": 1,
  "test_script": {
    "title": "User Authentication System",
    "format": "gherkin",
    "content": "[Full test script...]"
  },
  "approval_request": {
    "success": true,
    "approval_request_id": 1,
    "approval_token": "sHk9mK3nP2vL8qR1...",
    "expires_at": "2025-01-22T10:30:20Z",
    "email_sent": true
  }
}
```

## Summary

**What the application does:**

1. ✅ **Reads** voice transcripts in multiple formats (TXT, VTT, SRT, JSON)
2. ✅ **Analyzes** the content using AI (Claude or GPT)
3. ✅ **Generates** comprehensive test scripts in your preferred format
4. ✅ **Sends** approval requests to product owners via email
5. ✅ **Creates** user stories in ServiceNow upon approval
6. ✅ **Tracks** everything in a local database

**Benefits:**

- 🚀 **Saves Time**: Automates test script creation from meetings
- 🎯 **Comprehensive**: AI identifies edge cases you might miss
- 📋 **Integrated**: Seamlessly creates ServiceNow user stories
- 🔄 **Workflow**: Built-in approval process
- 📊 **Trackable**: All data stored and retrievable

**Test Coverage Generated:**

From a simple voice transcript, the AI generates:
- ✅ 18+ test scenarios
- ✅ Happy path testing
- ✅ Negative test cases
- ✅ Edge cases
- ✅ Security testing
- ✅ UI validation
- ✅ Clear acceptance criteria
