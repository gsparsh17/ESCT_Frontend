import 'dart:convert';

// Helper function to safely parse dates from JSON
DateTime? _parseDate(String? date) {
  if (date == null) return null;
  return DateTime.tryParse(date);
}

// Main User Model
class UserModel {
  final String? id;
  final String userType;
  final String? ehrmsCode;
  final String? pensionerNumber;
  final EmploymentDetails? employmentDetails;
  final PersonalDetails personalDetails;
  final BankDetails bankDetails;
  final bool? isVerified;
  final bool? isActive;
  final bool? isAdmin;

  UserModel({
    this.id,
    required this.userType,
    this.ehrmsCode,
    this.pensionerNumber,
    this.employmentDetails,
    required this.personalDetails,
    required this.bankDetails,
    this.isVerified,
    this.isActive,
    this.isAdmin,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'],
      userType: json['userType'],
      ehrmsCode: json['ehrmsCode'],
      pensionerNumber: json['pensionerNumber'],
      employmentDetails: json['employmentDetails'] != null
          ? EmploymentDetails.fromJson(json['employmentDetails'])
          : null,
      personalDetails: PersonalDetails.fromJson(json['personalDetails']),
      bankDetails: BankDetails.fromJson(json['bankDetails']),
      isVerified: json['isVerified'],
      isActive: json['isActive'],
      isAdmin: json['isAdmin'],
    );
  }
}

// Employment Details Sub-Model
class EmploymentDetails {
  final String state;
  final String district;
  final String department;
  final String designation;
  final DateTime dateOfJoining;
  final DateTime? dateOfRetirement;

  EmploymentDetails({
    required this.state,
    required this.district,
    required this.department,
    required this.designation,
    required this.dateOfJoining,
    this.dateOfRetirement,
  });

  factory EmploymentDetails.fromJson(Map<String, dynamic> json) {
    return EmploymentDetails(
      state: json['state'],
      district: json['district'],
      department: json['department'],
      designation: json['designation'],
      dateOfJoining: _parseDate(json['dateOfJoining'])!,
      dateOfRetirement: _parseDate(json['dateOfRetirement']),
    );
  }

  // --- FIX: Omit dateOfRetirement from JSON if it's null ---
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'state': state,
      'district': district,
      'department': department,
      'designation': designation,
      'dateOfJoining': dateOfJoining.toIso8601String(),
    };
    if (dateOfRetirement != null) {
      data['dateOfRetirement'] = dateOfRetirement!.toIso8601String();
    }
    return data;
  }
}

// Personal Details Sub-Model
class PersonalDetails {
  final String fullName;
  final DateTime dateOfBirth;
  final int age;
  final String sex;
  final String aadhaarNumber;
  final String phone;
  final String email;

  PersonalDetails({
    required this.fullName,
    required this.dateOfBirth,
    required this.age,
    required this.sex,
    required this.aadhaarNumber,
    required this.phone,
    required this.email,
  });

  factory PersonalDetails.fromJson(Map<String, dynamic> json) {
    return PersonalDetails(
      fullName: json['fullName'],
      dateOfBirth: _parseDate(json['dateOfBirth'])!,
      age: json['age'],
      sex: json['sex'],
      aadhaarNumber: json['aadhaarNumber'],
      phone: json['phone'],
      email: json['email'],
    );
  }

  Map<String, dynamic> toJson() {
    final today = DateTime.now();
    int calculatedAge = today.year - dateOfBirth.year;
    if (today.month < dateOfBirth.month || (today.month == dateOfBirth.month && today.day < dateOfBirth.day)) {
      calculatedAge--;
    }

    return {
      'fullName': fullName,
      'dateOfBirth': dateOfBirth.toIso8601String(),
      'age': calculatedAge,
      'sex': sex,
      'aadhaarNumber': aadhaarNumber,
      'phone': phone,
      'email': email,
    };
  }
}

// Bank Details Sub-Model
class BankDetails {
  final String accountNumber;
  final String confirmAccountNumber;
  final String ifscCode;
  final String bankName;
  final String? branchName;
  final String? upiId;

  BankDetails({
    required this.accountNumber,
    required this.confirmAccountNumber,
    required this.ifscCode,
    required this.bankName,
    this.branchName,
    this.upiId,
  });
  
  factory BankDetails.fromJson(Map<String, dynamic> json) {
    return BankDetails(
      accountNumber: json['accountNumber'],
      confirmAccountNumber: '', 
      ifscCode: json['ifscCode'],
      bankName: json['bankName'],
      branchName: json['branchName'],
      upiId: json['upiId'],
    );
  }
  
  // --- FIX: Omit optional fields from JSON if they are null or empty ---
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'accountNumber': accountNumber,
      'confirmAccountNumber': confirmAccountNumber,
      'ifscCode': ifscCode,
      'bankName': bankName,
    };
    if (branchName != null && branchName!.isNotEmpty) {
      data['branchName'] = branchName;
    }
    if (upiId != null && upiId!.isNotEmpty) {
      data['upiId'] = upiId;
    }
    return data;
  }
}

