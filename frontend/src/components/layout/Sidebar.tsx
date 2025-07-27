import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  HomeIcon, 
  CalendarIcon, 
  ListBulletIcon, 
  BookOpenIcon, 
  Cog6ToothIcon,
  SparklesIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
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
  { id: 'groceries', icon: ListBulletIcon, label: 'Grocery List', path: '/groceries' },
  { id: 'recipes', icon: BookOpenIcon, label: 'Recipe Box', path: '/recipes' },
  { id: 'settings', icon: Cog6ToothIcon, label: 'Settings', path: '/settings' },
];

// Mock user data - will be replaced with real auth later
const mockUser = {
  id: '1',
  email: 'user@example.com',
  full_name: 'John Doe',
  avatar_url: null,
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    // Mock sign out - will be replaced with real auth later
    console.log('Sign out clicked');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-0 left-0 h-full bg-white border-r border-gray-200 w-20 md:w-64 flex flex-col z-10 transition-all duration-300 hidden md:flex">
        {/* Logo */}
        <div className="flex items-center justify-center md:justify-start h-20 border-b border-gray-200 px-6">
          <SparklesIcon className="w-6 h-6 text-blue-600" />
          <span className="hidden md:inline ml-3 text-lg font-bold text-blue-600">
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
                className={`flex items-center p-3 rounded-lg w-full transition-all duration-200 min-h-[44px] min-w-[44px] ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
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
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* User Info */}
          <div className="flex items-center p-3 rounded-lg">
            {mockUser?.avatar_url ? (
              <img 
                src={mockUser.avatar_url} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-gray-500" />
            )}
            <span className="hidden md:inline ml-4 font-semibold text-gray-900">
              {mockUser?.full_name || 'User'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center p-3 rounded-lg w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 min-h-[44px] min-w-[44px]"
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
            className="flex items-center p-3 rounded-lg w-full text-red-600 hover:bg-red-50 transition-all duration-200 min-h-[44px] min-w-[44px]"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            <span className="hidden md:inline ml-4 font-medium">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around h-16 z-20 md:hidden">
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
        <button 
          onClick={() => handleNavigation('/settings')}
          className="flex flex-col items-center justify-center flex-1 py-2 text-text-secondary"
        >
          <Cog6ToothIcon className="w-6 h-6" />
          <span className="text-xs mt-1">More</span>
        </button>
      </nav>
    </>
  );
}
