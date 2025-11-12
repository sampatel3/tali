import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { subscriptionsAPI } from '../../../shared/services/api';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SubscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const { data } = await subscriptionsAPI.getById(id);
      setSubscription(data);
    } catch (error) {
      toast.error('Failed to load subscription details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 spinner mx-auto mb-4"></div>
          <p className="text-gray-500">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 mb-4">Subscription not found</p>
        <Link to="/subscriptions" className="btn-primary">
          Back to Subscriptions
        </Link>
      </div>
    );
  }

  const transactions = subscription.transactions || [];
  const stats = subscription.stats || {};

  // Prepare chart data - group by month
  const chartData = transactions.reduce((acc, txn) => {
    const date = typeof txn.date === 'string' ? parseISO(txn.date) : new Date(txn.date);
    const monthKey = format(date, 'MMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, amount: 0, count: 0 };
    }
    acc[monthKey].amount += parseFloat(txn.amount);
    acc[monthKey].count += 1;
    return acc;
  }, {});

  const monthlyData = Object.values(chartData).sort((a, b) => 
    new Date(a.month) - new Date(b.month)
  );

  // Timeline data for payment history
  const timelineData = transactions.map((txn, idx) => {
    const date = typeof txn.date === 'string' ? parseISO(txn.date) : new Date(txn.date);
    return {
      ...txn,
      index: transactions.length - idx,
      formattedDate: format(date, 'MMM dd, yyyy'),
      formattedAmount: parseFloat(txn.amount).toFixed(2)
    };
  });

  const getNextChargeDisplay = () => {
    if (!subscription.nextChargeDate) return { text: 'Unknown', color: 'text-gray-500', urgent: false };
    
    const nextDate = typeof subscription.nextChargeDate === 'string' 
      ? parseISO(subscription.nextChargeDate) 
      : new Date(subscription.nextChargeDate);
    const now = new Date();
    const daysUntil = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) {
      return { text: 'Overdue', color: 'text-red-600', urgent: true };
    } else if (daysUntil === 0) {
      return { text: 'Today', color: 'text-orange-600', urgent: true };
    } else if (daysUntil <= 3) {
      return { text: `In ${daysUntil} days`, color: 'text-orange-600', urgent: true };
    } else if (daysUntil <= 7) {
      return { text: `In ${daysUntil} days`, color: 'text-yellow-600', urgent: false };
    } else {
      return { text: format(nextDate, 'MMM dd, yyyy'), color: 'text-gray-600', urgent: false };
    }
  };

  const nextCharge = getNextChargeDisplay();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/subscriptions')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">Subscription Details</h1>
      </div>

      {/* Subscription Info Card */}
      <div className="card mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{subscription.merchantName}</h2>
            <p className="text-3xl font-bold text-primary-600 mb-1">
              AED {parseFloat(subscription.amount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {subscription.billingFrequency} billing
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            subscription.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <span className="font-medium capitalize">{subscription.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Next Charge</p>
            <p className={`font-semibold ${nextCharge.color}`}>
              {nextCharge.urgent && <AlertCircle className="w-4 h-4 inline mr-1" />}
              {nextCharge.text}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Paid</p>
            <p className="font-semibold text-gray-900">
              AED {stats.totalPaid?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Payments</p>
            <p className="font-semibold text-gray-900">
              {stats.paymentCount || 0} {stats.paymentCount === 1 ? 'payment' : 'payments'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Average</p>
            <p className="font-semibold text-gray-900">
              AED {stats.averageAmount?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {subscription.category && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {subscription.category}
              {subscription.subcategory && ` • ${subscription.subcategory}`}
            </span>
            {subscription.detectionConfidence && (
              <span className="ml-2 text-xs text-gray-500">
                {parseFloat(subscription.detectionConfidence * 100).toFixed(0)}% confidence
              </span>
            )}
          </div>
        )}
      </div>

      {/* Charts */}
      {monthlyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment History Line Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Payment History
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `AED ${value.toFixed(2)}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  name="Amount"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Frequency Bar Chart */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Payment Frequency
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4F46E5" name="Payments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payment Timeline */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          Payment Timeline
        </h3>
        {timelineData.length > 0 ? (
          <div className="space-y-4">
            {timelineData.map((txn, idx) => (
              <div
                key={txn.id}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">
                      Payment #{txn.index}
                    </p>
                    <p className="text-lg font-bold text-primary-600">
                      AED {txn.formattedAmount}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {txn.formattedDate}
                    </span>
                    {txn.bankAccount && (
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {txn.bankAccount.institutionName || txn.bankAccount.accountName}
                      </span>
                    )}
                  </div>
                  {txn.description && (
                    <p className="text-sm text-gray-600 mt-1">{txn.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No payment history available</p>
          </div>
        )}
      </div>

      {/* Dates Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {stats.firstPayment && (
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">First Payment</p>
            <p className="font-semibold text-gray-900">
              {format(
                typeof stats.firstPayment === 'string' 
                  ? parseISO(stats.firstPayment) 
                  : new Date(stats.firstPayment),
                'MMM dd, yyyy'
              )}
            </p>
          </div>
        )}
        {stats.lastPayment && (
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Last Payment</p>
            <p className="font-semibold text-gray-900">
              {format(
                typeof stats.lastPayment === 'string' 
                  ? parseISO(stats.lastPayment) 
                  : new Date(stats.lastPayment),
                'MMM dd, yyyy'
              )}
            </p>
          </div>
        )}
        {subscription.nextChargeDate && (
          <div className="card">
            <p className="text-xs text-gray-500 mb-1">Next Charge</p>
            <p className={`font-semibold ${nextCharge.color}`}>
              {format(
                typeof subscription.nextChargeDate === 'string' 
                  ? parseISO(subscription.nextChargeDate) 
                  : new Date(subscription.nextChargeDate),
                'MMM dd, yyyy'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetail;
