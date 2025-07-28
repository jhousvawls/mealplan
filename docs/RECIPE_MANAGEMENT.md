# Recipe Management System

## Overview

The Recipe Management system allows users to import, store, and manage recipes from various food blogs and websites. It features a modern React Query-based architecture with beautiful UI components and comprehensive error handling.

## Features

### ✅ Implemented Features

- **Recipe Import**: Import recipes from URLs using web scraping
- **Recipe Storage**: Store recipes with ingredients, instructions, and metadata
- **Search & Filter**: Real-time search and cuisine-based filtering
- **Beautiful UI**: Apple-inspired design with dark theme support
- **Error Handling**: Comprehensive error handling and user feedback
- **Type Safety**: Full TypeScript support throughout the system

### 🚧 In Progress

- **Recipe CRUD**: Manual recipe creation and editing
- **Database Integration**: Supabase integration for persistent storage
- **Advanced Parsing**: Enhanced web scraping with anti-bot protection

## Architecture

### Frontend Components

```
frontend/src/components/features/recipes/
├── RecipeBox.tsx              # Main recipe management interface
├── RecipeImportModal.tsx      # Recipe import modal
└── ImageSelectionModal.tsx    # Image selection for recipes
```

### React Query Hooks

```
frontend/src/hooks/useRecipesQuery.ts
├── useRecipes()              # Fetch all recipes
├── useParseRecipe()          # Parse recipe from URL
├── useImportRecipe()         # Import parsed recipe
├── useCheckDuplicate()       # Check for duplicate recipes
└── useDeleteRecipe()         # Delete recipe
```

### Backend Services

```
backend/src/
├── routes/recipe.ts          # Recipe API endpoints
├── services/recipeParser.ts  # Web scraping service
└── types/index.ts           # Recipe type definitions
```

## API Endpoints

### Recipe Parsing
```http
POST /api/recipes/parse
Content-Type: application/json

{
  "url": "https://example.com/recipe",
  "options": {
    "includeImages": true,
    "maxImages": 10
  }
}
```

**Response:**
```json
{
  "success": true,
  "recipe": {
    "name": "Recipe Name",
    "ingredients": [
      {
        "name": "Ingredient",
        "amount": "1 cup",
        "unit": "cup"
      }
    ],
    "instructions": "Step-by-step instructions...",
    "prep_time": "30 minutes",
    "cuisine": "Italian"
  },
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "type": "hero",
      "alt_text": "Recipe image"
    }
  ]
}
```

### Recipe Import
```http
POST /api/recipes/import
Content-Type: application/json

{
  "url": "https://example.com/recipe",
  "user_id": "user-uuid"
}
```

## Data Models

### Recipe Interface
```typescript
interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string;
  source_url?: string;
  prep_time?: string;
  cuisine?: string;
  estimated_nutrition?: NutritionInfo;
  featured_image?: string;
  image_alt_text?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}
```

### Ingredient Interface
```typescript
interface Ingredient {
  name: string;
  amount: string;
  unit?: string;
  notes?: string;
}
```

## Usage Examples

### Importing a Recipe
```typescript
import { useParseRecipe, useImportRecipe } from '../hooks/useRecipesQuery';

const RecipeImport = () => {
  const parseRecipe = useParseRecipe();
  const importRecipe = useImportRecipe();

  const handleImport = async (url: string) => {
    try {
      // Parse recipe from URL
      const result = await parseRecipe.mutateAsync(url);
      
      // Import the parsed recipe
      const recipe = await importRecipe.mutateAsync(url);
      
      console.log('Recipe imported:', recipe);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };
};
```

### Displaying Recipes
```typescript
import { useRecipes } from '../hooks/useRecipesQuery';

const RecipeList = () => {
  const { data: recipes, isLoading, error } = useRecipes();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {recipes?.map(recipe => (
        <div key={recipe.id}>
          <h3>{recipe.name}</h3>
          <p>{recipe.cuisine}</p>
        </div>
      ))}
    </div>
  );
};
```

## Supported Recipe Sources

The system supports importing recipes from:

- AllRecipes.com
- Food Network
- Bon Appétit
- Serious Eats
- Tasty
- BBC Good Food
- Most recipe websites with structured data

## Error Handling

### Common Errors

1. **CORS Errors**: Fixed by configuring multiple allowed origins
2. **Parsing Failures**: Handled with user-friendly error messages
3. **Network Issues**: Retry logic and timeout handling
4. **Invalid URLs**: Client-side validation before API calls

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Performance Optimizations

### React Query Configuration
- **Stale Time**: 5 minutes for recipe data
- **Cache Time**: 10 minutes for inactive queries
- **Retry Logic**: 3 attempts with exponential backoff
- **Background Refetch**: Disabled for recipe data

### Caching Strategy
- Recipe lists cached for 5 minutes
- Individual recipes cached indefinitely
- Automatic cache invalidation on mutations

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend server running on port 3001

### Installation
```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Start development servers
npm run dev  # Frontend (port 5173+)
npm run dev  # Backend (port 3001)
```

### Environment Variables
```env
# Backend
OPENAI_API_KEY=your_openai_key
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:3001
```

## Testing

### Manual Testing
1. Navigate to Recipe Box in the application
2. Click "Import Recipe" button
3. Enter a recipe URL (e.g., AllRecipes link)
4. Verify parsing and import functionality

### Error Testing
- Test with invalid URLs
- Test with unsupported websites
- Test network failure scenarios

## Future Enhancements

### Planned Features
1. **Manual Recipe Creation**: Form-based recipe entry
2. **Recipe Editing**: Update existing recipes
3. **Advanced Search**: Full-text search across ingredients and instructions
4. **Recipe Collections**: Organize recipes into custom collections
5. **Nutrition Analysis**: Detailed nutritional information
6. **Recipe Sharing**: Share recipes between users
7. **Meal Planning Integration**: Add recipes to meal plans

### Technical Improvements
1. **Enhanced Parsing**: Better support for complex recipe formats
2. **Image Processing**: Automatic image optimization and storage
3. **Offline Support**: PWA capabilities for offline recipe access
4. **Performance**: Virtual scrolling for large recipe collections

## Troubleshooting

### Common Issues

**Recipe Import Fails**
- Check if the website blocks automated requests
- Verify the URL is accessible
- Check backend logs for detailed error information

**CORS Errors**
- Ensure backend CORS configuration includes frontend port
- Check if frontend and backend are running on expected ports

**UI Not Loading**
- Verify React Query client is properly configured
- Check browser console for JavaScript errors
- Ensure all dependencies are installed

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=recipe-parser
LOG_LEVEL=debug
```

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Include JSDoc comments for complex functions

### Testing Requirements
- Test all new API endpoints
- Verify UI components in different states
- Test error scenarios thoroughly

### Documentation
- Update this document for new features
- Add inline code comments
- Update API documentation for endpoint changes
