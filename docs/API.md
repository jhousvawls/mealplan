# API Documentation

## Overview

The Meal Planner App backend provides AI-powered endpoints for meal generation and recipe enhancement. The backend serves as a secure intermediary between the React frontend and the OpenAI API.

## Base URL

```
Development: http://localhost:3001
Production: https://your-api-domain.com
```

## Authentication

All API endpoints require authentication via Supabase JWT tokens passed in the Authorization header:

```
Authorization: Bearer <supabase_jwt_token>
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Endpoints

### Health Check

Check if the API service is running and healthy.

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-07-27T18:20:00Z",
  "version": "1.0.0",
  "services": {
    "openai": "connected",
    "supabase": "connected"
  }
}
```

### Generate Meals

Generate meal suggestions based on user preferences using AI.

```http
POST /api/generate-meals
```

**Request Body:**
```json
{
  "preferences": {
    "cuisine": "Italian",
    "dietary_restrictions": ["vegetarian"],
    "meal_type": "dinner",
    "prep_time": "30 minutes",
    "servings": 4,
    "ingredients_to_include": ["tomatoes", "basil"],
    "ingredients_to_avoid": ["mushrooms"]
  },
  "count": 3
}
```

**Parameters:**
- `preferences` (object, required): User meal preferences
  - `cuisine` (string, optional): Preferred cuisine type
  - `dietary_restrictions` (array, optional): Dietary restrictions/preferences
  - `meal_type` (string, optional): breakfast, lunch, dinner, snack
  - `prep_time` (string, optional): Maximum preparation time
  - `servings` (number, optional): Number of servings needed
  - `ingredients_to_include` (array, optional): Must-have ingredients
  - `ingredients_to_avoid` (array, optional): Ingredients to exclude
- `count` (number, optional): Number of meal suggestions (default: 3, max: 10)

**Response:**
```json
{
  "meals": [
    {
      "name": "Vegetarian Pasta Primavera",
      "description": "Fresh vegetables tossed with pasta in a light garlic olive oil sauce",
      "cuisine": "Italian",
      "prep_time": "25 minutes",
      "servings": 4,
      "ingredients": [
        {
          "name": "Pasta",
          "amount": "1 lb",
          "unit": "pound"
        },
        {
          "name": "Cherry Tomatoes",
          "amount": "2 cups",
          "unit": "cups"
        },
        {
          "name": "Fresh Basil",
          "amount": "1/4 cup",
          "unit": "cup"
        }
      ],
      "instructions": "1. Cook pasta according to package directions...",
      "estimated_nutrition": {
        "calories": 420,
        "protein": "15g",
        "carbs": "65g",
        "fat": "12g",
        "fiber": "8g"
      }
    }
  ],
  "generation_time": "2.3s",
  "tokens_used": 1250
}
```

### Get Recipe Details

Enhance an existing recipe with additional details using AI.

```http
POST /api/get-recipe-details
```

**Request Body:**
```json
{
  "recipe_name": "Chicken Stir Fry",
  "existing_ingredients": [
    {
      "name": "Chicken Breast",
      "amount": "1 lb"
    }
  ],
  "enhance_options": {
    "add_nutrition": true,
    "improve_instructions": true,
    "suggest_sides": true,
    "add_prep_tips": true
  }
}
```

**Parameters:**
- `recipe_name` (string, required): Name of the recipe to enhance
- `existing_ingredients` (array, optional): Current ingredients list
- `enhance_options` (object, optional): Enhancement preferences
  - `add_nutrition` (boolean): Add nutritional information
  - `improve_instructions` (boolean): Enhance cooking instructions
  - `suggest_sides` (boolean): Suggest side dishes
  - `add_prep_tips` (boolean): Add preparation tips

**Response:**
```json
{
  "enhanced_recipe": {
    "name": "Chicken Stir Fry",
    "ingredients": [
      {
        "name": "Chicken Breast",
        "amount": "1 lb",
        "unit": "pound",
        "notes": "cut into thin strips"
      },
      {
        "name": "Soy Sauce",
        "amount": "3",
        "unit": "tablespoons"
      },
      {
        "name": "Vegetable Oil",
        "amount": "2",
        "unit": "tablespoons"
      }
    ],
    "instructions": "1. Cut chicken into thin strips against the grain...",
    "prep_time": "15 minutes",
    "cook_time": "10 minutes",
    "estimated_nutrition": {
      "calories": 380,
      "protein": "35g",
      "carbs": "8g",
      "fat": "22g",
      "fiber": "2g",
      "servings": 4
    },
    "prep_tips": [
      "Marinate chicken for 30 minutes for better flavor",
      "Have all ingredients prepped before starting to cook"
    ],
    "suggested_sides": [
      "Steamed jasmine rice",
      "Egg fried rice",
      "Lo mein noodles"
    ]
  },
  "generation_time": "1.8s",
  "tokens_used": 890
}
```

### Enhance Nutrition

Get detailed nutritional analysis for a recipe.

```http
POST /api/enhance-nutrition
```

**Request Body:**
```json
{
  "recipe": {
    "name": "Beef Tacos",
    "ingredients": [
      {
        "name": "Ground Beef",
        "amount": "1 lb"
      },
      {
        "name": "Taco Shells",
        "amount": "8"
      },
      {
        "name": "Cheddar Cheese",
        "amount": "1 cup"
      }
    ],
    "servings": 4
  },
  "analysis_type": "detailed"
}
```

**Parameters:**
- `recipe` (object, required): Recipe to analyze
  - `name` (string, required): Recipe name
  - `ingredients` (array, required): List of ingredients
  - `servings` (number, required): Number of servings
- `analysis_type` (string, optional): "basic" or "detailed" (default: "basic")

**Response:**
```json
{
  "nutrition": {
    "per_serving": {
      "calories": 485,
      "protein": "28g",
      "carbohydrates": "22g",
      "fat": "32g",
      "fiber": "3g",
      "sugar": "2g",
      "sodium": "890mg",
      "cholesterol": "85mg"
    },
    "total_recipe": {
      "calories": 1940,
      "protein": "112g",
      "carbohydrates": "88g",
      "fat": "128g"
    },
    "macronutrient_breakdown": {
      "protein_percent": 23,
      "carbs_percent": 18,
      "fat_percent": 59
    },
    "dietary_info": {
      "is_vegetarian": false,
      "is_vegan": false,
      "is_gluten_free": false,
      "is_dairy_free": false,
      "allergens": ["dairy", "gluten"]
    },
    "health_score": 6.5,
    "recommendations": [
      "Consider using lean ground beef (93/7) to reduce fat content",
      "Add lettuce and tomatoes for additional fiber and vitamins"
    ]
  },
  "generation_time": "1.2s",
  "tokens_used": 650
}
```

### Generate Grocery List

Generate an optimized grocery list from meal plan ingredients.

```http
POST /api/generate-grocery-list
```

**Request Body:**
```json
{
  "meal_plan_id": "550e8400-e29b-41d4-a716-446655440001",
  "optimization_options": {
    "group_by_category": true,
    "consolidate_duplicates": true,
    "suggest_quantities": true,
    "add_walmart_formatting": true
  }
}
```

**Parameters:**
- `meal_plan_id` (string, required): UUID of the meal plan
- `optimization_options` (object, optional): List optimization preferences
  - `group_by_category` (boolean): Group items by store category
  - `consolidate_duplicates` (boolean): Combine duplicate ingredients
  - `suggest_quantities` (boolean): Optimize quantities for package sizes
  - `add_walmart_formatting` (boolean): Format for Walmart grocery pickup

**Response:**
```json
{
  "grocery_list": {
    "categories": {
      "Produce": [
        {
          "item": "Tomatoes",
          "quantity": "2 lbs",
          "notes": "Roma or vine-ripened",
          "estimated_cost": "$3.50"
        },
        {
          "item": "Onions",
          "quantity": "3 lbs bag",
          "notes": "Yellow onions",
          "estimated_cost": "$2.99"
        }
      ],
      "Meat & Seafood": [
        {
          "item": "Chicken Breast",
          "quantity": "3 lbs",
          "notes": "Boneless, skinless",
          "estimated_cost": "$12.99"
        }
      ],
      "Dairy": [
        {
          "item": "Milk",
          "quantity": "1 gallon",
          "notes": "2% or whole milk",
          "estimated_cost": "$3.29"
        }
      ]
    },
    "walmart_format": "Tomatoes - 2 lbs\nOnions - 3 lb bag\nChicken Breast - 3 lbs\nMilk - 1 gallon",
    "total_estimated_cost": "$22.77",
    "total_items": 4
  },
  "consolidation_summary": {
    "original_items": 12,
    "consolidated_items": 4,
    "savings_estimate": "$8.50"
  }
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Generate Meals**: 10 requests per minute per user
- **Get Recipe Details**: 20 requests per minute per user
- **Enhance Nutrition**: 15 requests per minute per user
- **Generate Grocery List**: 30 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1627492800
```

