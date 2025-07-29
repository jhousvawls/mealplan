# Development Runbook - MealMate

## Overview

This is your personal development guide for working on MealMate. Use this for daily development tasks, common workflows, and when you return to the project after time away.

## Quick Start Commands

### Start Development Environment
```bash
# Terminal 1: Start Backend
cd backend
npm run dev
# Backend runs on http://localhost:3001

# Terminal 2: Start Frontend  
cd frontend
npm run dev
# Frontend runs on http://localhost:5177 (or next available port)
```

### Health Check Everything
```bash
# Check backend health
curl http://localhost:3001/api/health

# Check frontend is running
curl http://localhost:5177

# Test API connectivity from frontend
# (Open browser console on http://localhost:5177)
fetch('http://localhost:3001/api/health').then(r => r.json()).then(console.log)
```

## Daily Development Workflow

### 1. Starting Work
```bash
# Pull latest changes
git pull origin main

# Check if dependencies need updating
cd frontend && npm install
cd ../backend && npm install

# Start development servers
npm run dev  # (from root, if you have a root script)
# OR start individually as shown above
```

### 2. Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes...

# Test your changes
cd frontend && npm test
cd ../backend && npm test

# Check TypeScript compilation
cd frontend && npm run build
cd ../backend && npm run build
```

### 3. Testing Changes
```bash
# Run all tests
cd frontend && npm test
cd ../backend && npm test

# Test specific component
cd frontend && npm test -- RecipeImportModal

# Test with coverage
cd frontend && npm run test:coverage
cd ../backend && npm test -- --coverage
```

### 4. Committing Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add recipe text parsing with AI"

# Push to remote
git push origin feature/your-feature-name
```

## Common Development Tasks

### Adding a New Component

1. **Create component file:**
   ```bash
   # Create component directory
   mkdir -p frontend/src/components/features/your-feature
   
   # Create component files
   touch frontend/src/components/features/your-feature/YourComponent.tsx
   touch frontend/src/components/features/your-feature/index.ts
   ```

2. **Component template:**
   ```tsx
   // YourComponent.tsx
   import React from 'react';
   
   interface YourComponentProps {
     // Define props here
   }
   
   export const YourComponent: React.FC<YourComponentProps> = ({
     // Destructure props
   }) => {
     return (
       <div className="your-component">
         {/* Component content */}
       </div>
     );
   };
   ```

3. **Export from index:**
   ```tsx
   // index.ts
   export { YourComponent } from './YourComponent';
   ```

4. **Add to main exports:**
   ```tsx
   // Update frontend/src/components/features/index.ts
   export * from './your-feature';
   ```

### Adding a New API Endpoint

1. **Create route handler:**
   ```bash
   # Add to existing route file or create new one
   # backend/src/routes/your-route.ts
   ```

2. **Route template:**
   ```typescript
   import { Router, Request, Response } from 'express';
   import { asyncHandler } from '../middleware/errorHandler';
   
   const router = Router();
   
   router.get('/your-endpoint', asyncHandler(async (req: Request, res: Response) => {
     // Your logic here
     res.status(200).json({
       success: true,
       data: { /* your data */ }
     });
   }));
   
   export { router as yourRoutes };
   ```

3. **Register route:**
   ```typescript
   // backend/src/index.ts
   import { yourRoutes } from './routes/your-route';
   app.use('/api/your-path', yourRoutes);
   ```

4. **Test endpoint:**
   ```bash
   curl http://localhost:3001/api/your-path/your-endpoint
   ```

### Adding a Database Migration

1. **Create migration file:**
   ```bash
   # Create new migration file
   touch database/migrations/005_your_migration.sql
   ```

2. **Migration template:**
   ```sql
   -- 005_your_migration.sql
   -- Description: Add your description here
   
   -- Add new table
   CREATE TABLE your_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Add indexes
   CREATE INDEX idx_your_table_name ON your_table(name);
   
   -- Add RLS policies
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own records" ON your_table
     FOR SELECT USING (auth.uid() = user_id);
   ```

3. **Apply migration:**
   ```bash
   # Copy migration content to Supabase SQL Editor
   # Or use Supabase CLI if configured
   ```

### Debugging Common Issues

#### Frontend Issues

**Component not rendering:**
```bash
# Check console for errors
# Open browser dev tools → Console

# Check if component is exported
grep -r "YourComponent" frontend/src/components/

# Check import paths
grep -r "import.*YourComponent" frontend/src/
```

**API calls failing:**
```bash
# Check network tab in browser dev tools
# Verify backend is running
curl http://localhost:3001/api/health

# Check CORS issues
grep -A 10 "allowedOrigins" backend/src/index.ts
```

**TypeScript errors:**
```bash
# Check TypeScript compilation
cd frontend && npx tsc --noEmit

# Check specific file
cd frontend && npx tsc --noEmit src/components/YourComponent.tsx
```

#### Backend Issues

**Server won't start:**
```bash
# Check if port is in use
lsof -i :3001

# Check environment variables
cd backend && node -e "require('dotenv').config(); console.log(Object.keys(process.env).filter(k => k.includes('SUPABASE')))"

# Check for syntax errors
cd backend && npx tsc --noEmit
```

