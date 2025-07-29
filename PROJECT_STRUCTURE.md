# Project Structure

## Overview

This document outlines the complete file and directory structure for the Meal Planner App project, providing a clear understanding of how the codebase is organized.

## Root Directory Structure

```
meal-planner-app/
├── README.md                     # Project overview and quick start
├── PROJECT_STRUCTURE.md          # This file - project organization
├── .gitignore                    # Git ignore rules
├── .env.example                  # Environment variable template
├── package.json                  # Root package.json for scripts
├── docker-compose.yml            # Local development with Docker
├── docs/                         # Documentation
├── frontend/                     # React application
├── backend/                      # Node.js/Express API
├── database/                     # Database migrations and seeds
├── .github/                      # GitHub workflows and templates
└── scripts/                      # Utility scripts
```

## Documentation Structure

```
docs/
├── README.md                     # Documentation index
├── ARCHITECTURE.md               # System architecture and design
├── DATABASE.md                   # Database schema and models
├── API.md                        # Backend API documentation
├── DEVELOPMENT.md                # Development guidelines and standards
├── DEPLOYMENT.md                 # Deployment instructions
├── FEATURES.md                   # Feature specifications and roadmap
├── CONTRIBUTING.md               # Contribution guidelines
├── CHANGELOG.md                  # Version history and changes
└── assets/                       # Documentation images and diagrams
    ├── architecture-diagram.png
    ├── database-erd.png
    └── ui-mockups/
```

## Frontend Structure

```
frontend/
├── public/                       # Static assets
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/                          # Source code
│   ├── components/               # Reusable UI components
│   │   ├── common/               # Generic components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Modal/
│   │   │   ├── Loading/
│   │   │   └── ErrorBoundary/
│   │   ├── auth/                 # Authentication components
│   │   │   ├── LoginForm/
│   │   │   ├── SignupForm/
│   │   │   └── ProtectedRoute/
│   │   ├── recipes/              # Recipe-related components
│   │   │   ├── RecipeCard/
│   │   │   ├── RecipeForm/
│   │   │   ├── RecipeList/
│   │   │   ├── IngredientInput/
│   │   │   └── NutritionDisplay/
│   │   ├── meal-planning/        # Meal planning components
│   │   │   ├── MealPlanCalendar/
│   │   │   ├── MealSlot/
│   │   │   ├── DragDropProvider/
│   │   │   └── PlanSummary/
│   │   ├── grocery/              # Grocery list components
│   │   │   ├── GroceryList/
│   │   │   ├── GroceryItem/
│   │   │   └── CategoryGroup/
│   │   └── ai/                   # AI-related components
│   │       ├── MealSuggestions/
│   │       ├── PreferenceForm/
│   │       └── AILoadingSpinner/
│   ├── pages/                    # Page components
│   │   ├── HomePage/
│   │   │   ├── HomePage.tsx
│   │   │   ├── HomePage.test.tsx
│   │   │   ├── HomePage.module.css
│   │   │   └── index.ts
│   │   ├── DashboardPage/
│   │   ├── RecipeBoxPage/
│   │   ├── MealPlanningPage/
│   │   ├── GroceryListPage/
│   │   ├── ProfilePage/
│   │   └── NotFoundPage/
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useRecipes.ts
│   │   ├── useMealPlans.ts
│   │   ├── useGroceryList.ts
│   │   ├── useAI.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── services/                 # API and external services
│   │   ├── api/
│   │   │   ├── client.ts         # API client configuration
│   │   │   ├── auth.ts           # Authentication API calls
│   │   │   ├── recipes.ts        # Recipe API calls
│   │   │   ├── mealPlans.ts      # Meal plan API calls
│   │   │   ├── grocery.ts        # Grocery API calls
│   │   │   └── ai.ts             # AI API calls
│   │   ├── supabase/
│   │   │   ├── client.ts         # Supabase client setup
│   │   │   ├── auth.ts           # Supabase auth helpers
│   │   │   └── database.ts       # Database query helpers
│   │   └── storage/
│   │       ├── localStorage.ts
│   │       └── sessionStorage.ts
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── MealPlanContext.tsx
│   ├── utils/                    # Utility functions
│   │   ├── logger.ts             # Frontend logging system with React hooks
│   │   ├── formatters/
│   │   │   ├── date.ts
│   │   │   ├── currency.ts
│   │   │   └── nutrition.ts
│   │   ├── validators/
│   │   │   ├── recipe.ts
│   │   │   ├── email.ts
│   │   │   └── forms.ts
│   │   ├── constants/
│   │   │   ├── api.ts
│   │   │   ├── routes.ts
│   │   │   └── app.ts
│   │   └── helpers/
│   │       ├── calculations.ts
│   │       ├── transformers.ts
│   │       └── generators.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── api.ts                # API response types
│   │   ├── auth.ts               # Authentication types
│   │   ├── recipe.ts             # Recipe-related types
│   │   ├── mealPlan.ts           # Meal planning types
│   │   ├── grocery.ts            # Grocery list types
│   │   ├── user.ts               # User profile types
│   │   └── supabase.ts           # Generated Supabase types
│   ├── styles/                   # Global styles and themes
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── components.css
│   │   └── themes/
│   │       ├── light.css
│   │       └── dark.css
│   ├── assets/                   # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── App.tsx                   # Main App component
│   ├── App.test.tsx              # App component tests
│   ├── index.tsx                 # Application entry point
│   ├── index.css                 # Global styles
│   └── setupTests.ts             # Test configuration
├── package.json                  # Frontend dependencies
├── package-lock.json
├── tsconfig.json                 # TypeScript configuration
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── jest.config.js                # Jest test configuration
├── .env.local                    # Local environment variables
├── .env.example                  # Environment template
└── build/                        # Production build output
```

