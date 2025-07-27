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
      <aside className="sidebar hidden md:flex">
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
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
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
            {mockUser?.avatar_url ? (
              <img 
                src={mockUser.avatar_url} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-text-secondary" />
            )}
            <span className="hidden md:inline ml-4 font-semibold text-text-primary">
              {mockUser?.full_name || 'User'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="nav-item"
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
            className="flex items-center p-3 rounded-lg w-full text-accent-red hover:bg-accent-red hover:bg-opacity-10 transition-all duration-200 touch-target"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
            <span className="hidden md:inline ml-4 font-medium">
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav md:hidden">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 touch-target ${
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
          className="flex flex-col items-center justify-center flex-1 py-2 text-text-secondary touch-target"
        >
          <Cog6ToothIcon className="w-6 h-6" />
          <span className="text-xs mt-1">More</span>
        </button>
      </nav>
    </>
  );
}
