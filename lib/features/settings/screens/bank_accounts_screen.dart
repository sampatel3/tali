import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class BankAccountsScreen extends StatefulWidget {
  const BankAccountsScreen({super.key});

  @override
  State<BankAccountsScreen> createState() => _BankAccountsScreenState();
}

class _BankAccountsScreenState extends State<BankAccountsScreen> {
  final List<BankAccount> _connectedAccounts = [];

  final List<UAEBank> _availableBanks = [
    UAEBank(
      id: 'emirates-nbd',
      name: 'Emirates NBD',
      logo: Icons.account_balance,
      color: const Color(0xFFD92229),
      supportsOpenBanking: true,
    ),
    UAEBank(
      id: 'adcb',
      name: 'Abu Dhabi Commercial Bank',
      logo: Icons.account_balance,
      color: const Color(0xFF005EB8),
      supportsOpenBanking: true,
    ),
    UAEBank(
      id: 'fab',
      name: 'First Abu Dhabi Bank',
      logo: Icons.account_balance,
      color: const Color(0xFF006838),
      supportsOpenBanking: true,
    ),
    UAEBank(
      id: 'mashreq',
      name: 'Mashreq Bank',
      logo: Icons.account_balance,
      color: const Color(0xFFE31E24),
      supportsOpenBanking: true,
    ),
    UAEBank(
      id: 'rakbank',
      name: 'RAKBANK',
      logo: Icons.account_balance,
      color: const Color(0xFFED1C24),
      supportsOpenBanking: true,
    ),
    UAEBank(
      id: 'dib',
      name: 'Dubai Islamic Bank',
      logo: Icons.account_balance,
      color: const Color(0xFF00A651),
      supportsOpenBanking: true,
    ),
    UAEBank(
      id: 'adib',
      name: 'Abu Dhabi Islamic Bank',
      logo: Icons.account_balance,
      color: const Color(0xFF006838),
      supportsOpenBanking: true,
    ),
    UAEBank(
      id: 'cbd',
      name: 'Commercial Bank of Dubai',
      logo: Icons.account_balance,
      color: const Color(0xFF0066CC),
      supportsOpenBanking: true,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bank Accounts'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with Nebras branding
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: AppTheme.primaryGradient,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.account_balance_wallet_rounded,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 16),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Open Banking',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              'Powered by Nebras',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.security_rounded,
                          color: Colors.white,
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Secure connection via UAE Open Banking framework',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withValues(alpha: 0.95),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Connected Accounts
            if (_connectedAccounts.isNotEmpty) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Connected Accounts',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      '${_connectedAccounts.length}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primary,
                      ),
                    ),
                  ],
                ),
              ),
              ..._connectedAccounts.map((account) => _buildConnectedAccountCard(account)),
            ],

            // Add Account Section
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
              child: Text(
                _connectedAccounts.isEmpty ? 'Connect Your First Account' : 'Add Another Account',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: _availableBanks.map((bank) => _buildBankCard(bank)).toList(),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildConnectedAccountCard(BankAccount account) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: AppTheme.success.withValues(alpha: 0.3),
          width: 2,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: account.bank.color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                account.bank.logo,
                color: account.bank.color,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          account.bank.name,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Row(
                          children: [
                            Icon(
                              Icons.check_circle,
                              size: 14,
                              color: AppTheme.success,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'Connected',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppTheme.success,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    account.accountNumber,
                    style: TextStyle(
                      fontSize: 13,
                      color: AppTheme.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Last synced: ${account.lastSync}',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppTheme.textHint,
                    ),
                  ),
                ],
              ),
            ),
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert),
              onSelected: (value) {
                if (value == 'sync') {
                  _syncAccount(account);
                } else if (value == 'disconnect') {
                  _disconnectAccount(account);
                }
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'sync',
                  child: Row(
                    children: [
                      Icon(Icons.sync, size: 20),
                      SizedBox(width: 8),
                      Text('Sync Now'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'disconnect',
                  child: Row(
                    children: [
                      Icon(Icons.link_off, size: 20, color: AppTheme.error),
                      SizedBox(width: 8),
                      Text(
                        'Disconnect',
                        style: TextStyle(color: AppTheme.error),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBankCard(UAEBank bank) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: () => _connectBank(bank),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: bank.color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  bank.logo,
                  color: bank.color,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      bank.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (bank.supportsOpenBanking)
                      Row(
                        children: [
                          Icon(
                            Icons.verified_user,
                            size: 14,
                            color: AppTheme.primary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            'Open Banking supported',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 18,
                color: AppTheme.textHint,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _connectBank(UAEBank bank) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(bank.logo, color: bank.color, size: 28),
            const SizedBox(width: 12),
            Expanded(child: Text('Connect ${bank.name}')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.info.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info, color: AppTheme.info, size: 20),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'You will be redirected to your bank\'s secure login',
                      style: TextStyle(fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'What we\'ll access:',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 8),
            _buildPermissionItem('Account balance'),
            _buildPermissionItem('Transaction history'),
            _buildPermissionItem('Standing orders & subscriptions'),
            const SizedBox(height: 12),
            Text(
              'Your credentials are never stored. Connection is secured via UAE Open Banking APIs powered by Nebras.',
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.textSecondary,
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Simulate connection
              setState(() {
                _connectedAccounts.add(
                  BankAccount(
                    bank: bank,
                    accountNumber: '**** **** ${DateTime.now().millisecond}',
                    lastSync: 'Just now',
                  ),
                );
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${bank.name} connected successfully!'),
                  backgroundColor: AppTheme.success,
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: bank.color,
            ),
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }

  Widget _buildPermissionItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          const Icon(Icons.check, color: AppTheme.success, size: 18),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(fontSize: 13)),
        ],
      ),
    );
  }

  void _syncAccount(BankAccount account) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Syncing ${account.bank.name}...'),
      ),
    );
    // Simulate sync
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Account synced successfully!'),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    });
  }

  void _disconnectAccount(BankAccount account) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Disconnect Account?'),
        content: Text(
          'Are you sure you want to disconnect your ${account.bank.name} account?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _connectedAccounts.remove(account);
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${account.bank.name} disconnected'),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.error,
            ),
            child: const Text('Disconnect'),
          ),
        ],
      ),
    );
  }
}

class UAEBank {
  final String id;
  final String name;
  final IconData logo;
  final Color color;
  final bool supportsOpenBanking;

  UAEBank({
    required this.id,
    required this.name,
    required this.logo,
    required this.color,
    required this.supportsOpenBanking,
  });
}

class BankAccount {
  final UAEBank bank;
  final String accountNumber;
  final String lastSync;

  BankAccount({
    required this.bank,
    required this.accountNumber,
    required this.lastSync,
  });
}
