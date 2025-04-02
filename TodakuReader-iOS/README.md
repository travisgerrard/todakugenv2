# TodakuReader iOS App

A Japanese learning app that helps users improve their reading comprehension through stories with vocabulary, grammar points, and quizzes.

## Features

- Browse stories filtered by WaniKani level, Genki chapter, and Tadoku level
- Read stories with collapsible English translations
- Study vocabulary with example sentences
- Learn grammar points with explanations and examples
- Test your understanding with multiple-choice quizzes
- Track your progress with upvotes and completion status

## Requirements

- iOS 15.0+
- Xcode 13.0+
- Swift 5.5+
- [Supabase](https://supabase.io) account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/TodakuReader-iOS.git
cd TodakuReader-iOS
```

2. Set up environment variables:
   - Create a `.env` file in the project root
   - Add your Supabase credentials:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

3. Install dependencies:
```bash
swift package resolve
```

4. Open the project in Xcode:
```bash
xed .
```

5. Build and run the project

## Project Structure

- `Sources/`
  - `App/`: Main app entry point
  - `Views/`: SwiftUI views
  - `Models/`: Data models
  - `Services/`: API and database services
  - `Config/`: Environment configuration

## Dependencies

- [Supabase Swift](https://github.com/supabase-community/supabase-swift): Supabase client for Swift
- [OpenAIKit](https://github.com/dylanshine/openai-kit): OpenAI API client for Swift

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 