import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './components/features/dashboard/Dashboard';
import ComingSoon from './components/common/ComingSoon';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plan" element={<ComingSoon title="Meal Planning" description="Create and manage your weekly meal plans" />} />
              <Route path="/plan/:id" element={<ComingSoon title="Meal Plan View" description="View and edit your meal plan" />} />
              <Route path="/plan/create" element={<ComingSoon title="Create Meal Plan" description="Create a new meal plan" />} />
              <Route path="/groceries" element={<ComingSoon title="Grocery Lists" description="Manage your grocery shopping lists" />} />
              <Route path="/recipes" element={<ComingSoon title="Recipe Box" description="Store and organize your favorite recipes" />} />
              <Route path="/settings" element={<ComingSoon title="Settings" description="Manage your account and preferences" />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
