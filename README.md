# Medical Tracker

A comprehensive Next.js web application for tracking medical appointments, test results, bills, medications, and insurance policies. Built with TypeScript, Tailwind CSS, and Supabase, featuring AI-powered insurance coverage analysis.

## Features

### 📅 Appointments Management
- Track medical appointments with doctors, specialties, dates, and notes
- Categorized appointments: Primary Care, Specialist, Dental Care, Mental Health, Vision & Eye, Procedures, Physical Therapy, and Urgent Care
- Link appointments to test results and bills
- Filter and search appointments by date, doctor, or specialty
- Full CRUD operations (Create, Read, Update, Delete)

### 🧪 Test Results
- Record and view medical test results with values, units, and reference ranges
- Upload PDF files for test result documents (stored in Supabase Storage)
- Link results to specific appointments
- Track test types and categories
- View test history and trends
- PDF text extraction capabilities

### 💰 Bills Tracking
- Monitor medical expenses with detailed payment tracking
- Track insurance coverage amounts and calculate out-of-pocket costs
- Multi-currency support (USD, EUR, CLP, etc.)
- Upload PDF receipts (stored in Supabase Storage)
- Link bills to appointments or test results
- Payment date and method tracking
- Cost analysis by category
- Link bills to insurance policies for coverage tracking

### 💊 Medications Management
- Track medications with dosage and frequency
- Record start and end dates
- Track prescribing doctor information
- Add notes and important medication details
- View medication history
- Comprehensive medication form with validation

### 🏥 Insurance Management
- **Track Multiple Insurance Policies**: Manage multiple insurance policies (Fonasa, Isapre, Complementario, Dental, Oncológico, Accidentes personales, Catastrófico)
- **Provider Support**: Support for major Chilean insurance providers (Banmédica, Colmena, Consalud, CruzBlanca, Nueva Masvida, Vida Tres, Esencial, Isalud, Fundación, Cruz del Norte, MetLife, Bice Vida, Consorcio, Chilena Consolidada, Vida Cámara, Bci Seguros, Confuturo, Alemana Seguros, Seguros Falabella, Seguros Ripley, Banco de Chile / Santander, and more)
- **PDF Policy Documents**: Upload and store insurance policy PDFs
- **AI-Powered Coverage Analysis**: Automatically extract coverage information from insurance PDFs using Google's Gemini AI
  - Extracts coverage percentages for different services (specialist visits, general practitioner, emergency, etc.)
  - Identifies coverage limits (maximum amounts in UF or CLP)
  - Detects copayments and deductibles
  - Extracts specific coverage details for procedures, medications, dental, vision, etc.
  - Identifies exclusions and limitations
- **Coverage Data Storage**: Structured JSON storage of coverage information
- **Price Tracking**: Track insurance policy costs in UF or CLP
- **Policy ID Management**: Store and manage policy identification numbers
- **Logo Support**: Automatic logo detection for insurance providers
- **Coverage Drawer**: Interactive drawer interface to view and edit coverage details
- **Manual Coverage Entry**: Edit coverage data manually if AI analysis is not available

### 🤖 AI Features
- **Gemini AI Integration**: Uses Google's Gemini API for intelligent document analysis
- **PDF Text Extraction**: Extracts text from insurance policy PDFs
- **Structured Data Extraction**: Converts unstructured PDF text into structured JSON coverage data
- **Multi-Model Fallback**: Automatically tries multiple Gemini models for maximum compatibility
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Chilean Insurance Support**: Optimized for Chilean health insurance terminology (Isapre, Fonasa, UF, CLP, etc.)

### 📊 Dashboard & Analytics
- **Cost Breakdown**: Interactive donut chart showing expenses by category ("My Money")
- **Coverage Efficiency**: Visual breakdown of insurance coverage vs. out-of-pocket expenses
- **Health Journey Timeline**: Chronological timeline of appointments and test results with expandable details
- Quick stats: Total appointments, monthly/yearly costs
- Upcoming appointments overview
- Recent test results and bills
- Category-based expense analysis

### 🔗 Relationships & Organization
- Link test results to specific appointments
- Link bills to appointments or test results
- Link bills to insurance policies for coverage tracking
- View all related data from a single appointment
- Track complete medical journey

### 📁 File Storage
- Upload PDF files for test results (max 10MB)
- Upload PDF receipts for bills (max 10MB)
- Upload PDF policy documents for insurance (max 10MB)
- Files stored securely in Supabase Storage
- View and download uploaded files
- Three storage buckets: `test-results`, `medical-bills`, `insurance-policies`

## Getting Started

### Prerequisites

- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** or **yarn** package manager
- A **Supabase account** and project ([Sign up here](https://supabase.com))

### Setup Instructions

#### Step 1: Clone or Download the Project

If you have the project in a Git repository:
```bash
git clone <repository-url>
cd medical_tracker
```

If you're copying the project to another computer, copy the entire project folder.

#### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, Supabase client, Tailwind CSS, and other dependencies.

**Note**: If you plan to use the AI coverage analysis feature, you may need to install additional dependencies:
```bash
npm install pdf-parse @google/generative-ai
```

#### Step 3: Set Up Supabase Database

1. **Create a Supabase Project**:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Click "New Project"
   - Fill in your project details and wait for it to be created

2. **Run the Database Schema**:
   - In your Supabase project, go to **SQL Editor**
   - Open the file `supabase/schema.sql` from this project
   - Copy and paste the entire contents into the SQL Editor
   - Click **Run** to execute the schema

3. **Run Database Migrations** (in order):
   - Run all migration files in `supabase/migrations/` in the following order:
     - `create-medications-table.sql`
     - `update-medications-table-schema.sql`
     - `add-result-id-to-bills.sql`
     - `add-insurance-coverage-to-bills.sql`
     - `create-insurances-table.sql`
     - `add-insurance-price-to-insurances.sql`
     - `add-insurance-type-to-insurances.sql`

#### Step 4: Set Up Supabase Storage

The app uses Supabase Storage for PDF uploads. You need to set up three storage buckets:

1. **For Test Results**:
   - Go to **Storage** in your Supabase Dashboard
   - Click **New bucket**
   - Name it: `test-results`
   - Make it **Public** (for now - you can restrict it later when adding authentication)
   - Click **Create bucket**
   - Alternatively, run the SQL script `supabase/storage-setup.sql` in the SQL Editor

2. **For Bill Receipts**:
   - Go to **Storage** in your Supabase Dashboard
   - Click **New bucket**
   - Name it: `medical-bills`
   - Make it **Public** (for now)
   - Click **Create bucket**
   - Alternatively, run the SQL script `supabase/storage-setup-bills.sql` in the SQL Editor

3. **For Insurance Policy PDFs**:
   - Go to **Storage** in your Supabase Dashboard
   - Click **New bucket**
   - Name it: `insurance-policies`
   - Make it **Public** (for now)
   - Click **Create bucket**
   - Alternatively, run the SQL script `supabase/storage-setup-insurances.sql` in the SQL Editor

#### Step 5: Configure Environment Variables

1. **Get your Supabase credentials**:
   - In your Supabase project, go to **Settings** → **API**
   - Copy your **Project URL** and **anon/public key**

2. **Get your Gemini API Key** (Optional, for AI coverage analysis):
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click **Create API Key**
   - Select or create a Google Cloud project
   - Copy the API key
   - **Note**: Gemini API has a generous free tier. You can use it without a credit card for testing.

3. **Create `.env.local` file**:
   - In the root directory of the project, create a new file named `.env.local`
   - Add the following content:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   - Replace `your_supabase_project_url` with your actual Supabase project URL
   - Replace `your_supabase_anon_key` with your actual Supabase anon key
   - Replace `your_gemini_api_key_here` with your Gemini API key (optional, only needed for AI coverage analysis)
   - **Important**: Do NOT add `NEXT_PUBLIC_` prefix to `GEMINI_API_KEY` - this keeps the key server-side only

   Example:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   GEMINI_API_KEY=AIzaSyD...your_key_here
   ```

   **Note**: If you don't set up the Gemini API key, the insurance coverage analysis feature will not work, but you can still manually enter coverage data.

#### Step 6: Run the Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

#### Step 7: Verify Setup

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the dashboard
3. Try creating a test appointment to verify the database connection
4. Try uploading a PDF file to verify storage is working
5. Try creating an insurance policy and uploading a PDF to test AI coverage analysis (if Gemini API key is configured)

## Project Structure

```
medical_tracker/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   └── insurance/    # Insurance API endpoints
│   │       └── analyze-coverage/ # AI coverage analysis endpoint
│   ├── appointments/      # Appointments pages (list, detail, create, edit)
│   ├── results/           # Test results pages (list, detail, create, edit)
│   ├── bills/             # Bills pages (list, detail, create, edit)
│   ├── medications/       # Medications pages (list, detail, create, edit)
│   ├── insurances/        # Insurance pages (list, create, edit)
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── appointments/     # Appointment components
│   ├── results/          # Result components
│   ├── bills/            # Bill components
│   ├── medications/      # Medication components
│   ├── insurances/       # Insurance components
│   │   ├── insurance-card.tsx
│   │   ├── insurance-form.tsx
│   │   ├── insurances-list.tsx
│   │   └── coverage-drawer.tsx
│   ├── dashboard/        # Dashboard components
│   │   ├── dashboard-overview.tsx
│   │   ├── cost-breakdown.tsx
│   │   └── health-journey-timeline.tsx
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── appointments.ts   # Appointment operations
│   ├── results.ts        # Result operations
│   ├── bills.ts          # Bill operations
│   ├── medications.ts    # Medication operations
│   ├── insurances.ts     # Insurance operations
│   ├── dashboard.ts      # Dashboard stats
│   ├── storage.ts        # File upload utilities
│   ├── pdf-extractor.ts # PDF text extraction utilities
│   ├── ai-coverage-analyzer.ts # AI coverage analysis
│   ├── insurance-logos.ts # Insurance logo mapping
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript types
│   └── database.ts       # Database type definitions
└── supabase/             # Database schema and migrations
    ├── schema.sql        # Main database schema
    ├── migrations/       # Database migration files
    │   ├── create-medications-table.sql
    │   ├── update-medications-table-schema.sql
    │   ├── add-result-id-to-bills.sql
    │   ├── add-insurance-coverage-to-bills.sql
    │   ├── create-insurances-table.sql
    │   ├── add-insurance-price-to-insurances.sql
    │   └── add-insurance-type-to-insurances.sql
    ├── storage-setup.sql # Storage setup for test results
    ├── storage-setup-bills.sql # Storage setup for bills
    └── storage-setup-insurances.sql # Storage setup for insurance policies
```

## Database Schema

The application uses five main tables:

- **appointments**: Medical appointments with doctors, specialties, dates, and notes
- **results**: Test results linked to appointments (optional), with PDF file support
- **bills**: Medical bills linked to appointments or results (optional), with insurance coverage tracking and receipt PDF support. Can also be linked to insurance policies.
- **medications**: Medications with dosage, frequency, dates, and prescribing doctor information
- **insurances**: Insurance policies with provider information, policy IDs, types, prices, PDF documents, and AI-extracted coverage data (stored as JSONB)

See `supabase/schema.sql` and migration files in `supabase/migrations/` for the complete schema.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Troubleshooting

### Database Connection Issues

- Verify your `.env.local` file has the correct Supabase URL and anon key
- Check that you've run the schema SQL script in Supabase
- Ensure your Supabase project is active (not paused)

### File Upload Issues

- Verify that storage buckets `test-results`, `medical-bills`, and `insurance-policies` exist in Supabase Storage
- Check that storage policies are set up correctly (run `supabase/storage-setup.sql`, `supabase/storage-setup-bills.sql`, and `supabase/storage-setup-insurances.sql`)
- Ensure files are PDF format and under 10MB

### AI Coverage Analysis Issues

- **"GEMINI_API_KEY is not configured"**: Make sure `.env.local` file exists with `GEMINI_API_KEY` (no `NEXT_PUBLIC_` prefix)
- **"You exceeded your current quota" (429 Error)**: Your Gemini API quota has been exceeded. Add credits in Google Cloud Console or wait for quota reset. You can still manually enter coverage data.
- **"PERMISSION_DENIED" or "403" Error**: Make sure Generative Language API is enabled in your Google Cloud project
- **Analysis fails**: Check that the PDF contains extractable text (not just images) and is accessible
- See `AI_SETUP.md` for detailed troubleshooting

### Build Errors

- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure you're using Node.js 18 or higher
- Check that all environment variables are set correctly

### Port Already in Use

If port 3000 is already in use:
```bash
# Windows PowerShell
$env:PORT=3001; npm run dev

# Linux/Mac
PORT=3001 npm run dev
```

## Security Notes

⚠️ **Important**: The current setup uses public storage policies for easier testing. When you add user authentication to your application, you should:

1. Update the storage policies in `supabase/storage-setup.sql`, `supabase/storage-setup-bills.sql`, and `supabase/storage-setup-insurances.sql` to use `authenticated` instead of `public`
2. Enable Row Level Security (RLS) on all tables
3. Create RLS policies for each table
4. Consider adding user-specific folders for better organization
5. Keep `GEMINI_API_KEY` server-side only (never add `NEXT_PUBLIC_` prefix) - it's already configured correctly

## Deployment

This application is ready for deployment on Vercel:

1. Push your code to GitHub
2. Import your project in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

For other platforms, ensure:
- Environment variables are set correctly
- Node.js 18+ is available
- The build command `npm run build` runs successfully

## Additional Documentation

- **AI_SETUP.md**: Detailed guide for setting up AI-powered insurance coverage analysis
- **STORAGE_SETUP.md**: Guide for setting up PDF upload functionality
- **GITHUB_SETUP.md**: Instructions for pushing code to GitHub

## Future Enhancements

- User authentication and multi-user support
- Advanced analytics and charts
- Export functionality for reports (PDF, CSV)
- Email reminders for upcoming appointments
- Mobile app version
- Medication reminders and notifications
- Integration with health insurance APIs
- Enhanced AI analysis with support for more document types
- Insurance comparison features

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Charts**: Recharts
- **AI/ML**: Google Gemini API (for insurance coverage analysis)
- **PDF Processing**: pdf-parse library
- **Deployment**: Ready for Vercel deployment

## License

Private project for personal use.
