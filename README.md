# Meal Planner App

A collaborative meal planning application built with React, Node.js, Supabase, and OpenAI integration.

## Overview

The Meal Planner App helps users plan meals, manage recipes, generate grocery lists, and collaborate with household members. It features AI-powered meal suggestions and seamless sharing capabilities.

## Technology Stack

- **Frontend**: React (SPA)
- **Backend**: Node.js with Express.js
- **Database & Auth**: Supabase (PostgreSQL + Google OAuth)
- **AI Engine**: OpenAI API (GPT-4/GPT-3.5-Turbo)
- **Development**: Visual Studio Code

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- OpenAI API key
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd meal-planner-app
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Environment Setup:
```bash
# Frontend (frontend/.env.local)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001

# Backend (backend/.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
PORT=3001
```

**Important**: 
- Copy `.env.example` to `frontend/.env.local` for frontend configuration
- Copy `backend/.env.example` to `backend/.env` for backend configuration
- Add your actual OpenAI API key to `backend/.env`
- Never commit `.env` files to version control

4. Database Setup:
```bash
# Run database migrations (see DATABASE.md)
npm run db:migrate
```

5. Start Development Servers:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
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