## Backend Structure

```
backend/
├── src/                          # Source code
│   ├── routes/                   # API route handlers
│   │   ├── index.ts              # Route aggregation
│   │   ├── auth.ts               # Authentication routes
│   │   ├── users.ts              # User management routes
│   │   ├── recipes.ts            # Recipe CRUD routes
│   │   ├── mealPlans.ts          # Meal planning routes
│   │   ├── grocery.ts            # Grocery list routes
│   │   ├── ai.ts                 # AI integration routes
│   │   ├── sharing.ts            # Sharing and collaboration
│   │   └── health.ts             # Health check endpoint
│   ├── middleware/               # Express middleware
│   │   ├── auth.ts               # Authentication middleware
│   │   ├── validation.ts         # Request validation
│   │   ├── rateLimit.ts          # Rate limiting
│   │   ├── cors.ts               # CORS configuration
│   │   ├── logging.ts            # Request logging
│   │   └── errorHandler.ts       # Error handling
│   ├── services/                 # Business logic services
│   │   ├── auth/
│   │   │   ├── AuthService.ts
│   │   │   └── TokenService.ts
│   │   ├── recipes/
│   │   │   ├── RecipeService.ts
│   │   │   └── NutritionService.ts
│   │   ├── mealPlans/
│   │   │   ├── MealPlanService.ts
│   │   │   └── SharingService.ts
│   │   ├── grocery/
│   │   │   ├── GroceryService.ts
│   │   │   └── WalmartService.ts
│   │   ├── ai/
│   │   │   ├── OpenAIService.ts
│   │   │   ├── MealGenerationService.ts
│   │   │   └── RecipeEnhancementService.ts
│   │   └── notifications/
│   │       ├── EmailService.ts
│   │       └── PushNotificationService.ts
│   ├── models/                   # Data models and schemas
│   │   ├── User.ts
│   │   ├── Recipe.ts
│   │   ├── MealPlan.ts
│   │   ├── Grocery.ts
│   │   └── Household.ts
│   ├── utils/                    # Utility functions
│   │   ├── logger.ts             # Enhanced logging system with multiple transports
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   └── queries.ts
│   │   ├── validation/
│   │   │   ├── schemas.ts
│   │   │   └── validators.ts
│   │   ├── encryption/
│   │   │   ├── hash.ts
│   │   │   └── jwt.ts
│   │   ├── formatters/
│   │   │   ├── response.ts
│   │   │   └── error.ts
│   │   └── helpers/
│   │       ├── calculations.ts
│   │       └── transformers.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── database.ts
│   │   ├── openai.ts
│   │   └── express.ts
│   ├── config/                   # Configuration files
│   │   ├── database.ts
│   │   ├── auth.ts
│   │   ├── openai.ts
│   │   ├── cors.ts
│   │   └── environment.ts
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   │   ├── services/
│   │   ├── utils/
│   │   └── models/
│   ├── integration/              # Integration tests
│   │   ├── routes/
│   │   └── services/
│   ├── fixtures/                 # Test data
│   │   ├── users.json
│   │   ├── recipes.json
│   │   └── mealPlans.json
│   └── helpers/                  # Test utilities
│       ├── setup.ts
│       ├── teardown.ts
│       └── mocks.ts
├── dist/                         # Compiled JavaScript output
├── logs/                         # Application logs
├── package.json                  # Backend dependencies
├── package-lock.json
├── tsconfig.json                 # TypeScript configuration
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── jest.config.js                # Jest test configuration
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── Dockerfile                    # Docker configuration
└── railway.json                  # Railway deployment config
```

