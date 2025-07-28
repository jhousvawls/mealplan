# Meal Planning Implementation Guide

## Overview

This document provides comprehensive documentation for the meal planning feature implementation, including architecture, components, usage, and development guidelines.

## 🏗️ Architecture

### Component Structure

```
frontend/src/components/features/meal-planning/
├── MealPlanView.tsx          # Main weekly calendar component
├── WeekNavigation.tsx        # Week switching controls
├── DayColumn.tsx             # Daily meal organization
├── MealCard.tsx              # Individual meal display
├── MealAssignmentModal.tsx   # Recipe selection modal
└── index.ts                  # Component exports
```

### Data Flow

```
MealPlanView
├── useCurrentWeekMealPlan() → Gets current week's meal plan
├── useGetOrCreateCurrentWeekMealPlan() → Creates meal plan if needed
└── Components:
    ├── WeekNavigation → Week switching
    ├── DayColumn (×7) → Daily meal slots
    │   └── MealCard (×n) → Individual meals
    └── MealAssignmentModal → Recipe selection
```

### State Management

- **Server State**: React Query hooks for meal plans and recipes
- **Local State**: UI state (modals, selections, week navigation)
- **Optimistic Updates**: Immediate UI feedback before server confirmation

## 📱 Components

### MealPlanView

**Purpose**: Main container for the weekly meal planning interface

**Features**:
- Mobile-first responsive design
- Horizontal scrolling days on mobile
- Full 7-day grid on desktop
- Week navigation integration
- Empty state handling
- Loading and error states

**Props**:
```typescript
interface MealPlanViewProps {
  className?: string;
}
```

**Key Functionality**:
- Auto-creates meal plan for current week if none exists
- Handles week navigation with date calculations
- Manages meal assignment modal state
- Provides meal filtering by day

### WeekNavigation

**Purpose**: Week switching controls with date display

**Features**:
- Week range formatting (e.g., "Jan 15 - 21, 2024")
- Previous/Next navigation
- Current week detection
- Mobile week indicator dots
- Responsive button labels

**Props**:
```typescript
interface WeekNavigationProps {
  currentWeekStart: string;
  onWeekChange: (direction: 'prev' | 'next') => void;
  className?: string;
}
```

### DayColumn

**Purpose**: Daily meal organization with meal type sections

**Features**:
- Day header with date and "Today" highlighting
- Meal type sections (Breakfast, Lunch, Dinner, Snacks)
- Add meal buttons for each type
- Empty state slots with hover effects
- Touch-friendly design (44px minimum targets)

**Props**:
```typescript
interface DayColumnProps {
  dayOfWeek: DayOfWeek;
  date: Date;
  meals: PlannedMeal[];
  onAddMeal: (mealType: MealType) => void;
  isToday?: boolean;
  className?: string;
}
```

### MealCard

**Purpose**: Individual meal display with actions

**Features**:
- Recipe image with fallback handling
- Recipe name and prep time
- Actions menu (View, Duplicate, Remove)
- Loading states for mutations
- Touch-optimized interactions

**Props**:
```typescript
interface MealCardProps {
  meal: PlannedMeal;
  dayOfWeek: DayOfWeek;
  className?: string;
}
```

### MealAssignmentModal

**Purpose**: Recipe selection interface

**Features**:
- Bottom sheet style modal
- Recipe search with instant filtering
- Recipe grid with images and details
- Selection state with visual feedback
- Loading and empty states

**Props**:
```typescript
interface MealAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealSlot: {
    dayOfWeek: DayOfWeek;
    mealType: MealType;
    mealPlanId: string;
  };
}
```

## 🔧 Services & Hooks

### MealPlanService

**Location**: `frontend/src/services/mealPlanService.ts`

**Key Methods**:
- `createMealPlan(data)` - Create new meal plan
- `getUserMealPlans(userId)` - Get all user meal plans
- `getMealPlanForWeek(userId, startDate)` - Get specific week
- `addMealToPlan(mealPlanId, recipeId, day, mealType)` - Add meal
- `removeMealFromPlan(plannedMealId)` - Remove meal
- `generateGroceryList(mealPlanId)` - Generate shopping list

**Development Features**:
- Dummy user support with localStorage fallback
- Week calculation utilities
- Template system for quick meal plans

### React Query Hooks

**Location**: `frontend/src/hooks/useMealPlansQuery.ts`

**Available Hooks**:
- `useMealPlans(userId)` - Get all meal plans
- `useCurrentWeekMealPlan(userId)` - Get current week
- `useCreateMealPlan()` - Create meal plan mutation
- `useAddMealToPlan()` - Add meal mutation
- `useRemoveMealFromPlan()` - Remove meal mutation
- `useGenerateGroceryList()` - Generate grocery list

**Features**:
- Optimistic updates for instant UI feedback
- Automatic cache invalidation
- Error handling with retry logic
- Loading states management

## 📱 Mobile-First Design

### Responsive Breakpoints

