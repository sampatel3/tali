import 'package:equatable/equatable.dart';

class TransactionModel extends Equatable {
  final String id;
  final String userId;
  final String? accountId;
  final String merchantName;
  final String? description;
  final double amount;
  final String currency;
  final String type;
  final String category;
  final String? subcategory;
  final DateTime date;
  final String? reference;
  final bool? isSubscription;
  final String? subscriptionId;
  final Map<String, dynamic>? metadata;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const TransactionModel({
    required this.id,
    required this.userId,
    this.accountId,
    required this.merchantName,
    this.description,
    required this.amount,
    this.currency = 'AED',
    required this.type,
    this.category = 'other',
    this.subcategory,
    required this.date,
    this.reference,
    this.isSubscription,
    this.subscriptionId,
    this.metadata,
    this.createdAt,
    this.updatedAt,
  });

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    // Handle nested bankAccount object from backend
    String? accountId;
    if (json['bankAccount'] != null && json['bankAccount'] is Map) {
      accountId = json['bankAccount']['id'] as String?;
    } else {
      accountId = json['accountId'] as String? ?? json['bankAccountId'] as String?;
    }
    
    // Handle subscription relationship
    bool? isSubscription;
    String? subscriptionId;
    if (json['subscription'] != null && json['subscription'] is Map) {
      subscriptionId = json['subscription']['id'] as String?;
      isSubscription = subscriptionId != null;
    } else {
      isSubscription = json['isSubscription'] as bool?;
      subscriptionId = json['subscriptionId'] as String?;
    }
    
    return TransactionModel(
      id: json['id'] as String,
      userId: json['userId'] as String,
      accountId: accountId,
      merchantName: json['merchantName'] as String,
      description: json['description'] as String?,
      amount: json['amount'] is num 
          ? (json['amount'] as num).toDouble()
          : double.parse(json['amount'] as String),
      currency: json['currency'] as String? ?? 'AED',
      type: json['type'] as String,
      category: json['category'] as String? ?? 'other',
      subcategory: json['subcategory'] as String?,
      date: DateTime.parse(json['date'] as String),
      reference: json['reference'] as String?,
      isSubscription: isSubscription,
      subscriptionId: subscriptionId,
      metadata: json['metadata'] as Map<String, dynamic>?,
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
      'accountId': accountId,
      'merchantName': merchantName,
      'description': description,
      'amount': amount,
      'currency': currency,
      'type': type,
      'category': category,
      'subcategory': subcategory,
      'date': date.toIso8601String(),
      'reference': reference,
      'isSubscription': isSubscription,
      'subscriptionId': subscriptionId,
      'metadata': metadata,
    };
  }

  @override
  List<Object?> get props => [
        id,
        merchantName,
        amount,
        date,
        type,
        category,
      ];
}
