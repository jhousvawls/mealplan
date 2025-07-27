# Development Guidelines

## Overview

This document outlines development standards, best practices, and workflows for the Meal Planner App project.

## Development Environment Setup

### Prerequisites

- **Node.js**: Version 18+ (LTS recommended)
- **npm**: Version 8+ or **yarn**: Version 1.22+
- **Git**: Version 2.30+
- **Visual Studio Code**: Latest version (recommended)
- **Supabase CLI**: For database management
- **Docker**: Optional, for containerized development

### Required VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json",
    "supabase.supabase-vscode",
    "ms-playwright.playwright"
  ]
}
```

### Environment Configuration

#### Frontend (.env.local)
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Development Settings
REACT_APP_ENVIRONMENT=development
REACT_APP_LOG_LEVEL=debug
```

#### Backend (.env)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

## Code Standards

### TypeScript Configuration

#### Frontend (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/services/*": ["services/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

#### Backend (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/routes/*": ["routes/*"],
      "@/services/*": ["services/*"],
      "@/middleware/*": ["middleware/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### ESLint Configuration

#### Shared (.eslintrc.js)
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Code Quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    
    // TypeScript Specific
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Import Organization
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
  },
};
```

### Prettier Configuration

#### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## Naming Conventions

### Files and Directories
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with "use" prefix (`useAuth.ts`)
- **Services**: camelCase (`apiService.ts`)
- **Utils**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`UserTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Variables and Functions
```typescript
// Variables: camelCase
const userName = 'john_doe';
const isAuthenticated = true;

// Functions: camelCase with descriptive verbs
const getUserProfile = async (userId: string) => { };
const validateEmail = (email: string) => { };

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;

// Types/Interfaces: PascalCase
interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
```

### Database Naming
- **Tables**: snake_case (`meal_plans`, `planned_meals`)
- **Columns**: snake_case (`user_id`, `created_at`)
- **Indexes**: `idx_table_column` (`idx_users_email`)
- **Functions**: snake_case (`generate_grocery_list`)

## Component Architecture

### React Component Structure

```typescript
// UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { User } from '@/types/UserTypes';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';
import './UserProfile.css';

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  onUpdate,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleUpdate = async (updates: Partial<User>) => {
    try {
      const updatedUser = await userService.updateUser(userId, updates);
      setUser(updatedUser);
      onUpdate?.(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
};

export default UserProfile;
```

### Custom Hooks Pattern

```typescript
// useAuth.ts
import { useState, useEffect, useContext, createContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn: async () => {}, // Implement if needed
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Service Layer Pattern

```typescript
// userService.ts
import { supabase } from './supabase';
import { User, UserProfile } from '@/types/UserTypes';

class UserService {
  async getUser(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(`Failed to fetch user: ${error.message}`);
    return data;
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }

  async createUserProfile(user: User): Promise<UserProfile> {
    const profile: Partial<UserProfile> = {
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
    };

    const { data, error } = await supabase
      .from('users')
      .insert(profile)
      .select()
      .single();

    if (error) throw new Error(`Failed to create profile: ${error.message}`);
    return data;
  }
}

export const userService = new UserService();
```

## Testing Standards

### Unit Testing with Jest

```typescript
// UserProfile.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';
import { userService } from '@/services/userService';

// Mock the service
jest.mock('@/services/userService');
const mockUserService = userService as jest.Mocked<typeof userService>;

// Mock the auth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    currentUser: { id: 'test-user-id' },
  }),
}));