## Database Structure

```
database/
├── migrations/                   # Database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_add_households.sql
│   ├── 003_add_recipes.sql
│   ├── 004_add_meal_plans.sql
│   ├── 005_add_sharing.sql
│   └── 006_add_indexes.sql
├── seeds/                        # Sample data
│   ├── 001_households.sql
│   ├── 002_users.sql
│   ├── 003_recipes.sql
│   └── 004_meal_plans.sql
├── functions/                    # Database functions
│   ├── generate_grocery_list.sql
│   ├── update_nutrition.sql
│   └── cleanup_old_plans.sql
├── triggers/                     # Database triggers
│   ├── update_timestamps.sql
│   └── audit_changes.sql
├── policies/                     # Row Level Security policies
│   ├── users_policies.sql
│   ├── recipes_policies.sql
│   ├── meal_plans_policies.sql
│   └── sharing_policies.sql
├── views/                        # Database views
│   ├── user_meal_plans.sql
│   ├── recipe_nutrition.sql
│   └── household_activity.sql
└── scripts/                      # Utility scripts
    ├── backup.sh
    ├── restore.sh
    └── reset_dev_data.sql
```

## GitHub Workflows

```
.github/
├── workflows/                    # GitHub Actions
│   ├── ci.yml                    # Continuous Integration
│   ├── deploy-staging.yml        # Staging deployment
│   ├── deploy-production.yml     # Production deployment
│   ├── test.yml                  # Test automation
│   └── security-scan.yml         # Security scanning
├── ISSUE_TEMPLATE/               # Issue templates
│   ├── bug_report.md
│   ├── feature_request.md
│   └── question.md
├── PULL_REQUEST_TEMPLATE.md      # PR template
└── CODEOWNERS                    # Code ownership rules
```

## Scripts Directory

```
scripts/
├── setup/                        # Setup scripts
│   ├── install-dependencies.sh
│   ├── setup-database.sh
│   └── configure-environment.sh
├── development/                  # Development utilities
│   ├── start-dev.sh
│   ├── reset-database.sh
│   ├── generate-types.sh
│   └── lint-fix.sh
├── deployment/                   # Deployment scripts
│   ├── build-all.sh
│   ├── deploy-frontend.sh
│   ├── deploy-backend.sh
│   └── health-check.sh
├── maintenance/                  # Maintenance scripts
│   ├── backup-database.sh
│   ├── cleanup-logs.sh
│   └── update-dependencies.sh
└── testing/                      # Testing utilities
    ├── run-all-tests.sh
    ├── generate-coverage.sh
    └── load-test.sh
```

## Configuration Files

### Root Level Configuration

```
# .gitignore
node_modules/
dist/
build/
.env
.env.local
.env.production
*.log
.DS_Store
coverage/
.nyc_output/

# .env.example
# Frontend Environment Variables
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:3001

# Backend Environment Variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
PORT=3001
NODE_ENV=development
```

### Package.json Scripts

```json
{
  "name": "meal-planner-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm start",
    "dev:backend": "cd backend && npm run dev",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm test",
    "test:backend": "cd backend && npm test",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint",
    "setup": "./scripts/setup/install-dependencies.sh",
    "db:migrate": "cd database && supabase db push",
    "db:reset": "cd database && supabase db reset",
    "generate:types": "./scripts/development/generate-types.sh"
  }
}
```

## File Naming Conventions

### Components
- **React Components**: PascalCase (`UserProfile.tsx`)
- **Component Files**: Include component, test, styles, and index
- **Component Directories**: PascalCase matching component name

### Services and Utilities
- **Service Classes**: PascalCase with "Service" suffix (`AuthService.ts`)
- **Utility Functions**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Database
- **Tables**: snake_case (`meal_plans`)
- **Columns**: snake_case (`created_at`)
- **Migration Files**: Numbered with descriptive names (`001_initial_schema.sql`)

### API Routes
- **Route Files**: camelCase (`mealPlans.ts`)
- **Endpoint Paths**: kebab-case (`/api/meal-plans`)

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/meal-planning-ui

# Start development servers
npm run dev

# Make changes and test
npm run test

# Lint and format
npm run lint
```

### 2. Database Changes
```bash
# Create migration
supabase migration new add_user_preferences

# Apply migration locally
npm run db:migrate

# Generate new types
npm run generate:types
```

### 3. Deployment
```bash
# Build all applications
npm run build

# Run tests
npm run test

# Deploy (handled by CI/CD)
git push origin main
```

This project structure provides a comprehensive organization that supports scalability, maintainability, and clear separation of concerns across all aspects of the Meal Planner App.
