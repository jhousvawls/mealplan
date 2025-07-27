# Component Conversion Guide

## Overview

This guide shows how to convert the HTML mockup into React components using the Apple-inspired design system and mobile-first approach.

## Component Mapping

### Original HTML Structure → React Components

```
HTML Mockup Components          →    React Component Structure
├── App (main container)        →    src/App.tsx
├── Sidebar                     →    src/components/layout/Sidebar.tsx
├── PageHeader                  →    src/components/layout/PageHeader.tsx
├── LoginPage                   →    src/components/features/auth/LoginPage.tsx
├── LoginAsModal               →    src/components/features/auth/LoginModal.tsx
├── Dashboard                   →    src/components/features/dashboard/Dashboard.tsx
├── MealPlanView               →    src/components/features/meal-planning/MealPlanView.tsx
├── MealCard                   →    src/components/features/meal-planning/MealCard.tsx
├── ShareModal                 →    src/components/features/meal-planning/ShareModal.tsx
└── ComingSoonPage             →    src/components/common/ComingSoonPage.tsx
```

## Design System Updates

### Color Scheme Conversion

**Original (Green Theme) → New (Apple-Inspired)**

```css
/* OLD */
bg-green-100 text-green-700     →    bg-blue bg-opacity-10 text-blue
bg-green-600 hover:bg-green-700 →    bg-blue hover:bg-blue-hover
bg-gray-50                      →    bg-background-main
bg-white                        →    bg-background-secondary
border-gray-200                 →    border-border
text-gray-800                   →    text-text-primary
text-gray-600                   →    text-text-secondary
```

### Component Class Updates

```css
/* Navigation Items */
OLD: bg-green-100 text-green-700
NEW: nav-item nav-item-active

/* Buttons */
OLD: bg-blue-600 text-white hover:bg-blue-700
NEW: btn btn-primary

/* Cards */
OLD: bg-white rounded-2xl shadow-sm border border-gray-200
NEW: card

/* Inputs */
OLD: border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500
NEW: input
```

## Component Conversions

### 1. App Component

**Before (HTML):**
```javascript
function App() {
    const [page, setPage] = useState('dashboard');
    const [currentUser, setCurrentUser] = useState(null);
    // ... rest of state

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800 flex">
            {currentUser && <Sidebar />}
            <main className={`flex-1 transition-all duration-300 ${currentUser ? 'ml-20 md:ml-64' : ''}`}>
                {renderPage()}
            </main>
        </div>
    );
}
```

