# Contract App Backend

This is the backend for the Contract App, a scheduling and meeting management platform. It provides APIs for user authentication, scheduling meetings, integrating with Google Calendar and HubSpot, and sending email notifications.

## Features

- **User Authentication**: Google OAuth-based login.
- **Scheduling**: Create scheduling windows and links for meetings.
- **Meeting Management**: Manage meetings and store meeting details.
- **Third-party Integrations**:
  - Google Calendar for event management.
  - HubSpot for contact management.
- **Email Notifications**: Send meeting notifications using Nodemailer.
- **AI-Powered Context Notes**: Generate context notes using Groq API.

## API Structure

- **Authentication**
  POST /contract-app/v1/google/auth: Google login.
  GET /contract-app/v1/user: Get user details.

- **Scheduling**
  POST /contract-app/v1/scheduling-window/new: Create a scheduling window.
  POST /contract-app/v1/create/schedule-link: Create a scheduling link.
  GET /contract-app/v1/scheduling-link/:slug: Get scheduling link details.
  GET /contract-app/v1/schedule-dates: Get user schedule.

- **Meetings**
  POST /contract-app/v1/create/meeting: Create a meeting.
  GET /contract-app/v1/meetings: Get meetings for a user.

- **Events**
  GET /contract-app/v1/google/accesstoken: Get Google OAuth access token.
  GET /contract-app/v1/get/events: Fetch Google Calendar events.
  GET /contract-app/v1/google/callback: Google OAuth callback.
  GET /contract-app/v1/google/accounts: Get connected Google accounts.
  GET /contract-app/v1/google/account: Get a specific connected Google account.
  GET /contract-app/v1/hubspot/auth-url: Get HubSpot OAuth URL.
  GET /contract-app/v1/hubspot/callback:
