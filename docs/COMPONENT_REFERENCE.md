# Component Reference - MealMate Frontend

## Overview

This is your personal component reference for understanding and working with the MealMate React components. Use this when you need to remember how components work, their props, or common usage patterns.

## Component Categories

### UI Components (Base)
- [Button](#button) - Primary UI button component
- [Card](#card) - Container component for content sections

### Layout Components
- [Sidebar](#sidebar) - Main navigation sidebar
- [Layout](#layout) - Page layout wrapper
- [PageHeader](#pageheader) - Page title and actions

### Feature Components
- [RecipeImportModal](#recipeimportmodal) - Recipe import with URL/text parsing
- [MealPlanView](#mealplanview) - Weekly meal planning interface
- [FavoriteButton](#favoritebutton) - Recipe favoriting functionality
- [GroceryListView](#grocerylistview) - Interactive grocery list management

## UI Components

### Button

**File**: `frontend/src/components/ui/Button.tsx`

Basic button component with multiple variants and states.

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}
```

**Usage:**
```tsx
// Primary button
<Button variant="primary" onClick={handleSave}>
  Save Recipe
</Button>

// Loading state
<Button loading disabled>
  Importing...
</Button>

// Outline variant
<Button variant="outline" onClick={handleCancel}>
  Cancel
</Button>
```

### Card

**File**: `frontend/src/components/ui/Card.tsx`

Container component for grouping related content.

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}
```

**Usage:**
```tsx
// Basic card
<Card>
  <h3>Recipe Title</h3>
  <p>Recipe description...</p>
</Card>

// Card with hover effect
<Card hover className="cursor-pointer">
  <RecipeContent />
</Card>
```

## Feature Components

### RecipeImportModal

**File**: `frontend/src/components/features/recipes/RecipeImportModal.tsx`

**Purpose**: Advanced modal for importing recipes from URLs or text with AI-powered parsing.

**Key Features**:
- Auto-detects URL vs text input
- AI-powered text parsing for social media recipes
- Image selection from parsed recipes
- Duplicate checking
- Error handling with helpful suggestions

**Props:**
```typescript
interface RecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (recipe: any) => void;
}
```

**Usage:**
```tsx
const [showImportModal, setShowImportModal] = useState(false);

<RecipeImportModal
  isOpen={showImportModal}
  onClose={() => setShowImportModal(false)}
  onSuccess={(recipe) => {
    console.log('Recipe imported:', recipe);
    setShowImportModal(false);
  }}
/>
```

**Internal State:**
- `input`: URL or text content
- `inputMode`: 'url' | 'text' (auto-detected)
- `importStatus`: 'idle' | 'success' | 'error'
- `confidence`: AI parsing confidence score (0-1)

**Key Methods:**
- `handleImport()`: Main import logic with mode detection
- `finalizeImport()`: Complete import with image selection
- `detectSocialMediaContext()`: Detect social media content
- `isValidUrl()`: URL validation

**Common Issues:**
- Socket hang up errors → Suggests text mode
- Invalid URL format → Shows validation errors
- Duplicate recipes → Prevents re-import

### MealPlanView

**File**: `frontend/src/components/features/meal-planning/MealPlanView.tsx`

**Purpose**: Main weekly meal planning interface with mobile-first design.

**Key Features**:
- Responsive weekly calendar view
- Mobile horizontal scrolling with snap behavior
- Compact view toggle for mobile
- Pull-to-refresh functionality
- Day indicator navigation
- Haptic feedback on mobile

**Props:**
```typescript
interface MealPlanViewProps {
  className?: string;
}
```

**Usage:**
```tsx
// Basic usage
<MealPlanView />

// With custom styling
<MealPlanView className="custom-meal-plan" />
```

**Internal State:**
- `currentWeekStart`: Week start date string
- `selectedMealSlot`: Currently selected meal slot
- `currentDayIndex`: Active day in mobile view (0-6)
- `compactView`: Mobile compact mode toggle
- `isRefreshing`: Pull-to-refresh state

**Key Methods:**
- `scrollToDay(dayIndex)`: Navigate to specific day on mobile
- `handlePullToRefresh()`: Manual refresh with haptic feedback
- `handleAddMeal()`: Open meal assignment modal
- `getMealsForDay()`: Filter meals by day

**Mobile Features:**
- Horizontal scroll with snap-to-day
- Day indicator dots with click navigation
- Compact view (3 days visible) vs normal (1.5 days)
- Haptic feedback (50ms vibration)
- Pull-to-refresh with loading state

**Desktop Features:**
- Full 7-column grid layout
- Hover states and interactions
- Drag-and-drop ready architecture

### FavoriteButton

**File**: `frontend/src/components/features/recipes/FavoriteButton.tsx`

**Purpose**: Interactive heart button for favoriting recipes with optimistic updates.

**Key Features**:
- Optimistic UI updates
- Multiple size variants
- Haptic feedback on mobile
- Accessibility support
- Error handling with rollback

**Props:**
```typescript
interface FavoriteButtonProps {
  recipeId: string;
  isFavorited: boolean;
  onToggle?: (recipeId: string, isFavorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}
```

**Usage:**
```tsx
// Basic usage
<FavoriteButton
  recipeId={recipe.id}
  isFavorited={recipe.is_favorited}
  onToggle={(id, favorited) => {
    console.log(`Recipe ${id} ${favorited ? 'favorited' : 'unfavorited'}`);
  }}
/>

// Small size for recipe cards
<FavoriteButton
  recipeId={recipe.id}
  isFavorited={recipe.is_favorited}
  size="sm"
/>

// Large size for recipe details
<FavoriteButton
  recipeId={recipe.id}
  isFavorited={recipe.is_favorited}
  size="lg"
/>
```

**Behavior:**
- Immediate visual feedback (optimistic update)
- Heart fills/unfills with smooth animation
- Haptic feedback on mobile (30ms vibration)
- Automatic rollback on API error
- Loading state during API call

### GroceryListView

**File**: `frontend/src/components/features/grocery/GroceryListView.tsx`

**Purpose**: Interactive grocery list management with categories and progress tracking.

**Key Features**:
- Category-organized items (Produce, Dairy, Meat, etc.)
- Real-time progress tracking
- Interactive checkboxes
- Add custom items
- Bulk actions (clear checked items)
- Mobile-optimized touch targets

**Props:**
```typescript
interface GroceryListViewProps {
  mealPlanId: string;
  className?: string;
}
```

**Usage:**
```tsx
// Basic usage
<GroceryListView mealPlanId={currentMealPlan.id} />

// With custom styling
<GroceryListView 
  mealPlanId={currentMealPlan.id}
  className="custom-grocery-list"
/>
```

**Features:**
- **Progress Bar**: Visual completion percentage
- **Category Sections**: Organized by store layout
- **Add Items**: Form to add custom grocery items
- **Bulk Actions**: Clear all checked items
- **Touch Friendly**: 44px minimum touch targets

**Item Structure:**
```typescript
interface GroceryItem {
  id: string;
  name: string;
  quantity?: string;
  category: string;
  checked: boolean;
  notes?: string;
}
```

## Layout Components

### Sidebar

**File**: `frontend/src/components/layout/Sidebar.tsx`

**Purpose**: Main navigation sidebar with user info and menu items.

**Key Features**:
- Collapsible on desktop
- User profile display
- Active route highlighting
- Sign out functionality

**Usage:**
```tsx
// Automatically included in Layout component
// No direct usage needed
```

### Layout

**File**: `frontend/src/components/layout/Layout.tsx`

**Purpose**: Main page layout wrapper with sidebar and content area.

**Props:**
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

**Usage:**
```tsx
// Wrap page content
<Layout>
  <PageHeader title="Meal Planning" />
  <MealPlanView />
</Layout>
```

### PageHeader

**File**: `frontend/src/components/layout/PageHeader.tsx`

**Purpose**: Consistent page header with title and optional actions.

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}
```

**Usage:**
```tsx
// Basic header
<PageHeader title="Recipe Box" />

// With subtitle and actions
<PageHeader
  title="Meal Planning"
  subtitle="Plan your weekly meals"
  actions={
    <Button onClick={handleCreatePlan}>
      Create New Plan
    </Button>
  }
/>
```

## Common Patterns

### React Query Integration

Most components use React Query for data fetching:

```tsx
// Hook usage pattern
const { data: recipes, isLoading, error } = useRecipesQuery();

// Mutation pattern
const importRecipe = useImportRecipe();
const handleImport = async () => {
  try {
    const result = await importRecipe.mutateAsync(recipeData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Error Handling Pattern

```tsx
// Standard error display
{error && (
  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="w-5 h-5 text-red-600" />
    <span className="text-sm text-red-700">
      {error.message || 'Something went wrong'}
    </span>
  </div>
)}
```

### Loading States Pattern

```tsx
// Standard loading state
{isLoading ? (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
) : (
  <ActualContent />
)}
```

### Mobile-First Responsive Pattern

```tsx
// Mobile-first with desktop enhancements
<div className="block md:hidden">
  {/* Mobile-specific content */}
</div>
<div className="hidden md:block">
  {/* Desktop-specific content */}
</div>
```

## Styling Conventions

### CSS Classes Used

**Layout Classes:**
- `page-title` - Main page headings
- `page-subtitle` - Secondary headings
- `card` - Container styling
- `card-hover` - Hover effects

**Interactive Classes:**
- `button` - Button base styling
- `input` - Form input styling
- `modal-overlay` - Modal backdrop
- `modal-content` - Modal container

**Responsive Classes:**
- `mobile-only` - Mobile-specific content
- `desktop-only` - Desktop-specific content
- `touch-target` - 44px minimum touch areas

### Color System

**Primary Colors:**
- `--blue` - Primary actions, links
- `--green` - Success states, favorites
- `--red` - Errors, delete actions
- `--purple` - AI features, text parsing

**Text Colors:**
- `--text-primary` - Main content
- `--text-secondary` - Supporting text
- `--text-muted` - Disabled/placeholder text

## Testing Patterns

### Component Testing

```tsx
// Test component rendering
import { render, screen } from '@testing-library/react';
import { TestWrapper } from '../../../__tests__/utils/test-utils';

test('renders recipe import modal', () => {
  render(
    <TestWrapper>
      <RecipeImportModal isOpen={true} onClose={jest.fn()} />
    </TestWrapper>
  );
  
  expect(screen.getByText('Import Recipe')).toBeInTheDocument();
});
```

### Hook Testing

```tsx
// Test custom hooks
import { renderHook } from '@testing-library/react';
import { useRecipesQuery } from '../hooks/useRecipesQuery';

test('fetches recipes correctly', async () => {
  const { result } = renderHook(() => useRecipesQuery(), {
    wrapper: TestWrapper,
  });
  
  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

## Performance Notes

### Optimization Techniques Used

1. **React.memo**: Used for expensive components
2. **useCallback**: Memoized event handlers
3. **useMemo**: Memoized computed values
4. **Lazy Loading**: Route-based code splitting
5. **Optimistic Updates**: Immediate UI feedback

### Mobile Performance

1. **Touch Optimization**: 44px minimum touch targets
2. **Smooth Scrolling**: Hardware-accelerated animations
3. **Haptic Feedback**: Light vibrations (30-50ms)
4. **Efficient Rendering**: Conditional mobile/desktop components

This component reference covers the main components you'll work with and provides practical examples for common usage patterns.
