import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  avatar_url: null,
  household_id: 'test-household-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Mock recipe data
export const mockRecipe = {
  id: 'test-recipe-id',
  name: 'Test Recipe',
  ingredients: [
    { name: 'Test Ingredient', amount: '1 cup', unit: 'cup' }
  ],
  instructions: 'Test instructions',
  prep_time: '30 minutes',
  cuisine: 'Test Cuisine',
  owner_id: 'test-user-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  tags: ['test'],
  difficulty: 'easy' as const,
  meal_types: ['dinner'],
  dietary_restrictions: [],
  featured_image: null,
  estimated_nutrition: null
}

// Mock meal plan data
export const mockMealPlan = {
  id: 'test-meal-plan-id',
  owner_id: 'test-user-id',
  plan_name: 'Test Meal Plan',
  start_date: '2024-01-01',
  grocery_list: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Mock grocery item data
export const mockGroceryItem = {
  id: 'test-grocery-item-id',
  item: 'Test Item',
  quantity: '1 unit',
  category: 'Test Category',
  checked: false,
  notes: 'Test notes'
}

// Helper function to wait for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0))

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
