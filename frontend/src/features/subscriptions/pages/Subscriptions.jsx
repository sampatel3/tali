import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionsAPI } from '../../../shared/services/api';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns';
import toast from 'react-hot-toast';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await subscriptionsAPI.getAll('active');
      setSubscriptions(data.subscriptions);
      setTotals(data.totals);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const { data } = await subscriptionsAPI.detect();
      toast.success(`Detected ${data.detected} new subscriptions!`);
      fetchSubscriptions();
    } catch (error) {
      toast.error('Detection failed');
    } finally {
      setDetecting(false);
    }
  };

  const getDueDateDisplay = (nextChargeDate) => {
    if (!nextChargeDate) return { text: 'Unknown', color: 'text-gray-500', urgent: false };

    const date = new Date(nextChargeDate);

    if (isPast(date)) {
      return { text: 'Overdue', color: 'text-red-600', urgent: true };
    } else if (isToday(date)) {
      return { text: 'Today!', color: 'text-red-600', urgent: true };
    } else if (isTomorrow(date)) {
      return { text: 'Tomorrow', color: 'text-orange-600', urgent: true };
    } else if (isThisWeek(date)) {
      return { text: formatDistanceToNow(date, { addSuffix: true }), color: 'text-orange-500', urgent: true };
    } else {
      return { text: format(date, 'MMM dd, yyyy'), color: 'text-gray-600', urgent: false };
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      entertainment: '🎬',
      software: '💻',
      utilities: '⚡',
      fitness: '💪',
      food: '🍽️',
      shopping: '🛍️',
      financial: '💳',
      education: '📚',
      news: '📰',
      gaming: '🎮',
      wellness: '🧘',
      insurance: '🛡️',
      transportation: '🚗',
    };
    return icons[category] || '📌';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading subscriptions...</p>
      </div>
    );
  }

  // Group by urgency
  const urgentSubs = subscriptions.filter(sub => {
    const dueDate = getDueDateDisplay(sub.nextChargeDate);
    return dueDate.urgent;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscriptions</h1>
          <p className="text-gray-600">Manage all your recurring payments</p>
        </div>
        <button onClick={handleDetect} disabled={detecting} className="btn-primary">
          {detecting ? 'Detecting...' : '🔍 Auto-Detect'}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Monthly Total</div>
          <div className="text-3xl font-bold text-primary-600">
            AED {totals.monthly?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Annual Projection</div>
          <div className="text-3xl font-bold text-gray-900">
            AED {(totals.monthly * 12)?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Active Count</div>
          <div className="text-3xl font-bold text-gray-700">{totals.count || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Due Soon</div>
          <div className="text-3xl font-bold text-orange-600">{urgentSubs.length}</div>
        </div>
      </div>

      {/* Urgent Subscriptions Alert */}
      {urgentSubs.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Upcoming Charges</h3>
              <p className="text-sm text-orange-700">
                You have {urgentSubs.length} subscription{urgentSubs.length > 1 ? 's' : ''} due this week
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Grid */}
      {subscriptions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscriptions Found</h3>
          <p className="text-gray-600 mb-6">
            Upload a bank statement to automatically detect your subscriptions
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/upload" className="btn-primary">
              Upload Statement
            </a>
            <button onClick={handleDetect} disabled={detecting} className="btn-secondary">
              {detecting ? 'Detecting...' : 'Auto-Detect'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => {
            const dueDate = getDueDateDisplay(sub.nextChargeDate);
            return (
              <Link
                key={sub.id}
                to={`/subscriptions/${sub.id}`}
                className="card hover:shadow-lg transition-shadow border-l-4 border-primary-500"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{getCategoryIcon(sub.category)}</div>
                  {dueDate.urgent && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                      Due Soon
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{sub.merchantName}</h3>
                <p className="text-3xl font-bold text-primary-600 mb-3">
                  AED {parseFloat(sub.amount).toFixed(2)}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Next charge:</span>
                    <span className={`font-medium ${dueDate.color}`}>{dueDate.text}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Frequency:</span>
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs font-medium rounded capitalize">
                      {sub.billingFrequency}
                    </span>
                  </div>
                  {sub.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-800 capitalize">{sub.category}</span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
