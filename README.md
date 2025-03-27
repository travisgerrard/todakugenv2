# TodakuReader V2

A Japanese learning app that helps users improve their reading comprehension through interactive stories, vocabulary, and quizzes.

## Features

- Interactive Japanese stories with English translations
- Vocabulary lists with readings and meanings
- Grammar point explanations
- Interactive quizzes for vocabulary and grammar
- Progress tracking
- Story upvoting system

## Tech Stack

- iOS App:
  - SwiftUI
  - Swift Package Manager
  - Supabase Swift Client

- Backend:
  - Supabase (PostgreSQL)
  - Row Level Security
  - OAuth Authentication

## Prerequisites

- Xcode 15.0+
- iOS 16.0+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Homebrew](https://brew.sh) (for installing dependencies)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/travisgerrard/todakugenv2.git
   cd todakugenv2
   ```

2. Install Supabase CLI:
   ```bash
   brew install supabase/tap/supabase
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values.

4. Set up Supabase:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase db push
   ```

5. Open the Xcode project:
   ```bash
   open TodakuReader-iOSProj/TodakuReader-iOS.xcodeproj
   ```

6. Update `Config.swift` with your Supabase credentials.

7. Build and run the project in Xcode.

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `OPENAI_API_KEY`: OpenAI API key for story generation

## Development

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request on GitHub.

## Database Migrations

New migrations should be added to the `supabase/migrations` directory:

```bash
supabase migration new your-migration-name
```

Apply migrations:
```bash
supabase db push
```

## Security

- Environment variables are not committed to the repository
- Supabase RLS policies are in place
- OAuth credentials are managed securely
- API keys are stored securely

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 