import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Mock API responses
const mockRecipes = [
  {
    id: '1',
    name: 'Test Recipe',
    ingredients: [
      { name: 'Test Ingredient', amount: '1 cup', unit: 'cup' }
    ],
    instructions: 'Test instructions',
    prep_time: '30 minutes',
    cuisine: 'Test Cuisine',
    owner_id: 'test-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockMealPlans = [
  {
    id: '1',
    owner_id: 'test-user-id',
    plan_name: 'Test Meal Plan',
    start_date: '2024-01-01',
    grocery_list: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  household_id: 'test-household-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// API handlers
export const handlers = [
  // Supabase Auth
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser
    })
  }),

  http.get('*/auth/v1/user', () => {
    return HttpResponse.json(mockUser)
  }),

  // Supabase REST API
  http.get('*/rest/v1/recipes', () => {
    return HttpResponse.json(mockRecipes)
  }),

  http.post('*/rest/v1/recipes', async ({ request }) => {
    const newRecipe = await request.json() as any
    return HttpResponse.json({
      ...newRecipe,
      id: 'new-recipe-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }),

  http.get('*/rest/v1/meal_plans', () => {
    return HttpResponse.json(mockMealPlans)
  }),

  http.post('*/rest/v1/meal_plans', async ({ request }) => {
    const newMealPlan = await request.json() as any
    return HttpResponse.json({
      ...newMealPlan,
      id: 'new-meal-plan-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }),

  // Backend API
  http.get('*/api/health', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        supabase: 'connected',
        openai: 'connected'
      }
    })
  }),

  http.post('*/api/recipes/parse', () => {
    return HttpResponse.json({
      success: true,
      data: {
        name: 'Parsed Recipe',
        ingredients: [
          { name: 'Parsed Ingredient', amount: '2 cups', unit: 'cups' }
        ],
        instructions: 'Parsed instructions',
        prep_time: '45 minutes',
        cuisine: 'Parsed Cuisine'
      }
    })
  }),

  http.post('*/api/recipes/parse-text', () => {
    return HttpResponse.json({
      success: true,
      data: {
        name: 'AI Parsed Recipe',
        ingredients: [
          { name: 'AI Ingredient', amount: '1 tbsp', unit: 'tablespoon' }
        ],
        instructions: 'AI parsed instructions',
        prep_time: '20 minutes',
        cuisine: 'AI Cuisine'
      },
      confidence: 95
    })
  })
]

// Setup server
export const server = setupServer(...handlers)
