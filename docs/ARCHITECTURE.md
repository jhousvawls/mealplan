# System Architecture

## Overview

The Meal Planner App follows a modern three-tier architecture with a React frontend, Node.js backend microservice, and Supabase as the Backend-as-a-Service (BaaS) provider.

## Architecture Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Node.js/Express │    │    Supabase     │
│   (Frontend)    │◄──►│   (AI Service)   │    │   (Database)    │
│                 │    │                  │    │                 │
│ • UI Components │    │ • OpenAI API     │    │ • PostgreSQL    │
│ • State Mgmt    │    │ • AI Endpoints   │    │ • Auth Service  │
│ • Supabase SDK  │    │ • Prompt Logic   │    │ • Realtime      │
│ • Auth Flow     │    │ • Security Layer │    │ • Edge Functions│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │   OpenAI API     │
                    │                  │
                    │ • GPT-4/3.5      │
                    │ • Meal Generation│
                    │ • Recipe Details │
                    └──────────────────┘
```

## Component Architecture

### Frontend (React SPA)

**Responsibilities:**
- User interface rendering and interactions
- Client-side routing and navigation
- Application state management
- Direct communication with Supabase for data operations
- Authentication flow management
- Real-time data synchronization

**Key Components:**
- **Authentication**: Google OAuth integration via Supabase Auth
- **Meal Planning Interface**: Drag-and-drop meal planning calendar
- **Recipe Management**: CRUD operations for personal recipes
- **Sharing Interface**: Collaborative features for household members
- **Grocery List Generator**: Automated shopping list creation

**Technology Stack:**
- React 18+ with functional components and hooks
- React Router for client-side routing
- Supabase JavaScript client for database operations
- Context API or Redux for state management
- CSS Modules or Styled Components for styling

### Backend (Node.js/Express Microservice)

**Responsibilities:**
- Secure OpenAI API integration
- AI prompt engineering and response processing
- API key management and security
- Complex business logic for AI features
- Rate limiting and request validation

**Key Features:**
- **AI Meal Generation**: Process user preferences and generate meal suggestions
- **Recipe Enhancement**: Use AI to complete recipe details and nutrition info
- **Security Layer**: Protect API keys and validate requests
- **Error Handling**: Robust error handling for AI service failures

**API Endpoints:**
```
POST /api/generate-meals
POST /api/get-recipe-details
POST /api/enhance-nutrition
GET /api/health
```

### Database (Supabase/PostgreSQL)

**Responsibilities:**
- Persistent data storage
- User authentication and authorization
- Real-time data synchronization
- Row Level Security (RLS) policies
- Database triggers and functions

**Key Features:**
- **Authentication**: Built-in user management with Google OAuth
- **Real-time**: Live updates for collaborative features
- **Security**: Row-level security for data isolation
- **Scalability**: Managed PostgreSQL with automatic scaling

## Data Flow

### User Authentication Flow
1. User clicks "Sign in with Google"
2. Supabase Auth handles OAuth flow
3. User session established in React app
4. User profile created/updated in database
5. Household assignment (new or existing)

### Meal Planning Flow
1. User creates new meal plan in React UI
2. Plan data saved to Supabase via client SDK
3. Real-time updates notify other household members
4. AI suggestions requested from Node.js backend
5. Generated meals saved to user's recipe collection

### Collaboration Flow
1. Plan owner shares via email invitation
2. Share record created in meal_plan_shares table
3. Invited user receives real-time notification
4. Shared plan appears in "Shared With Me" section
5. Collaborative editing with real-time sync

## Security Architecture

### Authentication & Authorization
- **Google OAuth**: Single sign-on via Supabase Auth
- **JWT Tokens**: Secure session management
- **Row Level Security**: Database-level access control
- **API Key Protection**: OpenAI keys secured in backend only

### Data Security
- **HTTPS**: All communications encrypted in transit
- **Environment Variables**: Sensitive data in environment configs
- **Input Validation**: Sanitization of all user inputs
- **Rate Limiting**: API abuse prevention

### Privacy
- **Data Isolation**: Users only access their own data and shared plans
- **Household Boundaries**: Data sharing limited to household members
- **Audit Trails**: Track data access and modifications

## Scalability Considerations

### Frontend Scaling
- **Code Splitting**: Lazy loading of route components
- **Caching**: Intelligent caching of recipe and plan data
- **CDN**: Static asset delivery via CDN
- **Progressive Loading**: Incremental data loading

### Backend Scaling
- **Horizontal Scaling**: Multiple Node.js instances
- **Load Balancing**: Distribute AI processing load
- **Caching**: Redis for frequently accessed AI responses
- **Queue System**: Background processing for heavy AI tasks

### Database Scaling
- **Connection Pooling**: Efficient database connections
- **Read Replicas**: Scale read operations
- **Indexing**: Optimized queries for large datasets
- **Partitioning**: Table partitioning for historical data

## Development Architecture

### Environment Management
- **Development**: Local development with hot reloading
- **Staging**: Production-like environment for testing
- **Production**: Optimized build with monitoring

### CI/CD Pipeline
- **Source Control**: Git with feature branch workflow
- **Testing**: Automated unit and integration tests
- **Deployment**: Automated deployment to staging/production
- **Monitoring**: Application performance monitoring

### Code Organization
- **Modular Design**: Separation of concerns
- **Reusable Components**: Shared UI component library
- **Service Layer**: Abstracted API interactions
- **Type Safety**: TypeScript for enhanced development experience

## Performance Optimization

### Frontend Performance
- **Bundle Optimization**: Tree shaking and code splitting
- **Image Optimization**: Lazy loading and compression
- **Caching Strategy**: Service worker for offline capability
- **Virtual Scrolling**: Efficient rendering of large lists

### Backend Performance
- **Response Caching**: Cache AI responses for common queries
- **Connection Pooling**: Efficient database connections
- **Async Processing**: Non-blocking I/O operations
- **Compression**: Gzip compression for API responses

### Database Performance
- **Query Optimization**: Efficient SQL queries with proper indexing
- **Connection Management**: Pooled connections
- **Data Pagination**: Limit data transfer for large datasets
- **Real-time Optimization**: Efficient subscription management
