# MealMate Backend

Node.js backend service for recipe parsing, image processing, and API endpoints.

## Features

- **Recipe Parsing**: Extract recipes from popular food websites using Puppeteer and Cheerio
- **Image Processing**: Handle recipe images with AWS S3 storage and optimization
- **Structured Data Support**: Parse JSON-LD, Microdata, and site-specific formats
- **Rate Limiting**: Protect against abuse with configurable rate limits
- **Health Monitoring**: Comprehensive health checks and logging

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS S3 bucket (for image storage)
- Supabase project (for database)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev
```

### Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=mealmate-images
```

## API Endpoints

### Recipe Parsing

```bash
# Parse recipe from URL
POST /api/recipes/parse
{
  "url": "https://example.com/recipe",
  "options": {
    "includeImages": true,
    "maxImages": 10
  }
}

# Validate URL
POST /api/recipes/validate-url
{
  "url": "https://example.com/recipe"
}

# Get supported domains
GET /api/recipes/supported-domains
```

### Health Checks

```bash
# General health
GET /api/health

# Recipe parser health
GET /api/recipes/health

# Image processor health
GET /api/images/health
```

## Supported Recipe Sites

### Excellent Support
- AllRecipes.com
- Food Network
- Bon Appétit
- Serious Eats

### Good Support
- Tasty
- Food.com
- Epicurious

### Generic Support
- Any site with structured data (JSON-LD, Microdata)
- Basic HTML parsing fallback

## Architecture

```
backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── types/                # TypeScript definitions
│   ├── routes/               # API route handlers
│   │   ├── recipe.ts         # Recipe parsing endpoints
│   │   ├── image.ts          # Image processing endpoints
│   │   └── health.ts         # Health check endpoints
│   ├── services/             # Business logic
│   │   └── recipeParser.ts   # Recipe parsing service
│   ├── middleware/           # Express middleware
│   │   └── errorHandler.ts   # Error handling
│   └── utils/                # Utilities
│       └── logger.ts         # Logging service
├── package.json
├── tsconfig.json
└── README.md
```

## Recipe Parsing Flow

1. **URL Validation**: Check if URL is valid and supported
2. **Browser Launch**: Initialize Puppeteer browser instance
3. **Page Navigation**: Load the recipe page
4. **Data Extraction**: Try multiple parsing strategies:
   - JSON-LD structured data
   - Microdata
   - Site-specific selectors
   - Generic HTML parsing
5. **Image Extraction**: Find and score recipe images
6. **Response**: Return parsed recipe with images

## Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## Deployment

### Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Docker

```bash
# Build image
docker build -t mealmate-backend .

# Run container
docker run -p 3001:3001 --env-file .env mealmate-backend
```

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
SUPABASE_URL=your_production_supabase_url
AWS_ACCESS_KEY_ID=your_production_aws_key
# ... other production values
```

## Monitoring

### Health Checks

- `GET /api/health` - Overall service health
- `GET /api/recipes/health` - Recipe parser status
- `GET /api/images/health` - Image processor status

### Logging

Structured JSON logging with configurable levels:
- ERROR: Critical errors
- WARN: Warning conditions  
- INFO: General information
- DEBUG: Detailed debug info

### Metrics

Monitor these key metrics:
- Recipe parsing success rate
- Average parsing time
- Browser memory usage
- API response times
- Error rates by endpoint

## Troubleshooting

### Common Issues

**Puppeteer fails to launch**
```bash
# Install dependencies (Ubuntu/Debian)
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

**Memory issues**
- Increase container memory limits
- Implement browser instance pooling
- Add cleanup for long-running processes

**Parsing failures**
- Check if site has anti-bot protection
- Verify selectors are still valid
- Add site-specific configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
