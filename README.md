# Todaku Gen V2

A modern todo application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Supabase](https://supabase.com/) - Backend and authentication
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://zod.dev/) - Schema validation
- [NUQS](https://nuqs.47ng.com/) - URL search params state management

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/todakugenv2.git
cd todakugenv2
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Modern UI with Shadcn UI components
- Dark mode support
- Type-safe API routes
- Server-side rendering
- Real-time updates with Supabase
- Form validation with Zod
- URL state management with NUQS
- Responsive design

## Project Structure

```
├── app/                # Next.js App Router
│   ├── api/           # API routes
│   ├── (auth)/        # Authentication routes
│   └── (dashboard)/   # Dashboard routes
├── components/        # React components
├── lib/              # Utility functions
├── types/            # TypeScript types
└── public/           # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 