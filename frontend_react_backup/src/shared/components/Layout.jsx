import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  CreditCard,
  RefreshCcw,
  Gift,
  TrendingUp,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/onboarding');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/subscriptions', label: 'Subscriptions', icon: RefreshCcw },
    { path: '/loyalty', label: 'Loyalty', icon: Gift },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Professional Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TALI</h1>
                <p className="text-[10px] text-gray-500 -mt-0.5">Smart Finance Manager</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {/* Notification */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.fullName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email || 'user@tali.ae'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Professional Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-700' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Savings Widget */}
          <div className="p-4 mt-6 mx-3">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium opacity-90">Monthly Savings</p>
                <TrendingUp className="w-4 h-4 opacity-75" />
              </div>
              <p className="text-2xl font-bold mb-1">AED 1,240</p>
              <p className="text-xs opacity-75">↑ 15% from last month</p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
