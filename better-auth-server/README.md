# Better-Auth Server

This is a Next.js application that serves as an authentication server using Better-Auth with Neon Postgres database.

## Features

- Email and password authentication
- Custom user profile fields:
  - Software Background (Beginner, Intermediate, Expert)
  - NVIDIA RTX GPU ownership (Yes/No)
  - Jetson kit or edge device ownership (Yes/No)
  - Prior robotics/ROS experience (Yes/No)

## Prerequisites

- Node.js 18 or higher
- A Neon Postgres database account

## Setup Instructions

1. **Clone the repository** (if not already done):
   ```bash
   git clone <your-repo-url>
   cd better-auth-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory with the following content:

   ```env
   DATABASE_URL="postgresql://your_username:your_password@ep-xxx.us-east-1.aws.neon.tech/your_database_name?sslmode=require"
   BETTER_AUTH_SECRET="your_32_character_secret_key"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   ```

   - For `DATABASE_URL`: Replace with your Neon database connection string
   - For `BETTER_AUTH_SECRET`: Generate a 32+ character secret using:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000` (or another available port).

## API Endpoints

The authentication API is available at:
- `POST /api/auth/sign-in` - Sign in
- `POST /api/auth/sign-up` - Sign up
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

## Integration with Docusaurus

To integrate this authentication server with your Docusaurus application:

1. Update the Docusaurus proxy configuration to forward `/api/auth` requests to this server
2. Use the `NEXT_PUBLIC_BETTER_AUTH_URL` environment variable in your Docusaurus app to point to this server
3. Implement the auth context in your Docusaurus app to access user sessions

## Environment Variables

- `DATABASE_URL`: Neon Postgres connection string
- `BETTER_AUTH_SECRET`: Secret key for signing JWTs (minimum 32 characters)
- `BETTER_AUTH_URL`: Internal URL for the auth server
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Public URL for client-side requests

## Custom User Fields

When users sign up, they will be prompted to provide additional information:
- Software background level
- Hardware ownership (NVIDIA RTX GPU, Jetson kit)
- Prior robotics/ROS experience

These fields are stored in the user profile and can be accessed through the user session.

## Troubleshooting

- If you get a 500 error, check that your database credentials are correct
- If you get a "secret too short" error, ensure your `BETTER_AUTH_SECRET` is at least 32 characters
- Make sure the ports are available and not used by other applications
