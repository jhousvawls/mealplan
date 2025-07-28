# Backend Implementation Guide

## Overview

The MealMate backend is a Node.js/Express API server that provides real recipe parsing capabilities with intelligent image selection. It replaces the mock API with a production-ready service that can parse recipes from major food websites.

## Architecture

### Tech Stack
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and development experience
- **Puppeteer** - Web scraping and browser automation
- **Cheerio** - Server-side HTML parsing
- **Sharp** - Image processing (future use)
- **AWS SDK** - Cloud storage integration (future use)

### Project Structure

```
backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Recipe, image, and API types
│   ├── routes/               # API route handlers
│   │   ├── health.ts         # Health check endpoints
│   │   ├── recipe.ts         # Recipe parsing endpoints
│   │   └── image.ts          # Image processing endpoints
│   ├── services/             # Business logic services
│   │   └── recipeParser.ts   # Core recipe parsing engine
│   ├── middleware/           # Express middleware
│   │   └── errorHandler.ts   # Error handling and logging
│   └── utils/                # Utility functions
│       └── logger.ts         # Structured logging service
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variables template
└── README.md                 # Backend-specific documentation
```

## Core Features

### 1. Multi-Strategy Recipe Parsing

The recipe parser uses a 4-tier approach to extract recipe data:

#### Tier 1: JSON-LD Structured Data
- Parses industry-standard recipe markup
- Supports Schema.org Recipe format
- Highest accuracy and completeness

#### Tier 2: Microdata Parsing
- Extracts microdata attributes
- Fallback for sites without JSON-LD
- Good accuracy for basic recipe data

#### Tier 3: Site-Specific Scrapers
- Custom selectors for major recipe sites
- Optimized for specific website layouts
- Covers AllRecipes, Food Network, Bon Appétit, Serious Eats, Tasty

#### Tier 4: Generic Fallback
- Universal parsing for any recipe site
- Uses common CSS selectors
- Basic extraction for unsupported sites

### 2. Intelligent Image Processing

#### Image Discovery
- Scans pages for recipe-related images
- Uses multiple CSS selectors and context clues
- Converts relative URLs to absolute URLs

#### Quality Scoring Algorithm
```typescript
Base Score: 50 points
+ Resolution indicators (1200px+): +30 points
+ Quality keywords (HD, high): +15 points
+ Good alt text (10+ chars): +10 points
+ Recipe/food keywords: +5 points
+ Preferred formats (WebP): +10 points
- Thumbnail indicators: -20 points
```

#### Image Classification
- **Hero**: Main recipe photos
- **Step**: Cooking process images
- **Ingredient**: Ingredient layout photos
- **Gallery**: Additional recipe photos

### 3. Comprehensive Error Handling

#### Error Types
- **Validation Errors** (400): Invalid input data
- **Parsing Errors** (422): Unable to extract recipe
- **Timeout Errors** (408): Request timeout
- **Rate Limit Errors** (429): Too many requests
- **Server Errors** (500): Internal server issues

#### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "PARSING_FAILED",
    "message": "Could not extract recipe from URL",
    "timestamp": "2025-01-28T01:30:00.000Z",
    "path": "/api/recipes/parse"
  }
}
```

## API Endpoints

### Recipe Parsing

#### Parse Recipe from URL
```http
POST /api/recipes/parse
Content-Type: application/json

{
  "url": "https://example.com/recipe",
  "options": {
    "includeImages": true,
    "maxImages": 10,
    "preferredImageTypes": ["hero", "step"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Chocolate Chip Cookies",
    "ingredients": [
      {
        "name": "2 cups all-purpose flour",
        "amount": "2",
        "unit": "cups"
      }
    ],
    "instructions": "1. Preheat oven to 375°F...",
    "prep_time": "15 minutes",
    "cook_time": "12 minutes",
    "servings": 24,
    "cuisine": "American",
    "available_images": [
      {
        "url": "https://example.com/image.jpg",
        "type": "hero",
        "alt_text": "Chocolate chip cookies on plate",
        "quality_score": 95
      }
    ],
    "source_url": "https://example.com/recipe"
  }
}
```

#### Validate Recipe URL
```http
POST /api/recipes/validate-url
Content-Type: application/json

{
  "url": "https://allrecipes.com/recipe/123"
}
```

#### Get Supported Domains
```http
GET /api/recipes/supported-domains
```

#### Recipe Parser Health Check
```http
GET /api/recipes/health
```

### System Health

#### General Health Check
```http
GET /api/health
```

#### Image Processor Health
```http
GET /api/images/health
```

## Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=3001
LOG_LEVEL=INFO

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AWS S3 Configuration (Future)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=mealmate-images

# Recipe Parsing
BROWSER_TIMEOUT=30000
MAX_CONCURRENT_PARSERS=3
PARSING_CACHE_TTL=3600

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Development

### Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Scripts
```bash
npm run dev      # Development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests
npm run lint     # Lint TypeScript code
```

### Testing API Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Supported domains
curl http://localhost:3001/api/recipes/supported-domains

# Parse recipe (requires valid URL)
curl -X POST http://localhost:3001/api/recipes/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://allrecipes.com/recipe/123"}'
```

## Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Configure production database URLs
- [ ] Set up AWS S3 for image storage
- [ ] Install Puppeteer dependencies
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domain

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Railway Deployment
```bash
railway login
railway link
railway up
```

## Monitoring

### Health Checks
- System health: `GET /api/health`
- Recipe parser: `GET /api/recipes/health`
- Image processor: `GET /api/images/health`

### Logging
- Structured JSON logs
- Configurable log levels (ERROR, WARN, INFO, DEBUG)
- Request/response logging with Morgan
- Error tracking with stack traces

### Metrics to Monitor
- Recipe parsing success rate
- Average parsing time
- Browser memory usage
- API response times
- Error rates by endpoint
- Rate limit violations

## Troubleshooting

### Common Issues

#### Puppeteer Browser Launch Fails
```bash
# Install dependencies (Ubuntu/Debian)
sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
  libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 \
  libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 \
  libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
  libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 \
  libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release \
  xdg-utils wget

# macOS (install Chrome)
brew install --cask google-chrome
```

#### Memory Issues
- Increase container memory limits
- Implement browser instance pooling
- Add cleanup for long-running processes

#### Parsing Failures
- Check if site has anti-bot protection
- Verify selectors are still valid
- Add site-specific configuration

## Future Enhancements

### Phase 1: Core Improvements
- AWS S3 image storage integration
- Image optimization and resizing
- Caching layer for parsed recipes
- Database integration for recipe storage

### Phase 2: Advanced Features
- Social media integration (Facebook, Instagram, TikTok)
- AI image generation for recipes without photos
- Custom image upload and editing
- Recipe recommendation engine

### Phase 3: Enterprise Features
- Multi-tenant support
- Advanced analytics and reporting
- API rate limiting per user
- Webhook notifications for recipe updates
