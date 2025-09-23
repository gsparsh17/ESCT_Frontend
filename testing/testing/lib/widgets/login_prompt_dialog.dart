import 'package:flutter/material.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';

class LoginPromptDialog extends StatelessWidget {
  const LoginPromptDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.0)),
      elevation: 5,
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(24.0),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 20,
              offset: const Offset(0, 10),
            )
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.lock_outline_rounded,
              color: Colors.teal.shade300,
              size: 60,
            ),
            const SizedBox(height: 16),
            const Text(
              'Login Required',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Please log in or create an account to access this feature.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            // Login Button
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close the dialog first
                Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('LOGIN', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
            const SizedBox(height: 12),
            // Register Button
            OutlinedButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close the dialog first
                Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen()));
              },
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.teal,
                minimumSize: const Size(double.infinity, 50),
                side: const BorderSide(color: Colors.teal, width: 2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('REGISTER', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Maybe Later',
                style: TextStyle(color: Colors.grey.shade500),
              ),
            )
          ],
        ),
      ),
    );
  }
}
