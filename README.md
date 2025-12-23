# Medical Tracker

A Next.js web application for tracking medical appointments, test results, and bills. Built with TypeScript, Tailwind CSS, and Supabase.

## Features

- **Appointments Management**: Track medical appointments with doctors, specialties, dates, and notes
- **Test Results**: Record and view medical test results with values, units, and reference ranges
- **Bills Tracking**: Monitor medical expenses with payment tracking and cost analysis
- **Dashboard**: Overview of upcoming appointments, recent results, and cost statistics
- **Relationships**: Link results and bills to specific appointments for better organization

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new project in [Supabase](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL Editor
   - Get your project URL and anon key from Supabase Settings > API

3. **Configure environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
medical_tracker/
├── app/                    # Next.js app router pages
│   ├── appointments/      # Appointments pages
│   ├── results/           # Results pages
│   ├── bills/             # Bills pages
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── appointments/     # Appointment components
│   ├── results/          # Result components
│   ├── bills/            # Bill components
│   ├── dashboard/        # Dashboard components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── appointments.ts   # Appointment operations
│   ├── results.ts        # Result operations
│   ├── bills.ts          # Bill operations
│   └── dashboard.ts      # Dashboard stats
├── types/                 # TypeScript types
│   └── database.ts       # Database type definitions
└── supabase/             # Database schema
    └── schema.sql        # SQL schema
```

## Database Schema

The application uses three main tables:

- **appointments**: Medical appointments with doctors and dates
- **results**: Test results linked to appointments (optional)
- **bills**: Medical bills linked to appointments (optional)

See `supabase/schema.sql` for the complete schema.

## Future Enhancements

- File upload support for result documents and receipts (Supabase Storage)
- User authentication and multi-user support
- Advanced analytics and charts
- Export functionality for reports
- Email reminders for upcoming appointments

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Ready for Vercel deployment

## License

Private project for personal use.