**API endpoints not working:**
```bash
# Check route registration
grep -r "your-endpoint" backend/src/

# Check middleware order
grep -A 5 -B 5 "app.use" backend/src/index.ts

# Test with verbose curl
curl -v http://localhost:3001/api/your-endpoint
```

**Database connection issues:**
```bash
# Check Supabase connection
curl -H "apikey: YOUR_ANON_KEY" \
     "https://YOUR_PROJECT.supabase.co/rest/v1/users?select=id&limit=1"
```

## Environment Management

### Environment Variables

**Frontend (.env.local):**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:3001
```

**Backend (.env):**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
PORT=3001
NODE_ENV=development
LOG_LEVEL=INFO
```

### Switching Environments

**Development → Staging:**
```bash
# Update environment variables
cp .env.staging .env  # backend
cp .env.staging .env.local  # frontend

# Restart servers
```

**Check Current Environment:**
```bash
# Backend
curl http://localhost:3001/api/health | jq '.data.environment'

# Frontend
echo $VITE_API_URL
```

## Testing Workflows

### Running Tests

**All Tests:**
```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test

# Run both with coverage
cd frontend && npm run test:coverage
cd backend && npm test -- --coverage
```

**Specific Tests:**
```bash
# Test specific component
cd frontend && npm test -- RecipeImportModal

# Test specific API route
cd backend && npm test -- health.test.ts

# Watch mode for development
cd frontend && npm test -- --watch
```

### Writing Tests

**Component Test Template:**
```tsx
// YourComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TestWrapper } from '../../../__tests__/utils/test-utils';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  test('renders correctly', () => {
    render(
      <TestWrapper>
        <YourComponent />
      </TestWrapper>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  test('handles user interaction', async () => {
    render(
      <TestWrapper>
        <YourComponent />
      </TestWrapper>
    );
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

**API Test Template:**
```typescript
// your-route.test.ts
import request from 'supertest';
import app from '../index';

describe('Your Route', () => {
  test('GET /api/your-endpoint returns success', async () => {
    const response = await request(app)
      .get('/api/your-endpoint')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});
```

## Performance Monitoring

### Frontend Performance

**Bundle Analysis:**
```bash
cd frontend
npm run build
npx vite-bundle-analyzer dist
```

**Runtime Performance:**
```javascript
// Browser console
console.time('Component Render');
// ... component renders
console.timeEnd('Component Render');

// Memory usage
console.log(performance.memory);
```

### Backend Performance

**Response Times:**
```bash
# Time API calls
time curl http://localhost:3001/api/health

# Detailed system info
curl http://localhost:3001/api/health/detailed | jq '.data.system'
```

**Memory Monitoring:**
```bash
# Watch memory usage
watch -n 5 'curl -s http://localhost:3001/api/health/detailed | jq ".data.system.memory"'
```

## Deployment Preparation

### Pre-deployment Checklist

```bash
# 1. Run all tests
cd frontend && npm test
cd ../backend && npm test

# 2. Build for production
cd frontend && npm run build
cd ../backend && npm run build

# 3. Check for TypeScript errors
cd frontend && npx tsc --noEmit
cd ../backend && npx tsc --noEmit

# 4. Check for linting issues
cd frontend && npm run lint
cd ../backend && npm run lint

# 5. Test production build locally
cd frontend && npm run preview
```

### Environment Setup for Deployment

**Production Environment Variables:**
```bash
# Frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_API_URL=https://your-api-domain.com

# Backend
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_production_service_key
OPENAI_API_KEY=your_openai_key
PORT=3001
NODE_ENV=production
LOG_LEVEL=INFO
```

## Troubleshooting Guide

### "Cannot connect to backend"
1. Check if backend is running: `curl http://localhost:3001/api/health`
2. Check CORS configuration in `backend/src/index.ts`
3. Verify frontend port is in allowed origins
4. Check browser console for specific errors

### "Recipe parsing not working"
1. Check recipe parser health: `curl http://localhost:3001/api/recipes/health`
2. Try text parsing instead of URL parsing
3. Check OpenAI API key is configured
4. Verify Puppeteer can launch browser

### "Database connection failed"
1. Check Supabase credentials in `.env`
2. Verify RLS policies are correct
3. Check if user is authenticated
4. Test direct Supabase connection

### "Tests failing"
1. Check if test database is set up
2. Verify mock data is correct
3. Check for async/await issues
4. Ensure test environment is isolated

## Useful Commands Reference

### Git Workflows
```bash
# Create feature branch
git checkout -b feature/your-feature

# Interactive rebase to clean up commits
git rebase -i HEAD~3

# Squash commits
git reset --soft HEAD~3
git commit -m "feat: combined feature implementation"

# Update branch with latest main
git checkout main && git pull
git checkout feature/your-feature
git rebase main
```

### Package Management
```bash
# Add new dependency
cd frontend && npm install package-name
cd backend && npm install package-name

# Add dev dependency
npm install -D package-name

# Update all dependencies
npm update

# Check for outdated packages
npm outdated
```

### Database Operations
```bash
# Backup database (if using local Postgres)
pg_dump your_database > backup.sql

# Reset development data
# (Copy reset script to Supabase SQL Editor)

# Check table structure
# (Use Supabase dashboard → Table Editor)
```

This development runbook should cover most of your daily development needs and serve as a quick reference when working on MealMate.
