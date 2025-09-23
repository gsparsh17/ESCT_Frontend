import 'dart:convert';

// Helper function to safely parse dates from JSON
DateTime? _parseDate(String? date) {
  if (date == null) return null;
  return DateTime.tryParse(date);
}

class NomineeModel {
  final String? id;
  final String? userId;
  final String name;
  final String relation;
  final DateTime dateOfBirth;
  final String aadhaarNumber;
  final NomineeBankDetails bankDetails;
  final bool isPrimary;

  NomineeModel({
    this.id,
    this.userId,
    required this.name,
    required this.relation,
    required this.dateOfBirth,
    required this.aadhaarNumber,
    required this.bankDetails,
    this.isPrimary = true,
  });

  // --- FIX: Added the missing fromJson factory constructor ---
  factory NomineeModel.fromJson(Map<String, dynamic> json) {
    return NomineeModel(
      id: json['_id'],
      userId: json['userId'],
      name: json['name'],
      relation: json['relation'],
      dateOfBirth: _parseDate(json['dateOfBirth'])!,
      aadhaarNumber: json['aadhaarNumber'],
      bankDetails: NomineeBankDetails.fromJson(json['bankDetails']),
      isPrimary: json['isPrimary'] ?? false,
    );
  }
  
  Map<String, dynamic> toJson() {
    final today = DateTime.now();
    int calculatedAge = today.year - dateOfBirth.year;
    if (today.month < dateOfBirth.month || (today.month == dateOfBirth.month && today.day < dateOfBirth.day)) {
      calculatedAge--;
    }

    return {
      'name': name,
      'relation': relation,
      'dateOfBirth': dateOfBirth.toIso8601String(),
      'age': calculatedAge,
      'aadhaarNumber': aadhaarNumber,
      'bankDetails': bankDetails.toJson(),
      'isPrimary': isPrimary,
    };
  }
}

class NomineeBankDetails {
  final String accountNumber;
  final String ifscCode;
  final String bankName;
  final String? branchName;

  NomineeBankDetails({
    required this.accountNumber,
    required this.ifscCode,
    required this.bankName,
    this.branchName,
  });

  // --- FIX: Added the missing fromJson factory constructor ---
  factory NomineeBankDetails.fromJson(Map<String, dynamic> json) {
    return NomineeBankDetails(
      accountNumber: json['accountNumber'],
      ifscCode: json['ifscCode'],
      bankName: json['bankName'],
      branchName: json['branchName'],
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'accountNumber': accountNumber,
      'ifscCode': ifscCode,
      'bankName': bankName,
    };
    if (branchName != null && branchName!.isNotEmpty) {
      data['branchName'] = branchName;
    }
    return data;
  }
}

