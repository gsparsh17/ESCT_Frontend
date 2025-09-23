import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_event.dart';
import '../../blocs/auth/auth_state.dart';
import 'register_screen.dart'; 

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _ehrmsController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _ehrmsController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLoginPressed() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(LoggedIn(
            ehrmsCode: _ehrmsController.text.toUpperCase().trim(),
            password: _passwordController.text,
          ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      // No AppBar needed as it's part of the main page flow now
      body: BlocListener<AuthBloc, AuthState>(
        // This listener is now only responsible for showing error messages
        listener: (context, state) {
          if (state is AuthFailure) {
            ScaffoldMessenger.of(context)
              ..hideCurrentSnackBar()
              ..showSnackBar(SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.redAccent,
              ));
          }
        },
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(Icons.lock_open_outlined, size: 80, color: Colors.teal),
                    const SizedBox(height: 20),
                    const Text('Welcome Back!', textAlign: TextAlign.center, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    const Text('Sign in to continue', textAlign: TextAlign.center, style: TextStyle(fontSize: 16, color: Colors.grey)),
                    const SizedBox(height: 40),
                    TextFormField(
                      controller: _ehrmsController,
                      decoration: _inputDecoration(labelText: 'EHRMS Code', icon: Icons.badge_outlined),
                      validator: (v) => v!.isEmpty ? 'EHRMS Code is required' : null,
                      textCapitalization: TextCapitalization.characters,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _passwordController,
                      decoration: _inputDecoration(labelText: 'Password', icon: Icons.lock_outline),
                      obscureText: true,
                      validator: (v) => v!.isEmpty ? 'Password is required' : null,
                    ),
                    const SizedBox(height: 30),
                    BlocBuilder<AuthBloc, AuthState>(
                      builder: (context, state) {
                        return ElevatedButton(
                          onPressed: state is AuthLoading ? null : _onLoginPressed,
                          style: _buttonStyle(),
                          child: state is AuthLoading
                              ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('LOGIN', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        );
                      },
                    ),
                    const SizedBox(height: 20),
                    TextButton(
                      onPressed: () {
                        // Push RegisterScreen as a separate page since it's a multi-step process
                        Navigator.of(context).push(MaterialPageRoute(
                          builder: (_) => BlocProvider.value(
                            value: BlocProvider.of<AuthBloc>(context),
                            child: const RegisterScreen(),
                          ),
                        ));
                      },
                      child: const Text("Don't have an account? Register", style: TextStyle(color: Colors.teal)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({required String labelText, required IconData icon}) {
    return InputDecoration(
      labelText: labelText,
      prefixIcon: Icon(icon, color: Colors.teal),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.0)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12.0), borderSide: BorderSide(color: Colors.grey.shade300)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12.0), borderSide: const BorderSide(color: Colors.teal, width: 2.0)),
      filled: true,
      fillColor: Colors.grey.shade50,
    );
  }

  ButtonStyle _buttonStyle() {
    return ElevatedButton.styleFrom(
      backgroundColor: Colors.teal,
      foregroundColor: Colors.white,
      padding: const EdgeInsets.symmetric(vertical: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      elevation: 5,
    );
  }
}

