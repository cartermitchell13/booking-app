# ParkBus Booking Application

A modern, full-stack booking application for sustainable bus travel to Canada's most beautiful destinations.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup (Optional)
The app works with mock data by default. To connect to a real Supabase database:

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Get your Supabase credentials from your [Supabase Dashboard](https://supabase.com/dashboard)

3. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components  
├── features/           # Domain-driven feature modules
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── types/              # TypeScript type definitions
```

## ✨ Key Features

- **🔍 Smart Search**: Intelligent location search with auto-complete
- **📱 Responsive Design**: Mobile-first approach with beautiful UI
- **⚡ Fast Performance**: Optimized for speed and user experience
- **🎨 Modern UI**: Clean, intuitive interface following best practices
- **🔒 Type Safe**: Full TypeScript implementation
- **🌐 SEO Optimized**: Built for search engine discoverability

## 🎯 Current Status

**✅ Completed (Step 1)**
- Project setup and architecture
- TypeScript types and interfaces
- Supabase client configuration  
- React Query setup for data fetching
- Search context for global state management
- Beautiful, responsive landing page
- Core search bar component with:
  - Location selection with search
  - Date pickers for departure/return
  - Passenger count selector
  - Trip type toggle (one-way/round-trip)
  - URL state synchronization

**🔄 Next Steps**
- Results page with trip listings
- Map integration with Mapbox
- Trip detail pages
- Booking flow implementation
- Payment integration

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query, Context API  
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Deployment**: Vercel (planned)

## 🎨 Design Principles

Following research-backed UX principles for travel booking:

1. **Single Search Entry Point** - Prominent, centered search functionality
2. **Progressive Disclosure** - Multi-step wizard approach
3. **Real-time Feedback** - Instant validation and loading states
4. **Mobile-first** - Thumb-reachable interactions
5. **Trust Indicators** - Security badges and clear pricing

## 📝 Development Notes

The application is built step-by-step following modern React patterns:
- Functional components with hooks
- TypeScript for type safety
- Component composition over inheritance
- Performance optimizations built-in

---

**Note**: This is currently in development mode with mock data. The app will work fully once connected to a Supabase database with the proper schema.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