describe('UserProfile', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user profile when data is loaded', async () => {
    mockUserService.getUser.mockResolvedValue(mockUser);

    render(<UserProfile userId="test-user-id" />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    expect(mockUserService.getUser).toHaveBeenCalledWith('test-user-id');
  });

  it('handles update user action', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    mockUserService.getUser.mockResolvedValue(mockUser);
    mockUserService.updateUser.mockResolvedValue({
      ...mockUser,
      full_name: 'Updated Name',
    });

    render(<UserProfile userId="test-user-id" onUpdate={onUpdate} />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    const nameInput = screen.getByDisplayValue('Test User');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({
        ...mockUser,
        full_name: 'Updated Name',
      });
    });
  });

  it('displays error message when user fetch fails', async () => {
    mockUserService.getUser.mockRejectedValue(new Error('User not found'));

    render(<UserProfile userId="invalid-id" />);

    await waitFor(() => {
      expect(screen.getByText('Error: User not found')).toBeInTheDocument();
    });
  });
});
```

### Integration Testing

```typescript
// mealPlanning.integration.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MealPlanningPage } from '@/pages/MealPlanningPage';
import { createMockSupabaseClient } from '@/test-utils/mockSupabase';

describe('Meal Planning Integration', () => {
  it('should complete full meal planning workflow', async () => {
    const user = userEvent.setup();
    
    render(<MealPlanningPage />);

    // 1. Create new meal plan
    const createPlanButton = screen.getByRole('button', { name: /create plan/i });
    await user.click(createPlanButton);

    const planNameInput = screen.getByLabelText(/plan name/i);
    await user.type(planNameInput, 'Week of July 21');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    // 2. Add meal to plan
    await waitFor(() => {
      expect(screen.getByText('Week of July 21')).toBeInTheDocument();
    });

    const mondayDinner = screen.getByTestId('monday-dinner-slot');
    await user.click(mondayDinner);

    const addMealButton = screen.getByRole('button', { name: /add meal/i });
    await user.click(addMealButton);

    // 3. Generate AI suggestions
    const aiSuggestButton = screen.getByRole('button', { name: /ai suggest/i });
    await user.click(aiSuggestButton);

    await waitFor(() => {
      expect(screen.getByText(/suggested meals/i)).toBeInTheDocument();
    });

    // 4. Select and save meal
    const firstSuggestion = screen.getByTestId('meal-suggestion-0');
    await user.click(firstSuggestion);

    const saveMealButton = screen.getByRole('button', { name: /save meal/i });
    await user.click(saveMealButton);

    // 5. Verify meal is added to plan
    await waitFor(() => {
      expect(mondayDinner).toHaveTextContent(/chicken stir fry/i);
    });
  });
});
```

### API Testing

```typescript
// api.test.ts
import request from 'supertest';
import { app } from '@/app';
import { createMockJWT } from '@/test-utils/auth';

describe('API Endpoints', () => {
  const validToken = createMockJWT({ userId: 'test-user-id' });

  describe('POST /api/generate-meals', () => {
    it('should generate meals with valid preferences', async () => {
      const preferences = {
        cuisine: 'Italian',
        meal_type: 'dinner',
        servings: 4,
      };

      const response = await request(app)
        .post('/api/generate-meals')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ preferences, count: 2 })
        .expect(200);

      expect(response.body.meals).toHaveLength(2);
      expect(response.body.meals[0]).toHaveProperty('name');
      expect(response.body.meals[0]).toHaveProperty('ingredients');
      expect(response.body.meals[0]).toHaveProperty('instructions');
    });

    it('should return 401 for missing authorization', async () => {
      await request(app)
        .post('/api/generate-meals')
        .send({ preferences: {}, count: 1 })
        .expect(401);
    });

    it('should return 400 for invalid preferences', async () => {
      await request(app)
        .post('/api/generate-meals')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ preferences: null })
        .expect(400);
    });
  });
});
```

## Git Workflow

### Branch Naming Convention

- **Feature branches**: `feature/meal-planning-ui`
- **Bug fixes**: `bugfix/auth-redirect-issue`
- **Hotfixes**: `hotfix/security-patch`
- **Release branches**: `release/v1.2.0`

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add Google OAuth integration

- Implement Google sign-in flow
- Add user profile creation
- Update authentication context

Closes #123
```

