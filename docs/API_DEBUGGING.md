# API Debugging Guide - MealMate Backend

## Overview

This is your personal debugging guide for troubleshooting API issues during development. Use this when things aren't working as expected.

## Quick Debugging Checklist

### 1. Is the Backend Running?
```bash
# Check if server is running
curl http://localhost:3001/api/health

# Expected response:
# {"success": true, "data": {"status": "healthy", ...}}
```

### 2. Check Server Logs
```bash
# View real-time logs
cd backend
npm run dev

# Or check log files (if configured)
tail -f backend/logs/app.log
```

### 3. Test Basic Connectivity
```bash
# Simple health check
curl -v http://localhost:3001/api/health

# Check CORS headers
curl -H "Origin: http://localhost:5177" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/api/recipes/parse
```

## Common Issues & Solutions

### Recipe Parsing Problems

#### Issue: "Socket hang up" errors
**Symptoms:**
```json
{
  "success": false,
  "error": {
    "code": "PARSING_ERROR",
    "message": "Failed to parse recipe. The website might not be supported..."
  }
}
```

**Debug Steps:**
1. **Check if URL is supported:**
   ```bash
   curl -X POST http://localhost:3001/api/recipes/validate-url \
     -H "Content-Type: application/json" \
     -d '{"url": "YOUR_PROBLEMATIC_URL"}'
   ```

2. **Try text parsing instead:**
   ```bash
   # Copy the recipe text from the webpage and use AI parsing
   curl -X POST http://localhost:3001/api/recipes/parse-text \
     -H "Content-Type: application/json" \
     -d '{"text": "PASTE_RECIPE_TEXT_HERE", "context": "social_media"}'
   ```

3. **Check browser health:**
   ```bash
   curl http://localhost:3001/api/recipes/health
   ```

**Solutions:**
- Use text parsing for social media recipes
- Check if the website has anti-bot protection
- Verify Puppeteer can launch browser

#### Issue: Invalid URL format
**Symptoms:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "Invalid URL provided"
  }
}
```

**Debug Steps:**
```bash
# Test URL validation
curl -X POST http://localhost:3001/api/recipes/validate-url \
  -H "Content-Type: application/json" \
  -d '{"url": "YOUR_URL"}'
```

**Solutions:**
- Ensure URL includes `http://` or `https://`
- Check for special characters or encoding issues
- Verify URL is accessible in browser

#### Issue: Text parsing fails
**Symptoms:**
```json
{
  "success": false,
  "error": {
    "code": "TEXT_PARSING_FAILED",
    "message": "Failed to parse recipe from text"
  }
}
```

**Debug Steps:**
1. **Check text length:**
   ```bash
   echo "YOUR_TEXT" | wc -c  # Should be < 10,000 characters
   ```

2. **Test with simpler text:**
   ```bash
   curl -X POST http://localhost:3001/api/recipes/parse-text \
     -H "Content-Type: application/json" \
     -d '{"text": "Chicken Tacos: 1 lb chicken, taco shells. Cook chicken, serve in shells."}'
   ```

**Solutions:**
- Reduce text length (max 10,000 characters)
- Ensure text contains recognizable recipe format
- Check OpenAI API key is configured

### Rate Limiting Issues

#### Issue: Too many requests
**Symptoms:**
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

**Debug Steps:**
```bash
# Check rate limit headers
curl -v http://localhost:3001/api/health | grep -i "x-ratelimit"
```

**Solutions:**
- Wait 15 minutes for rate limit reset
- Restart backend server to reset counters
- Reduce request frequency during testing

### CORS Issues

#### Issue: CORS errors in browser
**Symptoms:**
- Browser console shows CORS errors
- Requests fail from frontend but work with curl

**Debug Steps:**
1. **Check allowed origins:**
   ```bash
   # Look for your frontend port in backend/src/index.ts
   grep -n "allowedOrigins" backend/src/index.ts
   ```

2. **Test CORS preflight:**
   ```bash
   curl -H "Origin: http://localhost:5177" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        http://localhost:3001/api/recipes/parse
   ```

**Solutions:**
- Add your frontend port to `allowedOrigins` in `backend/src/index.ts`
- Restart backend server after changes
- Check frontend is running on expected port

### Environment Issues

#### Issue: Missing environment variables
**Symptoms:**
- Server starts but features don't work
- OpenAI parsing fails
- Undefined environment variables in logs

**Debug Steps:**
```bash
# Check if .env file exists
ls -la backend/.env

# Check environment variables are loaded
cd backend
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY ? 'OpenAI key loaded' : 'OpenAI key missing');"
```

**Solutions:**
- Copy `.env.example` to `.env`
- Add missing environment variables
- Restart server after env changes

### Browser/Puppeteer Issues

#### Issue: Browser launch failures
**Symptoms:**
```json
{
  "success": false,
  "data": {
    "status": "unhealthy",
    "service": "recipe-parser",
    "browser": "failed",
    "error": "Failed to launch browser"
  }
}
```

