import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Todaku Gen V2 - Home",
  description: "Welcome to Todaku Gen V2 - A modern todo application",
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Welcome to Todaku Gen V2</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A modern todo application built with Next.js and Supabase
      </p>
    </main>
  )
} 