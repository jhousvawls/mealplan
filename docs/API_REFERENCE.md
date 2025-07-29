# API Reference - MealMate Backend

## Overview

This is your personal API reference for debugging and development. The MealMate backend provides recipe parsing capabilities and health monitoring endpoints.

**Base URL**: `http://localhost:3001`

## Quick Reference

### Available Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system information
- `POST /api/recipes/parse` - Parse recipe from URL
- `POST /api/recipes/parse-text` - Parse recipe from text (AI-powered)
- `POST /api/recipes/validate-url` - Validate recipe URL
- `GET /api/recipes/supported-domains` - Get supported recipe sites
- `GET /api/recipes/health` - Recipe parser service health
- `GET /api/images/health` - Image service health (placeholder)

## Authentication

Currently, the backend doesn't require authentication for recipe parsing endpoints. This will change when you implement security hardening.

## Rate Limiting

- **Global Rate Limit**: 100 requests per 15 minutes per IP
- **Endpoint**: `/api/*`
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Health Endpoints

### Basic Health Check

```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-29T16:51:00.000Z",
    "uptime": 3600.5,
    "version": "1.0.0",
    "services": {
      "database": "connected",
      "storage": "connected",
      "puppeteer": "ready"
    }
  },
  "responseTime": "15.23ms"
}
```

### Detailed Health Check

```bash
curl http://localhost:3001/api/health/detailed
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-29T16:51:00.000Z",
    "uptime": 3600.5,
    "version": "1.0.0",
    "system": {
      "platform": "darwin",
      "arch": "arm64",
      "nodeVersion": "v18.17.0",
      "memory": {
        "rss": "45MB",
        "heapTotal": "25MB",
        "heapUsed": "18MB",
        "external": "2MB"
      },
      "cpu": {
        "user": 1234567,
        "system": 234567
      }
    },
    "environment": {
      "nodeEnv": "development",
      "port": 3001,
      "logLevel": "INFO"
    }
  }
}
```

## Recipe Parsing Endpoints

### Parse Recipe from URL

**Primary recipe parsing endpoint** - parses recipes from supported websites.

```bash
curl -X POST http://localhost:3001/api/recipes/parse \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/",
    "options": {}
  }'
```

**Request Body:**
```json
{
  "url": "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/",
  "options": {}
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "name": "Cheesy Chicken Broccoli Casserole",
    "ingredients": [
      {
        "name": "Chicken Breast",
        "amount": "2 lbs",
        "unit": "pounds"
      },
      {
        "name": "Broccoli",
        "amount": "4 cups",
        "unit": "cups"
      }
    ],
    "instructions": "1. Preheat oven to 350°F...",
    "prep_time": "15 minutes",
    "cook_time": "30 minutes",
    "servings": 6,
    "source_url": "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/",
    "featured_image": "https://example.com/image.jpg"
  },
  "message": "Recipe parsed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "PARSING_FAILED",
    "message": "Failed to parse recipe from URL",
    "details": "The website might not be supported or the recipe format is not recognized."
  }
}
```

### Parse Recipe from Text (AI-Powered)

**New feature** - parses recipes from social media text, Facebook posts, etc.

```bash
curl -X POST http://localhost:3001/api/recipes/parse-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Easy Chicken Tacos! 🌮\n\n1 lb chicken breast\n2 tsp cumin\n1 tsp paprika\nTaco shells\nCheese\nLettuce\n\nCook chicken with spices, shred, serve in shells with toppings!",
    "context": "social_media",
    "sourceUrl": "https://facebook.com/post/123"
  }'
```

**Request Body:**
```json
{
  "text": "Easy Chicken Tacos! 🌮\n\n1 lb chicken breast\n2 tsp cumin\n1 tsp paprika\nTaco shells\nCheese\nLettuce\n\nCook chicken with spices, shred, serve in shells with toppings!",
  "context": "social_media",
  "sourceUrl": "https://facebook.com/post/123"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "name": "Easy Chicken Tacos",
    "ingredients": [
      {
        "name": "Chicken Breast",
        "amount": "1",
        "unit": "lb"
      },
      {
        "name": "Cumin",
        "amount": "2",
        "unit": "tsp"
      },
      {
        "name": "Paprika",
        "amount": "1",
        "unit": "tsp"
      },
      {
        "name": "Taco Shells",
        "amount": "8",
        "unit": "pieces"
      }
    ],
    "instructions": "1. Season chicken breast with cumin and paprika\n2. Cook chicken until done\n3. Shred chicken\n4. Serve in taco shells with cheese and lettuce",
    "prep_time": "10 minutes",
    "cook_time": "15 minutes",
    "servings": 4
  },
  "message": "Recipe parsed successfully from text",
  "confidence": 0.85
}
```

### Validate Recipe URL

**Utility endpoint** - checks if a URL is valid and supported.

```bash
curl -X POST http://localhost:3001/api/recipes/validate-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/"
  }'
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "supported": true,
  "domain": "allrecipes.com",
  "message": "URL is supported for recipe parsing"
}
```

### Get Supported Domains

**Reference endpoint** - lists all supported recipe websites.

```bash
curl http://localhost:3001/api/recipes/supported-domains
```