**Debug Steps:**
```bash
# Test browser health
curl http://localhost:3001/api/recipes/health

# Check if Chrome/Chromium is available
which google-chrome || which chromium-browser || which chrome
```

**Solutions:**
- Install Chrome or Chromium
- Check Puppeteer installation: `cd backend && npm list puppeteer`
- Try running with different browser flags

## Debugging Workflows

### Recipe Import Not Working

1. **Test the URL first:**
   ```bash
   curl -X POST http://localhost:3001/api/recipes/validate-url \
     -H "Content-Type: application/json" \
     -d '{"url": "YOUR_URL"}'
   ```

2. **If URL is valid but parsing fails:**
   ```bash
   curl -X POST http://localhost:3001/api/recipes/parse \
     -H "Content-Type: application/json" \
     -d '{"url": "YOUR_URL"}' \
     -v  # Verbose output for debugging
   ```

3. **Try text parsing as fallback:**
   - Copy recipe text from webpage
   - Use text parsing endpoint
   - Check confidence score in response

### Frontend Can't Connect to Backend

1. **Verify backend is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check CORS configuration:**
   ```bash
   # Check if your frontend port is allowed
   grep -A 10 "allowedOrigins" backend/src/index.ts
   ```

3. **Test from browser console:**
   ```javascript
   fetch('http://localhost:3001/api/health')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error);
   ```

### Performance Issues

1. **Check response times:**
   ```bash
   time curl http://localhost:3001/api/health
   ```

2. **Monitor memory usage:**
   ```bash
   curl http://localhost:3001/api/health/detailed | jq '.data.system.memory'
   ```

3. **Check for memory leaks:**
   - Monitor memory usage over time
   - Look for increasing heap usage
   - Restart server if memory usage is high

## Useful Debug Commands

### Test All Endpoints
```bash
#!/bin/bash
# Save as test-api.sh

echo "Testing health endpoint..."
curl -s http://localhost:3001/api/health | jq '.success'

echo "Testing recipe validation..."
curl -s -X POST http://localhost:3001/api/recipes/validate-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/"}' | jq '.valid'

echo "Testing supported domains..."
curl -s http://localhost:3001/api/recipes/supported-domains | jq '.data.total_sites'

echo "Testing recipe parser health..."
curl -s http://localhost:3001/api/recipes/health | jq '.data.status'

echo "Testing image service health..."
curl -s http://localhost:3001/api/images/health | jq '.data.status'
```

### Monitor API in Real-time
```bash
# Watch logs in real-time
tail -f backend/logs/app.log | grep -E "(ERROR|WARN|recipe)"

# Monitor health endpoint
watch -n 5 'curl -s http://localhost:3001/api/health | jq ".data.uptime"'
```

### Test Recipe Parsing with Different URLs
```bash
#!/bin/bash
# Test multiple recipe sites

URLS=(
  "https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/"
  "https://www.foodnetwork.com/recipes/alton-brown/baked-macaroni-and-cheese-recipe-1939524"
  "https://www.bonappetit.com/recipe/bas-best-chocolate-chip-cookies"
)

for url in "${URLS[@]}"; do
  echo "Testing: $url"
  curl -s -X POST http://localhost:3001/api/recipes/parse \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$url\"}" | jq '.success'
  echo "---"
done
```

## Error Code Reference

| Error Code | Meaning | Common Causes | Solution |
|------------|---------|---------------|----------|
| `INVALID_URL` | URL format invalid | Missing protocol, malformed URL | Add http:// or https:// |
| `URL_REQUIRED` | Missing URL parameter | Empty request body | Include URL in request |
| `TEXT_REQUIRED` | Missing text parameter | Empty text field | Include recipe text |
| `TEXT_TOO_LONG` | Text exceeds limit | Text > 10,000 chars | Reduce text length |
| `PARSING_FAILED` | URL parsing failed | Anti-bot protection, unsupported site | Try text parsing |
| `TEXT_PARSING_FAILED` | AI parsing failed | Poor text format, API issues | Check OpenAI key, improve text |
| `PARSING_ERROR` | Generic parsing error | Network issues, browser problems | Check browser health |

## Log Analysis

### Important Log Patterns

**Successful recipe parsing:**
```
INFO: Parsing recipe from URL: https://example.com/recipe
INFO: Recipe parsed successfully: Recipe Name
```

**Failed parsing:**
```
ERROR: Recipe parsing error: { url: 'https://example.com', error: 'Socket hang up' }
```

**Rate limiting:**
```
WARN: Rate limit exceeded for IP: 127.0.0.1
```

**Browser issues:**
```
ERROR: Failed to launch browser: Error: spawn chrome ENOENT
```

### Grep Commands for Log Analysis
```bash
# Find all errors
grep -i "error" backend/logs/app.log

# Find recipe parsing issues
grep -i "recipe.*error" backend/logs/app.log

# Find rate limiting
grep -i "rate limit" backend/logs/app.log

# Find successful parses
grep -i "recipe parsed successfully" backend/logs/app.log
```

This debugging guide should help you quickly identify and resolve common API issues during development.
