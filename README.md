# MockHire – AI-Powered Interview Platform 🚀

**MockHire** is an advanced AI-powered mock interview platform that helps job seekers practice real-world interview scenarios with intelligent voice interactions. Built with cutting-edge AI technologies, it provides personalized interview experiences based on job positions or resume analysis, delivering comprehensive feedback to boost your interview confidence.

---

## ✨ Features

### 🎯 Interview Modes

- **Position-Based Interviews**: Practice interviews tailored to specific job roles and requirements
- **Resume-Based Interviews**: Upload your resume for personalized interview questions based on your experience
- **AI Voice Conversations**: Real-time voice interactions powered by VAPI AI for realistic interview simulation

### 🤖 AI-Powered Intelligence

- **Resume Parsing**: Advanced PDF parsing with Groq AI to extract skills, experience, and qualifications
- **Smart Question Generation**: Context-aware interview questions generated using Groq Llama 3.3 70B
- **Comprehensive Feedback**: Detailed performance analysis and recommendations using Groq Llama 3.3 70B

### � Interview Management

- **Multiple Duration Options**: Choose from 5, 15, or 30-minute interview sessions
- **Difficulty Levels**: Select from Beginner, Intermediate, or Advanced difficulty
- **Interview History**: Track all completed interviews in your profile dashboard
- **Detailed Feedback Reports**: Access scorecard, question-wise feedback, and improvement recommendations

### 👤 User Experience

- **Secure Authentication**: JWT-based authentication with refresh token support
- **Profile Management**: Update personal information, bio, social links, and profile pictures
- **Jobs Section**: Browse available job opportunities with detailed descriptions
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.3.2 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.0 with Lightning CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React, React Icons
- **State Management**: Zustand 5.0.5 with localStorage persistence

### Backend & Database

- **Database**: PostgreSQL
- **ORM**: Prisma 6.13.0
- **Authentication**: JWT (jsonwebtoken) with bcryptjs password hashing
- **API Routes**: Next.js API Routes with REST architecture

### AI & Voice

- **AI Provider**: Groq AI (groq-sdk)
  - Llama 3.3 70B Versatile for resume parsing, question generation, and feedback
- **Voice AI**: VAPI AI (@vapi-ai/web 2.3.0) for voice interview sessions
- **PDF Processing**: pdf2json 3.2.2 for resume parsing

### File Storage & Processing

- **Image/File Storage**: ImageKit (@imagekit/next 2.1.2)
- **HTTP Client**: Axios 1.9.0
- **ID Generation**: nanoid 5.1.5
- **Data Export**: @json2csv/plainjs 7.0.6

### UI/UX Libraries

- **Markdown Rendering**: react-markdown 10.1.0
- **Notifications**: Sonner 2.0.3
- **Animations**: tw-animate-css 1.3.0
- **Utility**: clsx, tailwind-merge, class-variance-authority

---

## 📁 Project Structure

```
mockhire-final/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── api/                     # API Routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── interviews/         # Interview CRUD operations
│   │   ├── users/              # User management
│   │   ├── generate-question/  # AI question generation
│   │   ├── generate-feedback/  # AI feedback generation
│   │   └── parse-resume/       # Resume parsing
│   ├── interview/              # Interview pages
│   │   ├── by-position/       # Position-based interviews
│   │   └── by-resume/         # Resume-based interviews
│   ├── profile/               # User profile & settings
│   ├── feedback/              # Feedback display
│   └── jobs/                  # Job listings
├── components/                 # React components
│   ├── ui/                    # Shadcn UI components
│   ├── interview-feedback/    # Feedback components
│   └── ...                    # Other components
├── hooks/                     # Custom React hooks
├── lib/                       # Utility libraries
├── prisma/                    # Database schema & migrations
├── types/                     # TypeScript type definitions
└── utils/                     # Helper functions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Groq API key
- VAPI AI account
- ImageKit account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mockhire-final
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-jwt-secret"
   GROQ_API_KEY="your-groq-api-key"
   VAPI_PUBLIC_KEY="your-vapi-public-key"
   VAPI_PRIVATE_KEY="your-vapi-private-key"
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
   IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
   IMAGEKIT_URL_ENDPOINT="your-imagekit-url"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 Key API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/parse-resume` - Parse resume with AI
- `POST /api/generate-question` - Generate interview questions
- `POST /api/generate-feedback` - Generate interview feedback
- `GET /api/interviews` - Get user interviews
- `GET /api/interviews/[id]` - Get interview details
- `PUT /api/users/[id]` - Update user profile

---

## 🎯 Interview Flow

1. **Choose Interview Type**: Position-based or Resume-based
2. **Upload/Select**: Upload resume (PDF) or select job position
3. **Configure**: Choose difficulty level and duration (5/15/30 min)
4. **AI Processing**: Resume parsed or questions generated based on position
5. **Voice Interview**: Interactive AI conversation via VAPI
6. **Feedback Generation**: Comprehensive analysis with scorecard and recommendations
7. **Review**: Access detailed feedback report from profile dashboard

---

## 🔐 Authentication

- JWT-based authentication with 7-day access tokens
- 30-day refresh tokens for persistent sessions
- Password hashing with bcryptjs
- Secure token storage with Zustand persistence

---

## 📊 Database Schema

Built with Prisma ORM, supporting:

- User profiles with social links
- Interview records with metadata
- Feedback and performance tracking
- Secure credential management

---

## 🎨 Design System

- **Color Scheme**: Emerald green primary palette
- **Typography**: Modern, readable font stack
- **Components**: Accessible Radix UI primitives
- **Responsive**: Mobile-first design approach
- **Dark Mode Ready**: Theme support with next-themes

---

## � License

This project is private and proprietary.

---

Made with 💓 by Siddhi
