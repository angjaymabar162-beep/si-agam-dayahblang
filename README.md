# UwaisPrompts - AI Prompt Marketplace

A full-featured AI Prompt Marketplace built with Next.js, Supabase, and modern web technologies.

## Features

- **AI Prompt Generator**: Generate powerful prompts using multiple AI models (GPT-4, Claude, Gemini, etc.)
- **Prompt Marketplace**: Browse, search, and purchase high-quality prompts
- **Creator Dashboard**: Upload and manage your prompts
- **Gamification**: Earn badges, maintain streaks, and climb the leaderboard
- **Real-time Notifications**: Get notified of sales, purchases, and achievements
- **Secure Authentication**: Supabase Auth with email/password
- **Responsive Design**: Mobile-first approach with dark mode support

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query v5 + Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Edge Functions)
- **AI Integration**: OpenRouter API for multiple AI providers
- **Deployment**: Vercel (frontend), Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/uwaisprompts.git
cd uwaisprompts
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Setup Supabase:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Create a storage bucket named `avatars`
   - Deploy the edge function from `supabase/functions/generate`

6. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── gamification/    # Streak badges, badges display, leaderboard
│   ├── layout/          # Navbar, Footer, Layout components
│   ├── prompt/          # Prompt card, grid, filters
│   └── ui/              # shadcn/ui components
├── hooks/               # TanStack Query hooks
├── lib/
│   ├── query/           # Query provider
│   ├── store/           # Zustand stores
│   └── supabase/        # Supabase client and types
├── pages/               # Page components
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## Database Schema

The application uses the following main tables:

- `users`: User profiles
- `prompts`: Prompt listings
- `purchases`: Purchase records
- `reviews`: Prompt reviews
- `badges`: Achievement badges
- `user_badges`: User-badge relationships
- `streaks`: User streak tracking
- `activities`: User activity log
- `notifications`: User notifications

## Features Overview

### Landing Page
- Hero section with stats
- Features showcase
- Featured prompts
- Leaderboard preview
- Pricing plans

### Authentication
- Email/password signup and login
- Protected routes
- Automatic profile creation

### Dashboard
- User stats and credits
- Recent prompts and purchases
- Activity feed
- Badges display
- Quick actions

### AI Prompt Generator
- Multiple AI model support
- Streaming responses
- Generation history
- Customizable parameters

### Marketplace
- Browse and search prompts
- Category and price filters
- Sort options
- Purchase prompts

### Creator Dashboard
- Create and edit prompts
- Publish/unpublish prompts
- View sales stats
- Manage prompt inventory

### Profile
- View and edit profile
- Display badges and streaks
- View published prompts
- Leaderboard ranking

## Gamification

- **Streaks**: Daily activity tracking with milestone rewards
- **Badges**: Achievement system for various accomplishments
- **Leaderboard**: Top creators ranked by sales and reputation
- **Credits**: In-app currency for purchases

## API Integration

The application uses OpenRouter API for AI generation, supporting:
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- Meta Llama
- And more...

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Backend (Supabase)
1. Create project
2. Run schema.sql
3. Set up storage buckets
4. Deploy edge functions
5. Configure RLS policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email hello@uwaisprompts.com or join our Discord community.
