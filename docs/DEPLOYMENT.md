# Deployment Guide

## Overview

This document provides comprehensive deployment instructions for the Meal Planner App across different environments and platforms.

## Environment Overview

### Development
- **Purpose**: Local development and testing
- **Database**: Local Supabase instance or development project
- **API**: Local Node.js server
- **Frontend**: React development server

### Staging
- **Purpose**: Pre-production testing and QA
- **Database**: Staging Supabase project
- **API**: Deployed to staging environment
- **Frontend**: Deployed to staging CDN

### Production
- **Purpose**: Live application for end users
- **Database**: Production Supabase project
- **API**: Production deployment with load balancing
- **Frontend**: Production CDN with global distribution

## Prerequisites

### Required Accounts & Services
- **Supabase**: Database and authentication
- **OpenAI**: AI API access
- **Vercel/Netlify**: Frontend hosting (recommended)
- **Railway/Heroku**: Backend hosting (recommended)
- **GitHub**: Source code repository
- **Domain Provider**: Custom domain (optional)

### Required Tools
- Node.js 18+
- Git
- Docker (optional)
- Supabase CLI
- Vercel CLI or Netlify CLI

## Supabase Setup

### 1. Create Supabase Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (or use Supabase dashboard)
supabase projects create meal-planner-app
```

### 2. Database Setup

```bash
# Initialize Supabase in your project
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts
```

### 3. Authentication Configuration

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000`
   - Staging: `https://staging.yourdomain.com`
   - Production: `https://yourdomain.com`

#### Supabase Auth Configuration
```sql
-- In Supabase SQL Editor
-- Enable Google provider
UPDATE auth.config 
SET google_enabled = true,
    google_client_id = 'your-google-client-id',
    google_secret = 'your-google-client-secret';
```

### 4. Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_shares ENABLE ROW LEVEL SECURITY;

-- Apply policies (see DATABASE.md for complete policies)
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Add all other policies from DATABASE.md
```

## Environment Configuration

### Frontend Environment Variables

#### Development (.env.local)
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

#### Staging (.env.staging)
```bash
REACT_APP_SUPABASE_URL=https://staging-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=staging-anon-key
REACT_APP_API_URL=https://api-staging.yourdomain.com
REACT_APP_ENVIRONMENT=staging
```

#### Production (.env.production)
```bash
REACT_APP_SUPABASE_URL=https://prod-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=prod-anon-key
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
```

### Backend Environment Variables

#### Development (.env)
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4

# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-development-jwt-secret
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Production (.env.production)
```bash
# Supabase
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_KEY=prod-service-key

# OpenAI
OPENAI_API_KEY=prod-openai-key
OPENAI_MODEL=gpt-4

# Server
PORT=3001
NODE_ENV=production

# Security
JWT_SECRET=secure-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=50

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd frontend
vercel

# Set environment variables in Vercel dashboard
# or use CLI
vercel env add REACT_APP_SUPABASE_URL production
vercel env add REACT_APP_SUPABASE_ANON_KEY production
vercel env add REACT_APP_API_URL production
```

#### vercel.json Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd frontend
netlify deploy --prod --dir=build
```

#### netlify.toml Configuration
```toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 3: AWS S3 + CloudFront

#### Build and Deploy Script
```bash
#!/bin/bash
# deploy-frontend.sh

# Build the application
npm run build

# Sync to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"

echo "Frontend deployed successfully!"
```

## Backend Deployment

### Option 1: Railway (Recommended)

#### Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### railway.json Configuration
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option 2: Heroku

#### Setup
```bash
# Install Heroku CLI
# Create Heroku app
heroku create meal-planner-api

# Set environment variables
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_SERVICE_KEY=your-key
heroku config:set OPENAI_API_KEY=your-key

# Deploy
git push heroku main
```

#### Procfile
```
web: npm start
```

#### package.json Scripts
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "postinstall": "npm run build"
  }
}
```

### Option 3: Docker Deployment

#### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["npm", "start"]
```

#### docker-compose.yml (for local development)
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_SUPABASE_URL=${REACT_APP_SUPABASE_URL}
      - REACT_APP_SUPABASE_ANON_KEY=${REACT_APP_SUPABASE_ANON_KEY}
      - REACT_APP_API_URL=http://localhost:3001
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm start
```

## CI/CD Pipeline

### GitHub Actions

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd frontend && npm ci
          cd ../backend && npm ci

      - name: Run linting
        run: |
          npm run lint:frontend
          npm run lint:backend

      - name: Run tests
        run: |
          npm run test:frontend
          npm run test:backend

      - name: Build applications
        run: |
          npm run build:frontend
          npm run build:backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Build frontend
        run: cd frontend && npm run build
        env:
          REACT_APP_SUPABASE_URL: ${{ secrets.REACT_APP_SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.REACT_APP_SUPABASE_ANON_KEY }}
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: '--prod'

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Build backend
        run: cd backend && npm run build

      - name: Deploy to Railway
        uses: railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: meal-planner-api
```

### Staging Deployment

#### .github/workflows/staging.yml
```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install and build
        run: |
          npm ci
          npm run build

      - name: Deploy frontend to staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_STAGING_PROJECT_ID }}
          working-directory: ./frontend

      - name: Deploy backend to staging
        uses: railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
          service: meal-planner-api-staging
```

## Database Migrations

### Migration Strategy

```bash
# Create migration
supabase migration new add_user_preferences

# Write migration SQL
# migrations/20240727000001_add_user_preferences.sql

# Test migration locally
supabase db reset

# Apply to staging
supabase db push --project-ref staging-project-ref

# Apply to production
supabase db push --project-ref prod-project-ref
```

### Backup Strategy

```bash
#!/bin/bash
# backup-database.sh

# Create backup
supabase db dump --project-ref $PROJECT_REF > backup-$(date +%Y%m%d-%H%M%S).sql

# Upload to S3 (optional)
aws s3 cp backup-*.sql s3://your-backup-bucket/database-backups/
```

## Monitoring & Logging

### Application Monitoring

#### Sentry Integration
```typescript
// src/monitoring/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export { Sentry };
```

#### Health Checks
```typescript
// src/routes/health.ts
import { Router } from 'express';
import { supabase } from '../services/supabase';
import { openai } from '../services/openai';

const router = Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    services: {}
  };

  try {
    // Check Supabase
    await supabase.from('users').select('count').limit(1);
    health.services.supabase = 'connected';
  } catch (error) {
    health.services.supabase = 'disconnected';
    health.status = 'degraded';
  }

  try {
    // Check OpenAI
    await openai.models.list();
    health.services.openai = 'connected';
  } catch (error) {
    health.services.openai = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
```

### Logging Configuration

```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'meal-planner-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export { logger };
```

## Security Considerations

### SSL/TLS Configuration

```nginx
# nginx.conf for custom server deployment
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Security

```bash
# Use secrets management
# Never commit .env files to git

# Add to .gitignore
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# Use environment-specific secrets
# Development: Local .env files
# Staging/Production: Platform secret management
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```typescript
// Ensure CORS is properly configured
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true
}));
```

#### 2. Database Connection Issues
```typescript
// Check Supabase connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) throw error;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};
```

#### 3. OpenAI API Errors
```typescript
// Implement retry logic
const retryOpenAI = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.status === 429) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryOpenAI(fn, retries - 1);
    }
    throw error;
  }
};
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Error tracking setup
- [ ] Performance monitoring active
- [ ] Security headers configured
- [ ] Rate limiting enabled

This deployment guide provides comprehensive instructions for deploying the Meal Planner App across different environments and platforms, ensuring a smooth and secure deployment process.
