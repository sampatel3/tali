import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/constants/app_constants.dart';
import '../providers/transaction_provider.dart';
import '../services/upload_service.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  String _selectedFilter = 'all';
  String _selectedCategory = 'all';
  final UploadService _uploadService = UploadService();
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TransactionProvider>().loadTransactions();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _buildFilterChip('All', 'all'),
                const SizedBox(width: 8),
                _buildFilterChip('Debit', 'debit'),
                const SizedBox(width: 8),
                _buildFilterChip('Credit', 'credit'),
                const SizedBox(width: 8),
                _buildFilterChip('Subscriptions', 'subscriptions'),
              ],
            ),
          ),

          // Category Filter
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildCategoryChip('All', 'all', Icons.apps),
                const SizedBox(width: 8),
                _buildCategoryChip('Entertainment', 'entertainment', Icons.movie),
                const SizedBox(width: 8),
                _buildCategoryChip('Food', 'food', Icons.restaurant),
                const SizedBox(width: 8),
                _buildCategoryChip('Transport', 'transport', Icons.directions_car),
                const SizedBox(width: 8),
                _buildCategoryChip('Utilities', 'utilities', Icons.bolt),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Transactions List
          Expanded(
            child: Consumer<TransactionProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                var transactions = provider.transactions;

                // Apply filters
                if (_selectedFilter == 'debit') {
                  transactions = transactions.where((t) => t.type == 'debit').toList();
                } else if (_selectedFilter == 'credit') {
                  transactions = transactions.where((t) => t.type == 'credit').toList();
                } else if (_selectedFilter == 'subscriptions') {
                  transactions = provider.subscriptionTransactions;
                }

                if (_selectedCategory != 'all') {
                  transactions = transactions
                      .where((t) => t.category == _selectedCategory)
                      .toList();
                }

                if (transactions.isEmpty) {
                  return const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.receipt_long_outlined,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 16),
                        Text(
                          'No transactions found',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                // Group transactions by date
                final groupedTransactions = _groupTransactionsByDate(transactions);

                return ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: groupedTransactions.length,
                  itemBuilder: (context, index) {
                    final entry = groupedTransactions.entries.elementAt(index);
                    final date = entry.key;
                    final txns = entry.value;

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Text(
                            _formatDate(date),
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey,
                            ),
                          ),
                        ),
                        ...txns.map((txn) => Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: _getCategoryColor(txn.category)
                                      .withValues(alpha: 0.1),
                                  child: Icon(
                                    _getCategoryIcon(txn.category),
                                    color: _getCategoryColor(txn.category),
                                    size: 20,
                                  ),
                                ),
                                title: Text(
                                  txn.merchantName,
                                  style: const TextStyle(fontWeight: FontWeight.w600),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 4),
                                    Text(
                                      txn.description ?? txn.category,
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                    if (txn.isSubscription == true)
                                      Container(
                                        margin: const EdgeInsets.only(top: 4),
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: AppTheme.info.withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: const Text(
                                          'SUBSCRIPTION',
                                          style: TextStyle(
                                            color: AppTheme.info,
                                            fontSize: 10,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                trailing: Text(
                                  '${txn.type == 'credit' ? '+' : '-'}${AppConstants.currencies[txn.currency]} ${txn.amount.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: txn.type == 'credit'
                                        ? AppTheme.success
                                        : AppTheme.textPrimary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              ),
                            )),
                      ],
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _isUploading ? null : _handleUpload,
        backgroundColor: AppTheme.primary,
        icon: _isUploading
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : const Icon(Icons.upload, color: Colors.white),
        label: Text(
          _isUploading ? 'Uploading...' : 'Upload Statement',
          style: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  Future<void> _handleUpload() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'csv'],
        allowMultiple: false,
      );

      if (result == null) {
        return;
      }

      final file = result.files.single;
      setState(() {
        _isUploading = true;
      });

      // Show snackbar
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Uploading statement...'),
          duration: Duration(seconds: 2),
        ),
      );

      // Upload file - handle web (bytes) and mobile (path) differently
      Map<String, dynamic> uploadResult;
      if (file.path != null) {
        // Mobile: use file path
        uploadResult = await _uploadService.uploadStatement(file.path!);
      } else if (file.bytes != null) {
        // Web: use bytes
        uploadResult = await _uploadService.uploadStatement(
          file.bytes!,
          filename: file.name,
        );
      } else {
        setState(() {
          _isUploading = false;
        });
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('❌ Could not read file'),
            backgroundColor: AppTheme.error,
          ),
        );
        return;
      }
      final statementId = uploadResult['statement']['id'] as String;

      // Poll for processing status
      int attempts = 0;
      const maxAttempts = 60; // 60 seconds max

      while (attempts < maxAttempts) {
        await Future.delayed(const Duration(seconds: 1));
        attempts++;

        try {
          final status = await _uploadService.getStatementStatus(statementId);
          final statusValue = status['status'] as String;

          if (statusValue == 'completed') {
            final count = status['transactionCount'] as int? ?? 0;
            setState(() {
              _isUploading = false;
            });
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  count > 0
                      ? '✅ $count transactions imported successfully!'
                      : 'Statement processed but no transactions found.',
                ),
                backgroundColor: count > 0 ? AppTheme.success : AppTheme.warning,
                duration: const Duration(seconds: 4),
              ),
            );
            // Refresh transactions
            context.read<TransactionProvider>().loadTransactions();
            break;
          } else if (statusValue == 'failed') {
            setState(() {
              _isUploading = false;
            });
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  '❌ Processing failed: ${status['errorMessage'] ?? 'Unknown error'}',
                ),
                backgroundColor: AppTheme.error,
                duration: const Duration(seconds: 5),
              ),
            );
            break;
          }
        } catch (e) {
          if (attempts >= maxAttempts) {
            setState(() {
              _isUploading = false;
            });
            if (!mounted) return;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('⏳ Processing is taking longer than expected. Check back later.'),
                backgroundColor: AppTheme.warning,
              ),
            );
            // Still refresh transactions
            context.read<TransactionProvider>().loadTransactions();
            break;
          }
        }
      }
    } catch (e) {
      setState(() {
        _isUploading = false;
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('❌ Upload failed: ${e.toString()}'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedFilter = value;
          });
        }
      },
      backgroundColor: Colors.grey.shade100,
      selectedColor: AppTheme.primary.withValues(alpha: 0.2),
      labelStyle: TextStyle(
        color: isSelected ? AppTheme.primary : Colors.black87,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
      ),
    );
  }

  Widget _buildCategoryChip(String label, String value, IconData icon) {
    final isSelected = _selectedCategory == value;
    return FilterChip(
      label: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16),
          const SizedBox(width: 4),
          Text(label),
        ],
      ),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedCategory = value;
          });
        }
      },
      backgroundColor: Colors.grey.shade100,
      selectedColor: AppTheme.secondary.withValues(alpha: 0.2),
      labelStyle: TextStyle(
        color: isSelected ? AppTheme.secondary : Colors.black87,
        fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        fontSize: 12,
      ),
    );
  }

  Map<String, List<dynamic>> _groupTransactionsByDate(List transactions) {
    final grouped = <String, List>{};
    for (var txn in transactions) {
      final dateKey = txn.date.toString().split(' ')[0];
      if (!grouped.containsKey(dateKey)) {
        grouped[dateKey] = [];
      }
      grouped[dateKey]!.add(txn);
    }
    return grouped;
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final txnDate = DateTime(date.year, date.month, date.day);

    if (txnDate == today) {
      return 'Today';
    } else if (txnDate == yesterday) {
      return 'Yesterday';
    } else {
      return '${date.day} ${_getMonthName(date.month)} ${date.year}';
    }
  }

  String _getMonthName(int month) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    return months[month - 1];
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'entertainment':
        return Icons.movie;
      case 'food':
        return Icons.restaurant;
      case 'transport':
        return Icons.directions_car;
      case 'utilities':
        return Icons.bolt;
      case 'shopping':
        return Icons.shopping_bag;
      case 'health':
        return Icons.local_hospital;
      default:
        return Icons.receipt;
    }
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'entertainment':
        return AppTheme.secondary;
      case 'food':
        return AppTheme.warning;
      case 'transport':
        return AppTheme.info;
      case 'utilities':
        return AppTheme.accent;
      case 'shopping':
        return AppTheme.primary;
      default:
        return Colors.grey;
    }
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Transactions'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Advanced filtering coming soon!'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}