## WebSocket Events

The API supports real-time updates via WebSocket connections for collaborative features.

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');
ws.send(JSON.stringify({
  type: 'authenticate',
  token: 'supabase_jwt_token'
}));
```

### Events

#### Meal Plan Updated
```json
{
  "type": "meal_plan_updated",
  "data": {
    "meal_plan_id": "550e8400-e29b-41d4-a716-446655440001",
    "updated_by": "user_id",
    "changes": {
      "planned_meals": [
        {
          "action": "added",
          "day": "monday",
          "meal_type": "dinner",
          "recipe_id": "recipe_id"
        }
      ]
    },
    "timestamp": "2024-07-27T18:20:00Z"
  }
}
```

#### Recipe Shared
```json
{
  "type": "recipe_shared",
  "data": {
    "recipe_id": "550e8400-e29b-41d4-a716-446655440002",
    "shared_by": "user_id",
    "shared_with": "household_id",
    "timestamp": "2024-07-27T18:20:00Z"
  }
}
```

## SDK Integration

### JavaScript/React Example

```javascript
import { createClient } from '@supabase/supabase-js';

class MealPlannerAPI {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.baseURL = process.env.REACT_APP_API_URL;
  }

  async generateMeals(preferences, count = 3) {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    const response = await fetch(`${this.baseURL}/api/generate-meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ preferences, count })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async enhanceRecipe(recipeName, options = {}) {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    const response = await fetch(`${this.baseURL}/api/get-recipe-details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        recipe_name: recipeName,
        enhance_options: options
      })
    });

    return response.json();
  }
}

// Usage
const api = new MealPlannerAPI(supabaseClient);

const meals = await api.generateMeals({
  cuisine: 'Italian',
  dietary_restrictions: ['vegetarian'],
  prep_time: '30 minutes'
});
```

### Error Handling Best Practices

```javascript
async function handleAPICall(apiFunction) {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    if (error.status === 429) {
      // Rate limited - implement retry with backoff
      return { success: false, error: 'rate_limited', retry: true };
    } else if (error.status === 401) {
      // Unauthorized - refresh token
      return { success: false, error: 'unauthorized', action: 'refresh_token' };
    } else {
      // Other errors
      return { success: false, error: error.message };
    }
  }
}
```

## Testing

### Unit Tests

```javascript
// Example Jest test
describe('Generate Meals API', () => {
  test('should generate meals with valid preferences', async () => {
    const preferences = {
      cuisine: 'Italian',
      meal_type: 'dinner',
      servings: 4
    };

    const response = await request(app)
      .post('/api/generate-meals')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ preferences, count: 2 })
      .expect(200);

    expect(response.body.meals).toHaveLength(2);
    expect(response.body.meals[0]).toHaveProperty('name');
    expect(response.body.meals[0]).toHaveProperty('ingredients');
  });
});
```

### Integration Tests

```javascript
describe('API Integration', () => {
  test('should handle full meal planning workflow', async () => {
    // 1. Generate meals
    const mealsResponse = await generateMeals(preferences);
    
    // 2. Enhance recipe details
    const enhancedRecipe = await enhanceRecipe(mealsResponse.meals[0].name);
    
    // 3. Generate grocery list
    const groceryList = await generateGroceryList(mealPlanId);
    
    expect(groceryList.total_items).toBeGreaterThan(0);
  });
});
```

## Monitoring & Analytics

### Metrics Tracked

- Request volume per endpoint
- Response times
- Error rates
- Token usage (OpenAI)
- User engagement patterns
- Rate limit violations

### Health Monitoring

```javascript
// Health check endpoint implementation
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    services: {}
  };

  try {
    // Check OpenAI connectivity
    await openai.models.list();
    health.services.openai = 'connected';
  } catch (error) {
    health.services.openai = 'disconnected';
    health.status = 'degraded';
  }

  try {
    // Check Supabase connectivity
    await supabase.from('users').select('count').limit(1);
    health.services.supabase = 'connected';
  } catch (error) {
    health.services.supabase = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