```
fix(api): handle rate limiting errors

- Add exponential backoff for OpenAI API calls
- Improve error messages for rate limits
- Add retry mechanism with max attempts

Fixes #456
```

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No console.log statements left in code

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Closes #(issue number)
```

## Performance Guidelines

### Frontend Performance

#### Code Splitting
```typescript
// Lazy load route components
const MealPlanningPage = lazy(() => import('@/pages/MealPlanningPage'));
const RecipeBoxPage = lazy(() => import('@/pages/RecipeBoxPage'));

// Lazy load heavy components
const AIRecipeGenerator = lazy(() => import('@/components/AIRecipeGenerator'));
```

#### Memoization
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateNutritionTotals(recipes);
}, [recipes]);

// Memoize callback functions
const handleRecipeUpdate = useCallback((recipeId: string, updates: Partial<Recipe>) => {
  updateRecipe(recipeId, updates);
}, [updateRecipe]);

// Memoize components
const RecipeCard = memo(({ recipe, onUpdate }: RecipeCardProps) => {
  return <div>{/* Component content */}</div>;
});
```

#### Virtual Scrolling
```typescript
// For large lists of recipes or meal plans
import { FixedSizeList as List } from 'react-window';

const RecipeList = ({ recipes }: { recipes: Recipe[] }) => (
  <List
    height={600}
    itemCount={recipes.length}
    itemSize={120}
    itemData={recipes}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <RecipeCard recipe={data[index]} />
      </div>
    )}
  </List>
);
```

### Backend Performance

#### Database Query Optimization
```typescript
// Use select to limit returned fields
const recipes = await supabase
  .from('recipes')
  .select('id, name, prep_time, cuisine')
  .eq('owner_id', userId)
  .order('created_at', { ascending: false })
  .limit(20);

// Use indexes for common queries
// CREATE INDEX idx_recipes_owner_cuisine ON recipes(owner_id, cuisine);

// Batch operations when possible
const { data, error } = await supabase
  .from('planned_meals')
  .insert(plannedMeals); // Insert multiple records at once
```

#### Caching Strategy
```typescript
// Redis caching for AI responses
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const getCachedMealSuggestions = async (preferencesHash: string) => {
  const cached = await redis.get(`meals:${preferencesHash}`);
  return cached ? JSON.parse(cached) : null;
};

const cacheMealSuggestions = async (preferencesHash: string, meals: any[]) => {
  await redis.setex(`meals:${preferencesHash}`, 3600, JSON.stringify(meals));
};
```

## Security Guidelines

### Input Validation
```typescript
// Use Zod for runtime type checking
import { z } from 'zod';

const CreateRecipeSchema = z.object({
  name: z.string().min(1).max(100),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    amount: z.string().min(1),
    unit: z.string().optional(),
  })),
  instructions: z.string().min(10),
  prep_time: z.string().optional(),
  cuisine: z.string().optional(),
});

// Validate in API endpoints
app.post('/api/recipes', async (req, res) => {
  try {
    const validatedData = CreateRecipeSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    return res.status(400).json({ error: 'Invalid input data' });
  }
});
```

### Environment Variables
```typescript
// Use a configuration service
class Config {
  static get supabaseUrl(): string {
    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error('SUPABASE_URL is required');
    return url;
  }

  static get openaiApiKey(): string {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is required');
    return key;
  }

  static get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const aiEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many AI requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/generate-meals', aiEndpointLimiter);
```

## Deployment Guidelines

### Build Process
```json
{
  "scripts": {
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm test",
    "test:backend": "cd backend && npm test",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "lint:frontend": "cd frontend && npm run lint",
    "lint:backend": "cd backend && npm run lint"
  }
}
```

### Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deployment commands
```

This development documentation provides comprehensive guidelines for maintaining code quality, consistency, and best practices throughout the project lifecycle.