```css
/* Mobile First (320px+) */
.mobile-layout {
  /* Horizontal scrolling days */
  /* Touch-friendly 44px targets */
  /* Bottom sheet modals */
}

/* Tablet (640px+) */
@media (min-width: 640px) {
  /* Larger touch targets */
  /* More content visible */
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  /* Full 7-day grid */
  /* Drag-and-drop ready */
  /* Hover states */
}
```

### Touch Interactions

- **Minimum 44px touch targets** for all interactive elements
- **Horizontal scrolling** with snap-to-day behavior
- **Bottom sheet modals** for native mobile feel
- **Haptic feedback ready** (can be added with Web Vibration API)

### Mobile Features

- **Day indicator dots** for navigation context
- **Swipe gestures** (ready for implementation)
- **Pull-to-refresh** capability
- **Offline-first** with localStorage fallback

## 🎨 Styling & CSS

### CSS Classes Added

```css
/* Scrollbar hiding for smooth mobile scrolling */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Text truncation for recipe names */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

### Design Tokens

- **Touch targets**: 44px minimum for mobile accessibility
- **Spacing**: 8px grid system for consistent layout
- **Colors**: Apple-inspired design tokens
- **Animations**: Smooth transitions with reduced motion support

## 🔄 Data Types

### Core Types

```typescript
// Week-based meal planning
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Meal plan structure
export interface MealPlan {
  id: string;
  owner_id: string;
  plan_name: string;
  start_date: string; // Monday of the week
  grocery_list: GroceryItem[];
  planned_meals?: PlannedMeal[];
  created_at: string;
  updated_at: string;
}

// Individual planned meal
export interface PlannedMeal {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  recipe?: Recipe;
  created_at: string;
}
```

## 🧪 Testing Guidelines

### Component Testing

```typescript
// Example test structure
describe('MealPlanView', () => {
  it('should display current week by default', () => {
    // Test current week detection
  });

  it('should handle week navigation', () => {
    // Test prev/next week functionality
  });

  it('should open meal assignment modal', () => {
    // Test modal opening on add meal click
  });
});
```

### Integration Testing

- Test meal assignment flow end-to-end
- Verify optimistic updates work correctly
- Test error handling and retry logic
- Validate mobile touch interactions

## 🚀 Development Workflow

### Local Development

1. **Start the development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to meal planning**:
   - Go to `http://localhost:5173/plan`
   - Login with dummy user credentials
   - Test meal planning functionality

3. **Database Integration**:
   - Ensure Supabase database schema is deployed
   - Update environment variables if needed
   - Test with real user authentication

### Adding New Features

1. **Create new components** in `meal-planning/` directory
2. **Add to index.ts** for clean imports
3. **Update types** in `types/index.ts` if needed
4. **Add React Query hooks** for data operations
5. **Update service layer** for new API calls

## 🔮 Future Enhancements

### Phase 2: Desktop Features

- **Drag-and-drop** meal reordering
- **Bulk meal operations** (copy week, clear day)
- **Keyboard shortcuts** for power users
- **Multi-select** meal management

### Phase 3: Advanced Features

- **Recipe categorization** with smart filtering
- **Meal plan templates** with customization
- **Grocery list optimization** with store layouts
- **Nutritional analysis** and goal tracking

### Phase 4: Collaboration

- **Household meal planning** with shared access
- **Meal plan sharing** with friends/family
- **Collaborative grocery lists** with real-time updates
- **Meal suggestions** based on preferences

## 📚 API Integration

### Endpoints Used

```typescript
// Meal Plans
GET    /api/meal-plans          // Get user meal plans
POST   /api/meal-plans          // Create meal plan
PUT    /api/meal-plans/:id      // Update meal plan
DELETE /api/meal-plans/:id      // Delete meal plan

// Planned Meals
POST   /api/planned-meals       // Add meal to plan
PUT    /api/planned-meals/:id   // Move/update meal
DELETE /api/planned-meals/:id   // Remove meal

// Recipes (existing)
GET    /api/recipes             // Get user recipes
POST   /api/recipes/parse       // Parse recipe from URL
```

### Error Handling

- **Network errors**: Automatic retry with exponential backoff
- **Validation errors**: User-friendly error messages
- **Authentication errors**: Redirect to login
- **Server errors**: Graceful degradation with offline mode

## 🎯 Performance Considerations

### Optimization Strategies

- **React Query caching** for reduced API calls
- **Optimistic updates** for instant UI feedback
- **Image lazy loading** for recipe photos
- **Virtual scrolling** for large recipe lists (future)

### Bundle Size

- **Tree shaking** for unused code elimination
- **Code splitting** by route for faster initial load
- **Component lazy loading** for modal components

## 🔧 Troubleshooting

### Common Issues

1. **Meal plan not loading**:
   - Check user authentication
   - Verify database connection
   - Check browser console for errors

2. **Week navigation not working**:
   - Verify date calculation logic
   - Check timezone handling
   - Test with different locales

3. **Modal not opening**:
   - Check React Query hook status
   - Verify component state management
   - Test with different screen sizes

### Debug Tools

- **React Query Devtools** for cache inspection
- **Browser DevTools** for network requests
- **Console logging** for state debugging

This implementation provides a solid foundation for meal planning functionality with excellent mobile experience and room for future enhancements.
