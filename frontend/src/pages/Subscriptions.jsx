import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionsAPI } from '../services/api';
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <button onClick={handleDetect} disabled={detecting} className="btn-primary">
          {detecting ? 'Detecting...' : '🔍 Auto-Detect'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card">
          <h3 className="text-sm text-gray-600">Monthly Total</h3>
          <p className="text-2xl font-bold">AED {totals.monthly?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600">Annual Projection</h3>
          <p className="text-2xl font-bold">AED {(totals.total * 12)?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="card">
          <h3 className="text-sm text-gray-600">Active Count</h3>
          <p className="text-2xl font-bold">{totals.count || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => (
          <Link key={sub.id} to={`/subscriptions/${sub.id}`} className="card hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg mb-2">{sub.merchantName}</h3>
            <p className="text-2xl font-bold text-primary-600 mb-2">
              AED {parseFloat(sub.amount).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              Next charge: {new Date(sub.nextChargeDate).toLocaleDateString()}
            </p>
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
              {sub.billingFrequency}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;
