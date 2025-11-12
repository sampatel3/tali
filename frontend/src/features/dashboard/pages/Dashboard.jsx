import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, subscriptionsAPI, loyaltyAPI } from '../../../shared/services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [upcomingSubscriptions, setUpcomingSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, subsData] = await Promise.all([
          analyticsAPI.getOverview(),
          subscriptionsAPI.getAll('active'),
        ]);

        setOverview(overviewData.data);

        // Get next 5 upcoming renewals
        const upcoming = subsData.data.subscriptions
          .filter(s => s.nextChargeDate)
          .sort((a, b) => new Date(a.nextChargeDate) - new Date(b.nextChargeDate))
          .slice(0, 5);

        setUpcomingSubscriptions(upcoming);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    const icons = {
      entertainment: '🎬',
      utilities: '⚡',
      fitness: '💪',
      food: '🍽️',
      shopping: '🛒',
      transport: '🚗',
      telecom: '📱',
      default: '💳'
    };
    return icons[category] || icons.default;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your subscriptions and finances
          </p>
        </div>
        <Link to="/upload" className="btn-primary">
          <span className="mr-2">📤</span>
          Upload Statement
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Subscriptions */}
        <div className="stat-card-primary animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💳</span>
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-lg">Monthly</span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-2">Subscription Total</h3>
          <p className="text-3xl font-bold mb-1">
            AED {overview?.subscriptions?.monthlyTotal || '0.00'}
          </p>
          <p className="text-xs opacity-75">
            {overview?.subscriptions?.count || 0} active subscriptions
          </p>
        </div>

        {/* Loyalty Value */}
        <div className="stat-card-accent animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-lg">Rewards</span>
          </div>
          <h3 className="text-sm font-medium opacity-90 mb-2">Loyalty Value</h3>
          <p className="text-3xl font-bold mb-1">
            AED {overview?.loyalty?.totalValue || '0.00'}
          </p>
          <p className="text-xs opacity-75">
            {overview?.loyalty?.cardsCount || 0} loyalty programs
          </p>
        </div>

        {/* Last 30 Days Spending */}
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <span className="badge badge-primary">30 days</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Spending</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            AED {overview?.spending?.last30Days || '0.00'}
          </p>
          <p className="text-xs text-gray-500">
            {overview?.spending?.transactionCount || 0} transactions
          </p>
        </div>

        {/* Savings This Month */}
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <span className="badge badge-success">↑ 15%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Savings Goal</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            AED 1,240
          </p>
          <p className="text-xs text-gray-500">
            AED 760 remaining
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Renewals - Takes 2 columns */}
        <div className="lg:col-span-2 card-elevated">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Renewals</h2>
              <p className="text-sm text-gray-500 mt-1">Don't miss these upcoming charges</p>
            </div>
            <Link to="/subscriptions" className="btn-secondary text-sm">
              View All →
            </Link>
          </div>

          {upcomingSubscriptions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <span className="text-6xl mb-4 block">🎉</span>
              <p className="text-gray-600 mb-4">
                No upcoming renewals found
              </p>
              <Link to="/upload" className="btn-primary-outline">
                Upload Statement to Get Started
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSubscriptions.map((sub, idx) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group cursor-pointer"
                  style={{ animationDelay: `${0.1 * idx}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                      {getCategoryIcon(sub.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{sub.merchantName}</h3>
                      <p className="text-sm text-gray-500">
                        Due {formatDistanceToNow(new Date(sub.nextChargeDate), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900">
                      AED {parseFloat(sub.amount).toFixed(2)}
                    </p>
                    <span className="badge badge-primary text-xs">
                      {sub.billingFrequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>

          <Link to="/subscriptions" className="card hover:shadow-lg transition-all duration-300 group block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔍</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Detect Subscriptions</h3>
                <p className="text-xs text-gray-500">Auto-scan your transactions</p>
              </div>
            </div>
          </Link>

          <Link to="/loyalty" className="card hover:shadow-lg transition-all duration-300 group block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎁</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Loyalty Card</h3>
                <p className="text-xs text-gray-500">Track your rewards</p>
              </div>
            </div>
          </Link>

          <Link to="/analytics" className="card hover:shadow-lg transition-all duration-300 group block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">View Analytics</h3>
                <p className="text-xs text-gray-500">Spending insights</p>
              </div>
            </div>
          </Link>

          {/* Insights Card */}
          <div className="card-gradient mt-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="font-semibold text-lg">Smart Insight</h3>
                <p className="text-sm opacity-90 mt-2">
                  You have 3 unused subscriptions in the last 90 days. Cancel them to save AED 180/month!
                </p>
              </div>
            </div>
            <button className="btn-secondary w-full text-sm">
              Review Subscriptions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