**Response:**
```json
{
  "success": true,
  "data": {
    "supported_sites": [
      {
        "name": "AllRecipes",
        "domain": "allrecipes.com",
        "features": ["structured-data", "images", "nutrition"],
        "quality": "excellent"
      },
      {
        "name": "Food Network",
        "domain": "foodnetwork.com",
        "features": ["structured-data", "images", "chef-info"],
        "quality": "excellent"
      },
      {
        "name": "Bon Appétit",
        "domain": "bonappetit.com",
        "features": ["structured-data", "images", "editorial"],
        "quality": "excellent"
      },
      {
        "name": "Serious Eats",
        "domain": "seriouseats.com",
        "features": ["structured-data", "images", "detailed-instructions"],
        "quality": "excellent"
      },
      {
        "name": "Tasty",
        "domain": "tasty.co",
        "features": ["structured-data", "video", "images"],
        "quality": "good"
      }
    ],
    "total_sites": 5,
    "parsing_methods": [
      "JSON-LD structured data",
      "Microdata",
      "Site-specific selectors",
      "Generic fallback parsing"
    ]
  }
}
```

### Recipe Parser Health

**Service health check** - tests if Puppeteer browser can initialize.

```bash
curl http://localhost:3001/api/recipes/health
```

**Healthy Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "recipe-parser",
    "browser": "ready",
    "timestamp": "2025-01-29T16:51:00.000Z"
  }
}
```

**Unhealthy Response:**
```json
{
  "success": false,
  "data": {
    "status": "unhealthy",
    "service": "recipe-parser",
    "browser": "failed",
    "error": "Failed to launch browser",
    "timestamp": "2025-01-29T16:51:00.000Z"
  }
}
```

## Image Service Endpoints

### Image Service Health

**Placeholder endpoint** - currently just returns healthy status.

```bash
curl http://localhost:3001/api/images/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "image-processor",
    "timestamp": "2025-01-29T16:51:00.000Z"
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)",
    "timestamp": "2025-01-29T16:51:00.000Z",
    "path": "/api/recipes/parse",
    "requestId": "req_123456789"
  }
}
```

### Common Error Codes

- `INVALID_URL` - URL format is invalid
- `URL_REQUIRED` - URL parameter is missing
- `TEXT_REQUIRED` - Text parameter is missing
- `TEXT_TOO_LONG` - Text exceeds 10,000 character limit
- `PARSING_FAILED` - Recipe parsing failed
- `TEXT_PARSING_FAILED` - AI text parsing failed
- `PARSING_ERROR` - Generic parsing error
- `TEXT_PARSING_ERROR` - Generic text parsing error

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `422` - Unprocessable Entity (parsing failed)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable (health check failed)

## CORS Configuration

The backend accepts requests from multiple frontend ports:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180'
];
```

## Development Commands

### Start Backend Server
```bash
cd backend
npm run dev
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3001/api/health

# Test recipe parsing
curl -X POST http://localhost:3001/api/recipes/parse \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/"}'

# Test text parsing
curl -X POST http://localhost:3001/api/recipes/parse-text \
  -H "Content-Type: application/json" \
  -d '{"text": "Chicken Tacos: 1 lb chicken, taco shells, cheese. Cook chicken, serve in shells."}'
```

### Check Logs
```bash
# Backend logs are in console and logs/ directory
tail -f backend/logs/app.log
```

## Debugging Tips

### Recipe Parsing Issues

1. **Check URL validity first:**
   ```bash
   curl -X POST http://localhost:3001/api/recipes/validate-url \
     -H "Content-Type: application/json" \
     -d '{"url": "YOUR_URL_HERE"}'
   ```

2. **Check supported domains:**
   ```bash
   curl http://localhost:3001/api/recipes/supported-domains
   ```

3. **Check recipe parser health:**
   ```bash
   curl http://localhost:3001/api/recipes/health
   ```

4. **Try text parsing as fallback:**
   ```bash
   curl -X POST http://localhost:3001/api/recipes/parse-text \
     -H "Content-Type: application/json" \
     -d '{"text": "PASTE_RECIPE_TEXT_HERE"}'
   ```

### Common Issues

- **"Socket hang up" errors**: Use text parsing instead of URL parsing
- **Rate limiting**: Wait 15 minutes or restart server
- **Browser launch failures**: Check if Puppeteer can access Chrome/Chromium
- **CORS errors**: Make sure frontend is running on allowed port

### Environment Variables

Check your `.env` file has:
```bash
PORT=3001
NODE_ENV=development
LOG_LEVEL=INFO
OPENAI_API_KEY=your_openai_key_here
```

## Future Endpoints (Not Yet Implemented)

These endpoints are planned but not yet implemented:

- `POST /api/recipes/import` - Import parsed recipe to database
- `POST /api/images/upload` - Upload recipe images
- `POST /api/images/optimize` - Optimize recipe images
- Authentication endpoints (when security is implemented)

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Test Coverage
- Health routes: 100% coverage
- Recipe routes: Partial coverage
- Error handling: 100% coverage

This API reference covers all currently implemented endpoints and provides practical examples for debugging and development.
