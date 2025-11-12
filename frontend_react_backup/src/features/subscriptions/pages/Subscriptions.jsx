import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionsAPI } from '../../../shared/services/api';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns';
import toast from 'react-hot-toast';
import {
  RefreshCcw,
  Calendar,
  TrendingUp,
  AlertCircle,
  CreditCard,
  Upload,
  Loader2,
  CheckCircle2,
  Clock
} from 'lucide-react';

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
      return { text: 'Overdue', color: 'text-danger-600', urgent: true };
    } else if (isToday(date)) {
      return { text: 'Today', color: 'text-danger-600', urgent: true };
    } else if (isTomorrow(date)) {
      return { text: 'Tomorrow', color: 'text-warning-600', urgent: true };
    } else if (isThisWeek(date)) {
      return { text: formatDistanceToNow(date, { addSuffix: true }), color: 'text-warning-600', urgent: true };
    } else {
      return { text: format(date, 'MMM dd, yyyy'), color: 'text-gray-600', urgent: false };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  const urgentSubs = subscriptions.filter(sub => {
    const dueDate = getDueDateDisplay(sub.nextChargeDate);
    return dueDate.urgent;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your recurring payments</p>
        </div>
        <button
          onClick={handleDetect}
          disabled={detecting}
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {detecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <RefreshCcw className="w-4 h-4" />
              Auto-Detect
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Monthly</span>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            AED {totals.monthly?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">Yearly</span>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">Projection</p>
          <p className="text-2xl font-bold text-gray-900">
            AED {(totals.monthly * 12)?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success-600" />
            </div>
            <span className="text-xs font-medium text-success-600">Active</span>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">Count</p>
          <p className="text-2xl font-bold text-gray-900">{totals.count || 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-warning-600" />
            </div>
            <span className="text-xs font-medium text-warning-600">Urgent</span>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">Due Soon</p>
          <p className="text-2xl font-bold text-gray-900">{urgentSubs.length}</p>
        </div>
      </div>

      {/* Urgent Alert */}
      {urgentSubs.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-warning-900">Upcoming Charges</h3>
              <p className="text-xs text-warning-700 mt-0.5">
                {urgentSubs.length} subscription{urgentSubs.length > 1 ? 's' : ''} due this week
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Subscriptions Found</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Upload a bank statement to automatically detect your subscriptions
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Statement
            </Link>
            <button
              onClick={handleDetect}
              disabled={detecting}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Auto-Detect
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptions.map((sub) => {
            const dueDate = getDueDateDisplay(sub.nextChargeDate);
            return (
              <Link
                key={sub.id}
                to={`/subscriptions/${sub.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                    <CreditCard className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  {dueDate.urgent && (
                    <span className="text-xs font-medium text-warning-600 bg-warning-100 px-2 py-1 rounded">
                      Due Soon
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{sub.merchantName}</h3>
                <p className="text-2xl font-bold text-primary-600 mb-4">
                  AED {parseFloat(sub.amount).toFixed(2)}
                </p>
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Next charge</span>
                    <span className={`font-medium ${dueDate.color}`}>{dueDate.text}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Frequency</span>
                    <span className="text-gray-900 font-medium capitalize">{sub.billingFrequency}</span>
                  </div>
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
