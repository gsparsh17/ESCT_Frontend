import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);
    on<LoggedIn>(_onLoggedIn);
    on<RegisterRequested>(_onRegisterRequested);
    on<LoggedOut>(_onLoggedOut);
  }

  void _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    final user = await authRepository.getMe();
    if (user != null) {
      emit(AuthAuthenticated(user));
    } else {
      emit(AuthUnauthenticated());
    }
  }

  void _onLoggedIn(LoggedIn event, Emitter<AuthState> emit) async {
    // FIX: Changed event.identifier to event.ehrmsCode
    if (kDebugMode) print("[AuthBloc] LoggedIn event received for Identifier: ${event.ehrmsCode}");
    
    emit(AuthLoading());
    try {
      // FIX: Changed event.identifier to event.ehrmsCode and passed it as the 'identifier' argument
      final user = await authRepository.login(
        identifier: event.ehrmsCode,
        password: event.password,
      );
      emit(AuthAuthenticated(user));
    } catch (e) {
      if (kDebugMode) print("[AuthBloc] Caught error during login: ${e.toString()}");
      emit(AuthFailure(e.toString()));
      emit(AuthUnauthenticated());
    }
  }
  
  void _onRegisterRequested(RegisterRequested event, Emitter<AuthState> emit) async {
    if (kDebugMode) print("[AuthBloc] RegisterRequested event received");
    
    emit(AuthLoading());
    try {
      final user = await authRepository.register(
        userType: event.userType,
        ehrmsCode: event.ehrmsCode,
        pensionerNumber: event.pensionerNumber,
        password: event.password,
        personalDetails: event.personalDetails,
        employmentDetails: event.employmentDetails,
        bankDetails: event.bankDetails,
        nominee: event.nominee,
      );
      emit(AuthAuthenticated(user));
    } catch (e) {
      if (kDebugMode) print("[AuthBloc] Caught error during registration: ${e.toString()}");
      emit(AuthFailure(e.toString()));
      emit(AuthUnauthenticated());
    }
  }

  void _onLoggedOut(LoggedOut event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    await authRepository.logout();
    emit(AuthUnauthenticated());
  }
}

