import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await transactionsAPI.getAll({
        ...filters,
        limit: 100,
      });
      setTransactions(data.transactions);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load transactions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food_dining: '🍽️',
      entertainment: '🎬',
      shopping: '🛍️',
      transportation: '🚗',
      utilities: '⚡',
      fitness: '💪',
      health: '🏥',
      education: '📚',
      financial: '💳',
      other: '📌',
    };
    return icons[category] || '💰';
  };

  const getCategoryColor = (category) => {
    const colors = {
      food_dining: 'bg-orange-100 text-orange-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-blue-100 text-blue-800',
      transportation: 'bg-green-100 text-green-800',
      utilities: 'bg-yellow-100 text-yellow-800',
      fitness: 'bg-red-100 text-red-800',
      health: 'bg-pink-100 text-pink-800',
      education: 'bg-indigo-100 text-indigo-800',
      financial: 'bg-cyan-100 text-cyan-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">All your spending in one place</p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
            <div className="text-3xl font-bold text-primary-600">{stats.count}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalAmount)}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Average Transaction</div>
            <div className="text-3xl font-bold text-gray-700">
              {formatCurrency(stats.count > 0 ? stats.totalAmount / stats.count : 0)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search merchant..."
            className="input"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          />

          <select
            className="input"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="food_dining">Food & Dining</option>
            <option value="entertainment">Entertainment</option>
            <option value="shopping">Shopping</option>
            <option value="transportation">Transportation</option>
            <option value="utilities">Utilities</option>
            <option value="fitness">Fitness</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="financial">Financial</option>
            <option value="other">Other</option>
          </select>

          <select
            className="input"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>

          <input
            type="date"
            className="input"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            placeholder="Start Date"
          />

          <input
            type="date"
            className="input"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            placeholder="End Date"
          />
        </div>

        {Object.values(filters).some(v => v) && (
          <button
            onClick={() => setFilters({
              searchQuery: '',
              category: '',
              type: '',
              startDate: '',
              endDate: '',
            })}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Transactions List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Found</h3>
            <p className="text-gray-600 mb-6">
              Upload a bank statement to see your transactions here
            </p>
            <a href="/upload" className="btn-primary">
              Upload Statement
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-3xl">
                    {getCategoryIcon(txn.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {txn.merchantName || 'Unknown Merchant'}
                      </h3>
                      {txn.subscription && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                          Subscription
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-sm text-gray-600">
                        {format(new Date(txn.date), 'MMM dd, yyyy')}
                      </p>
                      {txn.bankAccount && (
                        <p className="text-sm text-gray-500">
                          {txn.bankAccount.bankName || txn.bankAccount.accountName}
                          {txn.bankAccount.mask && ` •••• ${txn.bankAccount.mask}`}
                        </p>
                      )}
                      {txn.category && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(txn.category)}`}>
                          {txn.category.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {txn.description && txn.description !== txn.merchantName && (
                      <p className="text-xs text-gray-500 mt-1">{txn.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-lg font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                    {txn.type === 'credit' && '+'}
                    {formatCurrency(txn.amount)}
                  </div>
                  {txn.balance && (
                    <div className="text-sm text-gray-500">
                      Balance: {formatCurrency(txn.balance)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
