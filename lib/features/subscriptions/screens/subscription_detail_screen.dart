import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/api_client.dart';
import '../../../core/config/api_config.dart';
import '../../../data/models/subscription_model.dart';
import '../../../data/models/transaction_model.dart';

class SubscriptionDetailScreen extends StatefulWidget {
  final String subscriptionId;

  const SubscriptionDetailScreen({
    super.key,
    required this.subscriptionId,
  });

  @override
  State<SubscriptionDetailScreen> createState() =>
      _SubscriptionDetailScreenState();
}

class _SubscriptionDetailScreenState extends State<SubscriptionDetailScreen> {
  final ApiClient _apiClient = ApiClient();
  SubscriptionModel? _subscription;
  List<TransactionModel> _transactions = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadSubscription();
  }

  Future<void> _loadSubscription() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final response = await _apiClient
          .get(ApiConfig.subscriptionById(widget.subscriptionId));
      final data = response.data;

      setState(() {
        _subscription = SubscriptionModel.fromJson(data);
        _transactions = (data['transactions'] as List?)
                ?.map((json) => TransactionModel.fromJson(json))
                .toList() ??
            [];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Subscription Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/subscriptions'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Navigate to edit screen
            },
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: () {
              // TODO: Show delete confirmation
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _subscription == null
                  ? const Center(child: Text('Subscription not found'))
                  : _buildContent(),
    );
  }

  Widget _buildContent() {
    final sub = _subscription!;
    final stats = _calculateStats();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primary, AppTheme.secondary],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  sub.merchantName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  sub.description ?? sub.category.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatItem(
                        'Amount',
                        '${AppConstants.currencies[sub.currency]} ${sub.amount.toStringAsFixed(2)}',
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        'Frequency',
                        sub.billingFrequency.toUpperCase(),
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        'Status',
                        sub.status.toUpperCase(),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Stats Cards
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: _buildInfoCard(
                    'Total Paid',
                    '${AppConstants.currencies[sub.currency]} ${stats['totalPaid']?.toStringAsFixed(2) ?? '0.00'}',
                    Icons.payments,
                    AppTheme.success,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildInfoCard(
                    'Payments',
                    '${stats['paymentCount'] ?? 0}',
                    Icons.receipt_long,
                    AppTheme.info,
                  ),
                ),
              ],
            ),
          ),

          // Payment History Chart
          if (_transactions.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Payment History',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    height: 200,
                    child: _buildPaymentChart(),
                  ),
                ],
              ),
            ),
          ],

          // Transaction List
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Recent Transactions',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                ..._transactions.take(10).map((txn) => Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                          child: const Icon(
                            Icons.receipt,
                            color: AppTheme.primary,
                            size: 20,
                          ),
                        ),
                        title: Text(txn.description ?? txn.merchantName),
                        subtitle: Text(
                          txn.date.toString().split(' ')[0],
                          style: const TextStyle(fontSize: 12),
                        ),
                        trailing: Text(
                          '${AppConstants.currencies[txn.currency]} ${txn.amount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    )),
              ],
            ),
          ),

          // Subscription Info
          Padding(
            padding: const EdgeInsets.all(16),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Subscription Information',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    _buildInfoRow('Next Charge', sub.nextChargeDate.toString().split(' ')[0]),
                    _buildInfoRow('Start Date', sub.startDate.toString().split(' ')[0]),
                    if (sub.lastChargeDate != null)
                      _buildInfoRow('Last Charge', sub.lastChargeDate!.toString().split(' ')[0]),
                    _buildInfoRow('Auto Renew', sub.autoRenew ? 'Yes' : 'No'),
                    _buildInfoRow('Category', '${sub.category}${sub.subcategory != null ? ' / ${sub.subcategory}' : ''}'),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentChart() {
    final chartData = _transactions.take(12).toList().reversed.toList();

    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: false),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: chartData
                .asMap()
                .entries
                .map((e) => FlSpot(e.key.toDouble(), e.value.amount))
                .toList(),
            isCurved: true,
            color: AppTheme.primary,
            barWidth: 3,
            dotData: const FlDotData(show: true),
            belowBarData: BarAreaData(
              show: true,
              color: AppTheme.primary.withValues(alpha: 0.1),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Colors.grey,
              fontSize: 14,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic> _calculateStats() {
    double totalPaid = 0;
    for (var txn in _transactions) {
      totalPaid += txn.amount;
    }

    return {
      'totalPaid': totalPaid,
      'paymentCount': _transactions.length,
      'averageAmount': _transactions.isNotEmpty ? totalPaid / _transactions.length : 0,
      'firstPayment': _transactions.isNotEmpty ? _transactions.last.date : null,
      'lastPayment': _transactions.isNotEmpty ? _transactions.first.date : null,
    };
  }
}
