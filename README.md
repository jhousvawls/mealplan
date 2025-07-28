# Meal Planner App

A collaborative meal planning application built with React, Node.js, Supabase, and OpenAI integration.

## Overview

The Meal Planner App helps users plan meals, manage recipes, generate grocery lists, and collaborate with household members. It features AI-powered meal suggestions and seamless sharing capabilities.

## Technology Stack

- **Frontend**: React (SPA) with TypeScript and Vite
- **Backend**: Node.js with Express.js and TypeScript
- **Recipe Parsing**: Puppeteer + Cheerio for web scraping
- **Database & Auth**: Supabase (PostgreSQL + Google OAuth)
- **AI Engine**: OpenAI API (GPT-4/GPT-3.5-Turbo)
- **Development**: Visual Studio Code

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Google OAuth credentials (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jhousvawls/mealplan.git
cd mealplan
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. Environment Setup:
```bash
# Frontend (frontend/.env.local)
VITE_SUPABASE_URL=https://zgxhwqvmbhpdvegqqndk.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

**Important**: 
- Copy `.env.example` to `frontend/.env.local` for frontend configuration
- Add your actual Supabase credentials
- Never commit `.env` files to version control

4. Database Setup:
```bash
# Run the database migration in Supabase SQL Editor
# Copy contents of database/migrations/001_initial_schema.sql
# See database/README.md for detailed instructions
```

5. Authentication Setup:
```bash
# Configure Google OAuth in Supabase Dashboard
# See docs/AUTHENTICATION_SETUP.md for detailed instructions
```

6. Start Development Servers:
```bash
# Terminal 1: Start Backend API
cd backend
npm run dev
# Backend API will be available at http://localhost:3001

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Frontend will be available at http://localhost:5173
```

## Project Structure

```
meal-planner-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and Supabase services
│   │   └── utils/          # Utility functions
│   └── public/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── tests/
├── docs/                   # Documentation
└── database/              # Database migrations and seeds
```

## Core Features

- **User Authentication**: Google OAuth via Supabase
- **Recipe Import**: Real-time parsing from 20+ major food websites with intelligent image selection
- **Meal Planning**: Weekly meal planning with drag-and-drop interface
- **Recipe Management**: Personal recipe box with CRUD operations
- **AI Integration**: AI-powered meal suggestions and recipe generation
- **Collaboration**: Share meal plans with household members
- **Grocery Lists**: Auto-generated shopping lists with Walmart export
- **Real-time Updates**: Live collaboration using Supabase realtime

## Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Testing**: Write unit tests for new features
3. **Code Review**: Submit pull requests for review
4. **Deployment**: Automatic deployment via CI/CD pipeline

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and technical architecture
- [Backend Implementation](./docs/BACKEND_IMPLEMENTATION.md) - Recipe parsing engine and API server
- [Database](./docs/DATABASE.md) - Database schema and data models
- [API](./docs/API.md) - Backend API documentation
- [Development](./docs/DEVELOPMENT.md) - Development guidelines and best practices
- [Deployment](./docs/DEPLOYMENT.md) - Deployment and environment setup
- [Features](./docs/FEATURES.md) - Feature specifications and roadmap

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
