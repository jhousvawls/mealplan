import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/features/dashboard/Dashboard';
import ComingSoon from './components/common/ComingSoon';
import LoginPage from './components/features/auth/LoginPage';
import AuthCallback from './components/features/auth/AuthCallback';
import ProtectedRoute from './components/features/auth/ProtectedRoute';
import { RecipeBox } from './components/features/recipes/RecipeBox';
import { MealPlanView } from './components/features/meal-planning';
import { GroceryListView } from './components/features/grocery/GroceryListView';
import { SmartGroceryListView } from './components/features/grocery/SmartGroceryListView';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="bg-background-main min-h-screen font-sans text-text-primary">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/plan" element={
                <ProtectedRoute>
                  <Layout>
                    <MealPlanView />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/plan/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <MealPlanView />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/plan/create" element={
                <ProtectedRoute>
                  <Layout>
                    <MealPlanView />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/groceries" element={
                <ProtectedRoute>
                  <Layout>
                    <SmartGroceryListView />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/recipes" element={
                <ProtectedRoute>
                  <Layout>
                    <RecipeBox />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout>
                    <ComingSoon title="Settings" description="Manage your account and preferences" />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
