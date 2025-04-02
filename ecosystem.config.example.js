module.exports = {
  apps: [
    {
      name: 'todakugen',
      script: './start-src.sh',
      env: {
        PORT: 5001,
        NEXT_PUBLIC_SUPABASE_URL: 'your_supabase_url',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
        GOOGLE_CLIENT_ID: 'your_google_client_id',
        GOOGLE_CLIENT_SECRET: 'your_google_client_secret',
        OPENAI_API_KEY: 'your_openai_api_key'
      }
    }
  ]
}; 