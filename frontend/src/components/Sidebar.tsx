import { BarChart3, Briefcase, Settings, TrendingUp } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/portfolios', icon: Briefcase, label: 'Portfolios' },
    { path: '/analysis', icon: TrendingUp, label: 'Analysis' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">EconLens</h1>
        <p className="text-sm text-gray-600">Portfolio Analysis</p>
      </div>

      <nav className="mt-6">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
