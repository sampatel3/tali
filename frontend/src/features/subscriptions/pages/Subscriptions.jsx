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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  // Group by urgency
  const urgentSubs = subscriptions.filter(sub => {
    const dueDate = getDueDateDisplay(sub.nextChargeDate);
    return dueDate.urgent;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">💳 Subscriptions</h1>
          <p className="text-gray-600 mt-2">Manage all your recurring payments in one place</p>
        </div>
        <button onClick={handleDetect} disabled={detecting} className="btn-primary">
          {detecting ? (
            <>
              <div className="w-5 h-5 spinner mr-2"></div>
              Detecting...
            </>
          ) : (
            <>
              <span className="mr-2">🔍</span>
              Auto-Detect
            </>
          )}
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card-primary">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">💰</span>
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-lg">Monthly</span>
          </div>
          <div className="text-sm font-medium opacity-90 mb-1">Monthly Total</div>
          <div className="text-3xl font-bold">
            AED {totals.monthly?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">📅</span>
            <span className="badge badge-primary">Yearly</span>
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">Annual Projection</div>
          <div className="text-3xl font-bold text-gray-900">
            AED {(totals.monthly * 12)?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">✓</span>
            <span className="badge badge-success">Active</span>
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">Active Count</div>
          <div className="text-3xl font-bold text-gray-900">{totals.count || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl">⚠️</span>
            <span className="badge badge-warning">Urgent</span>
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">Due Soon</div>
          <div className="text-3xl font-bold text-warning-600">{urgentSubs.length}</div>
        </div>
      </div>

      {/* Urgent Subscriptions Alert */}
      {urgentSubs.length > 0 && (
        <div className="alert alert-warning">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-warning-900">Upcoming Charges</h3>
              <p className="text-sm opacity-90 mt-1">
                You have {urgentSubs.length} subscription{urgentSubs.length > 1 ? 's' : ''} due this week
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Grid */}
      {subscriptions.length === 0 ? (
        <div className="card-elevated text-center py-16">
          <div className="text-8xl mb-6 animate-bounce-subtle">💳</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Subscriptions Found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Upload a bank statement to automatically detect your subscriptions, or manually add them
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/upload" className="btn-primary">
              <span className="mr-2">📤</span>
              Upload Statement
            </Link>
            <button onClick={handleDetect} disabled={detecting} className="btn-secondary">
              {detecting ? (
                <>
                  <div className="w-5 h-5 spinner mr-2"></div>
                  Detecting...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  Auto-Detect
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub, idx) => {
            const dueDate = getDueDateDisplay(sub.nextChargeDate);
            return (
              <Link
                key={sub.id}
                to={`/subscriptions/${sub.id}`}
                className="card-elevated group cursor-pointer hover:scale-105 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center text-3xl shadow-md group-hover:shadow-glow transition-shadow">
                    {getCategoryIcon(sub.category)}
                  </div>
                  {dueDate.urgent && (
                    <span className="badge badge-warning animate-pulse-subtle">
                      Due Soon
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-xl text-gray-900 mb-3">{sub.merchantName}</h3>
                <p className="text-3xl font-bold gradient-text mb-4">
                  AED {parseFloat(sub.amount).toFixed(2)}
                </p>
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Next charge:</span>
                    <span className={`font-semibold ${dueDate.color}`}>{dueDate.text}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="badge badge-primary capitalize">
                      {sub.billingFrequency}
                    </span>
                  </div>
                  {sub.category && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="text-gray-800 font-medium capitalize">{sub.category}</span>
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
