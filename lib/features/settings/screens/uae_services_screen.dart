import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';

class UAEServicesScreen extends StatefulWidget {
  const UAEServicesScreen({super.key});

  @override
  State<UAEServicesScreen> createState() => _UAEServicesScreenState();
}

class _UAEServicesScreenState extends State<UAEServicesScreen> {
  final List<UAEService> _services = [
    UAEService(
      id: 'dewa',
      name: 'DEWA',
      fullName: 'Dubai Electricity and Water Authority',
      description: 'Connect your DEWA account to track electricity and water bills',
      icon: Icons.flash_on,
      color: const Color(0xFF00A651),
      isConnected: false,
    ),
    UAEService(
      id: 'du',
      name: 'du',
      fullName: 'Emirates Integrated Telecommunications Company',
      description: 'Connect your du mobile and internet account',
      icon: Icons.phone_android,
      color: const Color(0xFFE20714),
      isConnected: false,
    ),
    UAEService(
      id: 'etisalat',
      name: 'Etisalat',
      fullName: 'Etisalat by e&',
      description: 'Connect your Etisalat mobile and internet account',
      icon: Icons.signal_cellular_alt,
      color: const Color(0xFF007A3D),
      isConnected: false,
    ),
    UAEService(
      id: 'salik',
      name: 'Salik',
      fullName: 'Dubai Road Toll System',
      description: 'Track your Salik toll charges automatically',
      icon: Icons.local_shipping,
      color: const Color(0xFF4A90E2),
      isConnected: false,
    ),
    UAEService(
      id: 'emirates-id',
      name: 'Emirates ID',
      fullName: 'Federal Authority for Identity and Citizenship',
      description: 'Link your Emirates ID for verification',
      icon: Icons.credit_card,
      color: const Color(0xFF8B5A3C),
      isConnected: false,
    ),
    UAEService(
      id: 'mawaqif',
      name: 'Mawaqif',
      fullName: 'Abu Dhabi Parking',
      description: 'Connect your Mawaqif parking account',
      icon: Icons.local_parking,
      color: const Color(0xFF00A3E0),
      isConnected: false,
    ),
    UAEService(
      id: 'darb',
      name: 'Darb',
      fullName: 'Abu Dhabi Toll System',
      description: 'Track your Darb toll charges',
      icon: Icons.toll,
      color: const Color(0xFF8E44AD),
      isConnected: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('UAE Services'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Section
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
                  const Text(
                    'Connect UAE Services',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Link your utility and service accounts for automatic tracking',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                  ),
                ],
              ),
            ),

            // Services List
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  Text(
                    'Available Services',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ..._services.map((service) => _buildServiceCard(service)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceCard(UAEService service) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: service.isConnected
              ? AppTheme.success.withValues(alpha: 0.5)
              : Colors.transparent,
          width: 2,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: service.color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    service.icon,
                    color: service.color,
                    size: 32,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            service.name,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(width: 8),
                          if (service.isConnected)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppTheme.success.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Connected',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: AppTheme.success,
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        service.fullName,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppTheme.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              service.description,
              style: TextStyle(
                fontSize: 14,
                color: AppTheme.textSecondary,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => _handleServiceConnection(service),
                style: ElevatedButton.styleFrom(
                  backgroundColor: service.isConnected
                      ? Colors.grey.shade300
                      : service.color,
                  foregroundColor:
                      service.isConnected ? Colors.grey.shade700 : Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      service.isConnected ? Icons.check_circle : Icons.link,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      service.isConnected ? 'Disconnect' : 'Connect Account',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleServiceConnection(UAEService service) {
    if (service.isConnected) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Disconnect ${service.name}?'),
          content: Text(
            'Are you sure you want to disconnect your ${service.fullName} account?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  final index = _services.indexOf(service);
                  _services[index] = UAEService(
                    id: service.id,
                    name: service.name,
                    fullName: service.fullName,
                    description: service.description,
                    icon: service.icon,
                    color: service.color,
                    isConnected: false,
                  );
                });
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('${service.name} disconnected')),
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
    } else {
      _showConnectionDialog(service);
    }
  }

  void _showConnectionDialog(UAEService service) {
    final accountNumberController = TextEditingController();
    final passwordController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Connect ${service.name}'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Enter your ${service.name} account credentials',
                style: TextStyle(
                  fontSize: 14,
                  color: AppTheme.textSecondary,
                ),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: accountNumberController,
                decoration: InputDecoration(
                  labelText: 'Account Number',
                  hintText: 'Enter your account number',
                  prefixIcon: Icon(Icons.account_circle, color: service.color),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Password',
                  hintText: 'Enter your password',
                  prefixIcon: Icon(Icons.lock, color: service.color),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Your credentials are encrypted and stored securely.',
                style: TextStyle(
                  fontSize: 12,
                  color: AppTheme.textHint,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              accountNumberController.dispose();
              passwordController.dispose();
              Navigator.pop(context);
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (accountNumberController.text.isNotEmpty &&
                  passwordController.text.isNotEmpty) {
                setState(() {
                  final index = _services.indexOf(service);
                  _services[index] = UAEService(
                    id: service.id,
                    name: service.name,
                    fullName: service.fullName,
                    description: service.description,
                    icon: service.icon,
                    color: service.color,
                    isConnected: true,
                  );
                });
                accountNumberController.dispose();
                passwordController.dispose();
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('${service.name} connected successfully!'),
                    backgroundColor: AppTheme.success,
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please fill in all fields'),
                    backgroundColor: AppTheme.error,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: service.color,
            ),
            child: const Text('Connect'),
          ),
        ],
      ),
    );
  }
}

class UAEService {
  final String id;
  final String name;
  final String fullName;
  final String description;
  final IconData icon;
  final Color color;
  final bool isConnected;

  UAEService({
    required this.id,
    required this.name,
    required this.fullName,
    required this.description,
    required this.icon,
    required this.color,
    required this.isConnected,
  });
}
