import React, { useState, useEffect, useRef } from 'react';
import { transactionsAPI, uploadAPI } from '../../../shared/services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    
    try {
      const { data } = await uploadAPI.uploadStatement(file);
      toast.success('Statement uploaded! Processing...');
      
      // Poll for processing status
      const statementId = data.statement.id;
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds max wait
      
      const checkStatus = setInterval(async () => {
        attempts++;
        try {
          const statusData = await uploadAPI.getStatementStatus(statementId);
          
          if (statusData.status === 'completed') {
            clearInterval(checkStatus);
            const count = statusData.transactionCount || 0;
            if (count > 0) {
              toast.success(`✅ ${count} transactions imported successfully!`);
            } else {
              toast.warning('Statement processed but no transactions found. Check file format.');
            }
            setUploading(false);
            // Refresh transactions
            await fetchTransactions();
          } else if (statusData.status === 'failed') {
            clearInterval(checkStatus);
            toast.error(`Processing failed: ${statusData.errorMessage || 'Unknown error'}`);
            setUploading(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkStatus);
            toast.warning('Processing is taking longer than expected. Transactions will appear when ready.');
            setUploading(false);
            // Still refresh in case it completed
            await fetchTransactions();
          }
        } catch (err) {
          console.error('Error checking status:', err);
          if (attempts >= maxAttempts) {
            clearInterval(checkStatus);
            setUploading(false);
            await fetchTransactions();
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed. Please try again.');
      setUploading(false);
    }
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">💰 Transactions</h1>
          <p className="text-gray-600 mt-2">Track every dirham that comes in and goes out</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.csv"
            className="hidden"
            id="statement-upload"
          />
          <label
            htmlFor="statement-upload"
            className={`btn-primary cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <span className="mr-2">📤</span>
                Upload Statement
              </>
            )}
          </label>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card-primary">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📊</span>
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-lg">Count</span>
            </div>
            <div className="text-sm font-medium opacity-90 mb-1">Total Transactions</div>
            <div className="text-3xl font-bold">{stats.count}</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">💵</span>
              <span className="badge badge-primary">Total</span>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Amount</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.totalAmount)}
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📈</span>
              <span className="badge badge-accent">Average</span>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Average Transaction</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.count > 0 ? stats.totalAmount / stats.count : 0)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card-elevated">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Search merchant..."
            className="input-field"
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
          />

          <select
            className="input-field"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="food_dining">🍽️ Food & Dining</option>
            <option value="entertainment">🎬 Entertainment</option>
            <option value="shopping">🛍️ Shopping</option>
            <option value="transportation">🚗 Transportation</option>
            <option value="utilities">⚡ Utilities</option>
            <option value="fitness">💪 Fitness</option>
            <option value="health">🏥 Health</option>
            <option value="education">📚 Education</option>
            <option value="financial">💳 Financial</option>
            <option value="other">📌 Other</option>
          </select>

          <select
            className="input-field"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="debit">Debit (-)</option>
            <option value="credit">Credit (+)</option>
          </select>

          <input
            type="date"
            className="input-field"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            placeholder="Start Date"
          />

          <input
            type="date"
            className="input-field"
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
            className="mt-4 btn-secondary text-sm"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Transactions List */}
      <div className="card-elevated">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 spinner mx-auto mb-4"></div>
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 animate-bounce-subtle">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Transactions Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Upload a bank statement (PDF or CSV) to automatically import and track all your transactions
            </p>
            <label
              htmlFor="statement-upload"
              className={`btn-primary inline-block cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2">📤</span>
                  Upload Statement
                </>
              )}
            </label>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((txn, idx) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all duration-200 group animate-fade-in"
                style={{ animationDelay: `${0.03 * idx}s` }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-shadow">
                    {getCategoryIcon(txn.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {txn.merchantName || 'Unknown Merchant'}
                      </h3>
                      {txn.subscription && (
                        <span className="badge badge-primary">
                          Subscription
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
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
                        <span className={`badge ${getCategoryColor(txn.category)}`}>
                          {txn.category.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {txn.description && txn.description !== txn.merchantName && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">{txn.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-xl font-bold ${txn.type === 'credit' ? 'text-success-600' : 'text-gray-900'}`}>
                    {txn.type === 'credit' && '+'}
                    {formatCurrency(txn.amount)}
                  </div>
                  {txn.balance && (
                    <div className="text-sm text-gray-500 mt-1">
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
