# GitHub Actions Workflow Fixes

## Overview

This document summarizes the fixes applied to resolve GitHub Actions workflow failures in the Meal Planning App CI/CD pipeline.

## Issues Identified

### 1. Missing Scripts in package.json
The CI workflow was calling scripts that didn't exist in the package.json files:
- `npm run test` instead of `npm run test:run` (frontend)
- Missing `type-check` scripts in both frontend and backend

### 2. Environment Variables for Build
The frontend build was failing due to missing environment variables required by Vite.

### 3. Cache Configuration
The npm cache wasn't properly configured for the monorepo structure with separate frontend and backend directories.

### 4. GitHub Actions Syntax Errors
The deploy workflow had incorrect conditional syntax for checking secrets.

## Fixes Applied

### 1. Updated CI Workflow (.github/workflows/ci.yml)

**Fixed npm cache configuration:**
```yaml
- name: Setup Node.js ${{ matrix.node-version }}
  uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: 'npm'
    cache-dependency-path: |
      frontend/package-lock.json
      backend/package-lock.json
```

**Fixed test commands:**
```yaml
- name: Test frontend
  run: |
    cd frontend
    npm run test:run  # Changed from npm run test

- name: Test backend
  run: |
    cd backend
    npm run test
```

**Added environment variables for frontend build:**
```yaml
- name: Build frontend
  run: |
    cd frontend
    npm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL || 'https://placeholder.supabase.co' }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY || 'placeholder-key' }}
    VITE_API_URL: ${{ secrets.VITE_API_URL || 'http://localhost:3001' }}
```

### 2. Updated Deploy Workflow (.github/workflows/deploy.yml)

**Simplified workflow structure:**
- Separated build-and-test from deployment
- Added artifact upload/download for build outputs
- Used environment protection for deployment jobs
- Removed problematic conditional syntax

**Fixed deployment jobs:**
```yaml
deploy-frontend:
  needs: build-and-test
  runs-on: ubuntu-latest
  environment: production  # Uses GitHub environment protection
  
deploy-backend:
  needs: build-and-test
  runs-on: ubuntu-latest
  environment: production  # Uses GitHub environment protection
```

**Added build artifact management:**
```yaml
- name: Upload frontend build
  uses: actions/upload-artifact@v4
  with:
    name: frontend-build
    path: frontend/dist/

- name: Download frontend build
  uses: actions/download-artifact@v4
  with:
    name: frontend-build
    path: frontend/dist/
```

## Required GitHub Secrets

For the workflows to function properly, the following secrets need to be configured in the GitHub repository:

### Frontend Deployment (Vercel)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_URL` - Backend API URL
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

### Backend Deployment (Railway)
- `RAILWAY_TOKEN` - Railway deployment token
- `RAILWAY_SERVICE` - Railway service name

### Health Checks
- `FRONTEND_URL` - Deployed frontend URL
- `BACKEND_URL` - Deployed backend URL

## Environment Protection

The deploy workflow now uses GitHub environment protection (`environment: production`) which provides:
- **Manual approval gates** - Require approval before deployment
- **Environment-specific secrets** - Separate secrets for different environments
- **Deployment history** - Track all deployments
- **Branch protection** - Only deploy from specific branches

## Testing the Fixes

### Local Testing
```bash
# Test frontend build with environment variables
cd frontend
VITE_SUPABASE_URL=https://test.supabase.co npm run build

# Test backend build
cd backend
npm run build

# Run tests
cd frontend && npm run test:run
cd backend && npm run test
```

### CI Testing
1. Push changes to a feature branch
2. Create a pull request to trigger CI workflow
3. Verify all jobs pass:
   - lint-and-build (Node 18.x and 20.x)
   - security-audit
   - dependency-check

### Deployment Testing
1. Merge to main branch to trigger deploy workflow
2. Verify build-and-test job completes
3. Check that deployment jobs wait for environment approval
4. Approve deployment in GitHub Actions UI
5. Verify health checks pass

## Troubleshooting

### Common Issues

**1. npm ci fails**
- Ensure package-lock.json files exist in both frontend and backend directories
- Check Node.js version compatibility

**2. Build fails with environment variable errors**
- Verify all required secrets are configured in GitHub repository settings
- Check that environment variable names match exactly (case-sensitive)

**3. Deployment jobs don't run**
- Ensure GitHub environment "production" is created
- Check that required secrets are configured in the environment
- Verify branch protection rules allow deployment

**4. Health checks fail**
- Ensure deployed applications are actually running
- Check that health endpoints exist and return 200 status
- Verify URLs in secrets are correct and accessible

### Debug Commands

```bash
# Check workflow syntax
gh workflow view ci.yml
gh workflow view deploy.yml

# View workflow runs
gh run list

# View specific run details
gh run view <run-id>

# Check repository secrets
gh secret list
```

## Best Practices Implemented

1. **Fail Fast**: Tests run before builds to catch issues early
2. **Artifact Management**: Build outputs are preserved and reused
3. **Environment Separation**: Production deployments are protected
4. **Fallback Values**: Environment variables have sensible defaults
5. **Health Monitoring**: Automated health checks after deployment
6. **Matrix Testing**: Test against multiple Node.js versions
7. **Security Auditing**: Automated dependency vulnerability scanning

## Next Steps

1. **Set up GitHub environments** in repository settings
2. **Configure required secrets** for deployment
3. **Test the complete pipeline** with a small change
4. **Monitor deployment success** and health check results
5. **Add notification integrations** (Slack, email) for deployment status

This fix ensures reliable CI/CD pipeline operation with proper error handling, security, and deployment protection.
