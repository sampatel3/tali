import 'package:equatable/equatable.dart';

class SubscriptionModel extends Equatable {
  final String id;
  final String userId;
  final String merchantName;
  final String? description;
  final double amount;
  final String currency;
  final String billingFrequency;
  final DateTime nextChargeDate;
  final DateTime? lastChargeDate;
  final DateTime startDate;
  final DateTime? endDate;
  final String status;
  final String category;
  final String? subcategory;
  final String? logo;
  final bool autoRenew;
  final int? transactionCount;
  final double? totalPaid;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const SubscriptionModel({
    required this.id,
    required this.userId,
    required this.merchantName,
    this.description,
    required this.amount,
    this.currency = 'AED',
    required this.billingFrequency,
    required this.nextChargeDate,
    this.lastChargeDate,
    required this.startDate,
    this.endDate,
    this.status = 'active',
    this.category = 'other',
    this.subcategory,
    this.logo,
    this.autoRenew = true,
    this.transactionCount,
    this.totalPaid,
    this.createdAt,
    this.updatedAt,
  });

  factory SubscriptionModel.fromJson(Map<String, dynamic> json) {
    // Handle amount as string or number
    double parseAmount(dynamic value) {
      if (value is num) return value.toDouble();
      if (value is String) return double.parse(value);
      throw Exception('Invalid amount type: ${value.runtimeType}');
    }
    
    // Handle totalPaid as string or number
    double? parseTotalPaid(dynamic value) {
      if (value == null) return null;
      if (value is num) return value.toDouble();
      if (value is String) return double.parse(value);
      return null;
    }
    
    return SubscriptionModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      merchantName: json['merchantName'] as String,
      description: json['description'] as String?,
      amount: parseAmount(json['amount']),
      currency: json['currency'] as String? ?? 'AED',
      billingFrequency: json['billingFrequency'] as String,
      nextChargeDate: DateTime.parse(json['nextChargeDate'] as String),
      lastChargeDate: json['lastChargeDate'] != null
          ? DateTime.parse(json['lastChargeDate'] as String)
          : null,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: json['endDate'] != null 
          ? DateTime.parse(json['endDate'] as String) 
          : null,
      status: json['status'] as String? ?? 'active',
      category: json['category'] as String? ?? 'other',
      subcategory: json['subcategory'] as String?,
      logo: json['logo'] as String?,
      autoRenew: json['autoRenew'] as bool? ?? true,
      transactionCount: json['_count']?['transactions'] as int?,
      totalPaid: json['stats']?['totalPaid'] != null
          ? parseTotalPaid(json['stats']['totalPaid'])
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'merchantName': merchantName,
      'description': description,
      'amount': amount,
      'currency': currency,
      'billingFrequency': billingFrequency,
      'nextChargeDate': nextChargeDate.toIso8601String(),
      'lastChargeDate': lastChargeDate?.toIso8601String(),
      'startDate': startDate.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'status': status,
      'category': category,
      'subcategory': subcategory,
      'logo': logo,
      'autoRenew': autoRenew,
    };
  }

  SubscriptionModel copyWith({
    String? id,
    String? userId,
    String? merchantName,
    String? description,
    double? amount,
    String? currency,
    String? billingFrequency,
    DateTime? nextChargeDate,
    DateTime? lastChargeDate,
    DateTime? startDate,
    DateTime? endDate,
    String? status,
    String? category,
    String? subcategory,
    String? logo,
    bool? autoRenew,
    int? transactionCount,
    double? totalPaid,
  }) {
    return SubscriptionModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      merchantName: merchantName ?? this.merchantName,
      description: description ?? this.description,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      billingFrequency: billingFrequency ?? this.billingFrequency,
      nextChargeDate: nextChargeDate ?? this.nextChargeDate,
      lastChargeDate: lastChargeDate ?? this.lastChargeDate,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      status: status ?? this.status,
      category: category ?? this.category,
      subcategory: subcategory ?? this.subcategory,
      logo: logo ?? this.logo,
      autoRenew: autoRenew ?? this.autoRenew,
      transactionCount: transactionCount ?? this.transactionCount,
      totalPaid: totalPaid ?? this.totalPaid,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        merchantName,
        amount,
        billingFrequency,
        nextChargeDate,
        status,
        category,
      ];
}
