import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final String id;
  final String email;
  final String? fullName;
  final String? phoneNumber;
  final String? preferredLanguage;
  final String status;
  final String? uaePassId;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const UserModel({
    required this.id,
    required this.email,
    this.fullName,
    this.phoneNumber,
    this.preferredLanguage,
    this.status = 'active',
    this.uaePassId,
    this.createdAt,
    this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      preferredLanguage: json['preferredLanguage'] as String?,
      status: json['status'] as String? ?? 'active',
      uaePassId: json['uaePassId'] as String?,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'phoneNumber': phoneNumber,
      'preferredLanguage': preferredLanguage,
      'status': status,
      'uaePassId': uaePassId,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? fullName,
    String? phoneNumber,
    String? preferredLanguage,
    String? status,
    String? uaePassId,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      preferredLanguage: preferredLanguage ?? this.preferredLanguage,
      status: status ?? this.status,
      uaePassId: uaePassId ?? this.uaePassId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        email,
        fullName,
        phoneNumber,
        preferredLanguage,
        status,
        uaePassId,
        createdAt,
        updatedAt,
      ];
}
