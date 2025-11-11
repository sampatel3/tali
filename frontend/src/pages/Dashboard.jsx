import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, subscriptionsAPI, loyaltyAPI } from '../services/api';
import toast from 'react-hot-toast';

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
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Monthly Subscriptions</h3>
          <p className="text-4xl font-bold">
            AED {overview?.subscriptions?.monthlyTotal || '0.00'}
          </p>
          <p className="text-sm opacity-90 mt-2">
            {overview?.subscriptions?.count || 0} active subscriptions
          </p>
        </div>

        <div className="card bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Loyalty Value</h3>
          <p className="text-4xl font-bold">
            AED {overview?.loyalty?.totalValue || '0.00'}
          </p>
          <p className="text-sm opacity-90 mt-2">
            {overview?.loyalty?.cardsCount || 0} loyalty cards
          </p>
        </div>

        <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Last 30 Days</h3>
          <p className="text-4xl font-bold">
            AED {overview?.spending?.last30Days || '0.00'}
          </p>
          <p className="text-sm opacity-90 mt-2">
            {overview?.spending?.transactionCount || 0} transactions
          </p>
        </div>
      </div>

      {/* Upcoming Renewals */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upcoming Renewals</h2>
          <Link to="/subscriptions" className="text-primary-600 hover:text-primary-700 text-sm">
            View All →
          </Link>
        </div>

        {upcomingSubscriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No upcoming renewals. <Link to="/subscriptions" className="text-primary-600">Add subscriptions</Link> to track them.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingSubscriptions.map((sub) => (
              <div key={sub.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{sub.merchantName}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(sub.nextChargeDate).toLocaleDateString('en-AE', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">AED {parseFloat(sub.amount).toFixed(2)}</p>
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                    {sub.billingFrequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Link to="/subscriptions/detect" className="card hover:shadow-lg transition-shadow text-center">
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="font-semibold">Detect Subscriptions</h3>
          <p className="text-sm text-gray-600 mt-1">Scan transactions</p>
        </Link>

        <Link to="/loyalty" className="card hover:shadow-lg transition-shadow text-center">
          <div className="text-4xl mb-2">🎁</div>
          <h3 className="font-semibold">Add Loyalty Card</h3>
          <p className="text-sm text-gray-600 mt-1">Track rewards</p>
        </Link>

        <Link to="/upload" className="card hover:shadow-lg transition-shadow text-center">
          <div className="text-4xl mb-2">📄</div>
          <h3 className="font-semibold">Upload Statement</h3>
          <p className="text-sm text-gray-600 mt-1">Import PDF/CSV</p>
        </Link>

        <Link to="/analytics" className="card hover:shadow-lg transition-shadow text-center">
          <div className="text-4xl mb-2">📊</div>
          <h3 className="font-semibold">View Analytics</h3>
          <p className="text-sm text-gray-600 mt-1">Spending insights</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
