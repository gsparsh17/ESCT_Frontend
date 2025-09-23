import 'package:equatable/equatable.dart';
import 'package:testing/models/nominee_model.dart';
import '../../models/user_model.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();
  @override
  List<Object?> get props => [];
}

class AppStarted extends AuthEvent {}

class LoggedIn extends AuthEvent {
  final String ehrmsCode;
  final String password;

  const LoggedIn({required this.ehrmsCode, required this.password});

  @override
  List<Object> get props => [ehrmsCode, password];
}

// --- MODIFIED: This event now carries the new data structure ---
class RegisterRequested extends AuthEvent {
  final String userType;
  final String? ehrmsCode;
  final String? pensionerNumber;
  final String password;
  final EmploymentDetails? employmentDetails;
  final PersonalDetails personalDetails;
  final BankDetails bankDetails;
  final NomineeModel nominee;
  
  const RegisterRequested({
    required this.userType,
    this.ehrmsCode,
    this.pensionerNumber,
    required this.password,
    this.employmentDetails,
    required this.personalDetails,
    required this.bankDetails,
    required this.nominee,
  });
}

class LoggedOut extends AuthEvent {}

