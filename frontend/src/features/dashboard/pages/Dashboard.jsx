import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, subscriptionsAPI, loyaltyAPI } from '../../../shared/services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  CreditCard,
  Gift,
  Wallet,
  TrendingUp,
  RefreshCcw,
  Upload,
  Sparkles,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  Clock
} from 'lucide-react';

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
          <div className="w-12 h-12 spinner mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-600 mt-1">
            Here's your financial overview
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Statement
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Subscriptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <RefreshCcw className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Monthly</span>
          </div>
          <h3 className="text-xs font-medium text-gray-600 mb-1">Subscriptions</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            AED {overview?.subscriptions?.monthlyTotal || '0.00'}
          </p>
          <p className="text-xs text-gray-500">
            {overview?.subscriptions?.count || 0} active
          </p>
        </div>

        {/* Loyalty Value */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-accent-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Rewards</span>
          </div>
          <h3 className="text-xs font-medium text-gray-600 mb-1">Loyalty Value</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            AED {overview?.loyalty?.totalValue || '0.00'}
          </p>
          <p className="text-xs text-gray-500">
            {overview?.loyalty?.cardsCount || 0} programs
          </p>
        </div>

        {/* Last 30 Days Spending */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">30 days</span>
          </div>
          <h3 className="text-xs font-medium text-gray-600 mb-1">Total Spending</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            AED {overview?.spending?.last30Days || '0.00'}
          </p>
          <p className="text-xs text-gray-500">
            {overview?.spending?.transactionCount || 0} transactions
          </p>
        </div>

        {/* Savings This Month */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            <span className="text-xs font-medium text-success-600 bg-success-100 px-2 py-1 rounded">↑ 15%</span>
          </div>
          <h3 className="text-xs font-medium text-gray-600 mb-1">Savings Goal</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            AED 1,240
          </p>
          <p className="text-xs text-gray-500">
            AED 760 remaining
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming Renewals */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Upcoming Renewals</h2>
              <p className="text-xs text-gray-600 mt-0.5">Next charges scheduled</p>
            </div>
            <Link
              to="/subscriptions"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingSubscriptions.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 mb-4">No upcoming renewals</p>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Statement
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{sub.merchantName}</h3>
                      <p className="text-xs text-gray-500">
                        Due {formatDistanceToNow(new Date(sub.nextChargeDate), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      AED {parseFloat(sub.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{sub.billingFrequency}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>

          <Link
            to="/subscriptions"
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:bg-primary-50/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                <RefreshCcw className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Detect Subscriptions</h3>
                <p className="text-xs text-gray-500">Auto-scan transactions</p>
              </div>
            </div>
          </Link>

          <Link
            to="/loyalty"
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-accent-300 hover:bg-accent-50/30 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center group-hover:bg-accent-600 transition-colors">
                <Gift className="w-5 h-5 text-accent-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Loyalty Programs</h3>
                <p className="text-xs text-gray-500">Track rewards</p>
              </div>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                <BarChart3 className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Analytics</h3>
                <p className="text-xs text-gray-500">Spending insights</p>
              </div>
            </div>
          </Link>

          {/* Insights Card */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl p-5 text-white mt-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">Smart Insight</h3>
                <p className="text-xs opacity-90 leading-relaxed">
                  3 unused subscriptions detected. Cancel to save AED 180/month
                </p>
              </div>
            </div>
            <Link
              to="/subscriptions"
              className="text-xs font-medium text-white/90 hover:text-white inline-flex items-center gap-1"
            >
              Review now
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