**After (React + TypeScript):**
```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/features/auth/LoginPage';
import Dashboard from './components/features/dashboard/Dashboard';
import MealPlanView from './components/features/meal-planning/MealPlanView';
import './styles/globals.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="bg-background-main min-h-screen font-sans text-text-primary">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route index element={<Dashboard />} />
                        <Route path="/plan/:id" element={<MealPlanView />} />
                        {/* Add other routes */}
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### 2. Sidebar Component

**Before (HTML):**
```javascript
function Sidebar() {
    const { page, setPage, currentUser, setCurrentUser } = useContext(AppContext);
    
    return (
        <aside className="fixed top-0 left-0 h-full bg-white border-r border-gray-200 w-20 md:w-64 flex flex-col z-10">
            <div className="flex items-center justify-center md:justify-start h-20 border-b border-gray-200 px-6">
                <SparklesIcon />
                <span className="hidden md:inline ml-3 text-lg font-bold text-green-600">MealMate</span>
            </div>
            {/* Navigation items */}
        </aside>
    );
}
```

**After (React + TypeScript):**
```typescript
// src/components/layout/Sidebar.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { 
  HomeIcon, 
  CalendarIcon, 
  ListIcon, 
  BookIcon, 
  SettingsIcon,
  SparklesIcon,
  UserIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: HomeIcon, label: 'Dashboard', path: '/' },
  { id: 'plan', icon: CalendarIcon, label: 'Meal Plan', path: '/plan' },
  { id: 'groceries', icon: ListIcon, label: 'Grocery List', path: '/groceries' },
  { id: 'recipes', icon: BookIcon, label: 'Recipe Box', path: '/recipes' },
  { id: 'settings', icon: SettingsIcon, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar desktop-only">
        {/* Logo */}
        <div className="flex items-center justify-center md:justify-start h-20 border-b border-border px-6">
          <SparklesIcon className="w-6 h-6 text-blue" />
          <span className="hidden md:inline ml-3 text-lg font-bold text-blue">
            MealMate
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`nav-item w-full ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon className="w-6 h-6" />
                <span className="hidden md:inline ml-4 font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-2">
          {/* User Info */}
          <div className="flex items-center p-3 rounded-lg">
            {user?.user_metadata?.avatar_url ? (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-text-secondary" />
            )}
            <span className="hidden md:inline ml-4 font-semibold text-text-primary">
              {user?.user_metadata?.full_name || 'User'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="nav-item w-full"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="w-6 h-6" />
            ) : (
              <MoonIcon className="w-6 h-6" />
            )}
            <span className="hidden md:inline ml-4 font-medium">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="nav-item w-full text-accent-red hover:bg-accent-red hover:bg-opacity-10"
          >
            <LogOutIcon className="w-6 h-6" />
            <span className="hidden md:inline ml-4 font-medium">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav mobile-only">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 ${
                isActive ? 'text-blue' : 'text-text-secondary'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
        
        {/* More Menu for Mobile */}
        <button className="flex flex-col items-center justify-center flex-1 py-2 text-text-secondary">
          <SettingsIcon className="w-6 h-6" />
          <span className="text-xs mt-1">More</span>
        </button>
      </nav>
    </>
  );
}
```

### 3. Dashboard Component

**Before (HTML):**
```javascript
function Dashboard() {
    const { setPage, currentUser, db, setActiveMealPlan } = useContext(AppContext);
    
    return (
        <div>
            <PageHeader title="Dashboard" subtitle={`Welcome back, ${currentUser.name.split(' ')[0]}!`} />
            <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Meal plan cards */}
                </div>
            </div>
        </div>
    );
}
```

**After (React + TypeScript):**
```typescript
// src/components/features/dashboard/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { mealPlanService } from '../../../services/mealPlanService';
import PageHeader from '../../layout/PageHeader';
import MealPlanCard from './MealPlanCard';
import CreatePlanCard from './CreatePlanCard';
import LoadingSpinner from '../../ui/LoadingSpinner';
import { MealPlan } from '../../../types/mealPlan';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: mealPlans, isLoading, error } = useQuery({
    queryKey: ['mealPlans', user?.id],
    queryFn: () => mealPlanService.getUserMealPlans(user!.id),
    enabled: !!user,
  });

  const { data: sharedPlans } = useQuery({
    queryKey: ['sharedMealPlans', user?.id],
    queryFn: () => mealPlanService.getSharedMealPlans(user!.id),
    enabled: !!user,
  });

  const handleViewPlan = (plan: MealPlan) => {
    navigate(`/plan/${plan.id}`);
  };

  const handleCreatePlan = () => {
    navigate('/plan/create');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-accent-red">
          Error loading meal plans. Please try again.
        </div>
      </div>
    );
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${firstName}!`} 
      />
      
      <div className="p-8 space-y-8">
        {/* My Meal Plans */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-text-primary">
            My Meal Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mealPlans?.map((plan) => (
              <MealPlanCard
                key={plan.id}
                plan={plan}
                onView={() => handleViewPlan(plan)}
              />
            ))}
            <CreatePlanCard onClick={handleCreatePlan} />
          </div>
        </section>

        {/* Shared Plans */}
        {sharedPlans && sharedPlans.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-text-primary">
              Shared With Me
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedPlans.map((plan) => (
                <MealPlanCard
                  key={plan.id}
                  plan={plan}
                  onView={() => handleViewPlan(plan)}
                  isShared
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
```

### 4. MealPlanCard Component

**Before (HTML):**
```javascript
// Inline JSX in Dashboard
<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
    <p className="text-gray-600 mb-4">You have {Object.keys(plan.days).length} days planned.</p>
    <button onClick={() => viewPlan(plan)} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">View Plan</button>
</div>
```

**After (React + TypeScript):**
```typescript
// src/components/features/dashboard/MealPlanCard.tsx
import React from 'react';
import { CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { MealPlan } from '../../../types/mealPlan';
import { formatDate } from '../../../utils/dateUtils';

interface MealPlanCardProps {
  plan: MealPlan;
  onView: () => void;
  isShared?: boolean;
}

export default function MealPlanCard({ plan, onView, isShared = false }: MealPlanCardProps) {
  const plannedDaysCount = plan.planned_meals?.length || 0;
  const startDate = new Date(plan.start_date);

  return (
    <div className="dashboard-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text-primary mb-1">
            {plan.name}
          </h3>
          <div className="flex items-center text-text-secondary text-sm">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{formatDate(startDate)}</span>
          </div>
        </div>
        {isShared && (
          <div className="flex items-center text-blue text-sm">
            <UsersIcon className="w-4 h-4 mr-1" />
            <span>Shared</span>
          </div>
        )}
      </div>

      <p className="text-text-secondary mb-4">
        {plannedDaysCount > 0 
          ? `${plannedDaysCount} meals planned`
          : 'No meals planned yet'
        }
      </p>

      <button 
        onClick={onView}
        className="btn btn-primary w-full"
      >
        View Plan
      </button>
    </div>
  );
}
```

## Mobile Optimization Changes

### 1. Navigation Strategy

**Desktop:** Fixed sidebar with full navigation
**Mobile:** Bottom tab navigation with essential items

```typescript
// Mobile navigation shows only core features
const mobileNavItems = navItems.slice(0, 4); // Dashboard, Plan, Groceries, Recipes

// Additional features accessible through "More" menu
```

### 2. Meal Planning Grid

**Desktop:** 7-column grid (full week view)
**Tablet:** 3-4 column grid with horizontal scroll
**Mobile:** Single column with day navigation

```css
/* Responsive meal planning grid */
.meal-grid {
  @apply grid gap-6;
  @apply grid-cols-1;           /* Mobile: Stack days */
  @apply md:grid-cols-3;        /* Tablet: 3 days visible */
  @apply lg:grid-cols-5;        /* Desktop: 5 days */
  @apply xl:grid-cols-7;        /* Large: Full week */
}
```

### 3. Touch Targets

All interactive elements use the `touch-target` class for 44px minimum size:

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}
```

## TypeScript Integration

### Type Definitions

```typescript
// src/types/mealPlan.ts
export interface MealPlan {
  id: string;
  name: string;
  start_date: string;
  owner_id: string;
  household_id: string;
  planned_meals?: PlannedMeal[];
  created_at: string;
  updated_at: string;
}

export interface PlannedMeal {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  recipe?: Recipe;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
```

### Props Interfaces

```typescript
// Component props with proper typing
interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}
```

## Next Steps

1. **Set up the project structure** with the new component organization
2. **Convert each component** following the patterns shown above
3. **Implement the theme system** with dark/light mode toggle
4. **Add mobile-specific components** for optimal mobile experience
5. **Integrate with Supabase** for real data
6. **Add proper error handling** and loading states
7. **Implement responsive design** with mobile-first approach

This conversion guide provides the foundation for transforming your beautiful HTML mockup into a production-ready React application with modern development practices.
