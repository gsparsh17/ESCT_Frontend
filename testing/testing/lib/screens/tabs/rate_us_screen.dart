import 'package:flutter/material.dart';
import '../../widgets/custom_app_bar.dart';
import 'dart:async';

class RateUsScreen extends StatefulWidget {
  const RateUsScreen({super.key});

  @override
  State<RateUsScreen> createState() => _RateUsScreenState();
}

class _RateUsScreenState extends State<RateUsScreen> {
  int _rating = 0;
  final _feedbackController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  void _submitFeedback() {
    if (_feedbackController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your feedback before submitting.'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    // Simulate a network call
    Timer(const Duration(seconds: 2), () {
      setState(() {
        _isSubmitting = false;
        _rating = 0; // Reset the screen
        _feedbackController.clear();
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Thank you for your valuable feedback!'),
          backgroundColor: Colors.green,
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Rate Our App'),
      backgroundColor: Colors.grey.shade100,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            _buildHeader(),
            const SizedBox(height: 32),
            _buildStarRating(),
            const SizedBox(height: 32),
            _buildFeedbackSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Icon(Icons.mobile_friendly_rounded, color: Colors.teal.shade300, size: 80),
        const SizedBox(height: 16),
        const Text(
          'Enjoying the App?',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Your feedback helps us improve and serve the community better. Please take a moment to rate your experience.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16, color: Colors.grey.shade600, height: 1.5),
        ),
      ],
    );
  }

  Widget _buildStarRating() {
    return Card(
      color: Colors.white,
      elevation: 4,
      shadowColor: Colors.black.withOpacity(0.08),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 24.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(5, (index) {
            return IconButton(
              onPressed: () {
                setState(() {
                  _rating = index + 1;
                });
              },
              icon: Icon(
                _rating > index ? Icons.star_rounded : Icons.star_border_rounded,
                size: 40,
                color: Colors.amber.shade600,
              ),
              splashColor: Colors.amber.withOpacity(0.2),
              highlightColor: Colors.amber.withOpacity(0.1),
            );
          }),
        ),
      ),
    );
  }

  Widget _buildFeedbackSection() {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 500),
      transitionBuilder: (child, animation) {
        return FadeTransition(
          opacity: animation,
          child: SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0.0, 0.3),
              end: Offset.zero,
            ).animate(animation),
            child: child,
          ),
        );
      },
      child: _rating == 0
          ? const SizedBox(height: 200) // Placeholder
          : (_rating <= 3 ? _buildImprovementForm() : _buildPositiveFeedbackActions()),
    );
  }

  Widget _buildImprovementForm() {
    return Card(
      color: Colors.white,
      key: const ValueKey('improvementForm'),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Text(
              'We are sorry to hear that. What can we do to improve?',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade800,
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _feedbackController,
              maxLines: 5,
              decoration: InputDecoration(
                hintText: 'Describe your experience...',
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitFeedback,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('SUBMIT FEEDBACK', style: TextStyle(fontWeight: FontWeight.bold)),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildPositiveFeedbackActions() {
    return Card(
      color: Colors.white,
      key: const ValueKey('positiveFeedback'),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Text(
              'Thank you for your support!',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade800,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your positive feedback helps us reach more doctors in the community.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 15),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () { /* Add Play Store link here */ },
              icon: const Icon(Icons.storefront_rounded),
              label: const Text('RATE ON PLAY STORE'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () { /* Add share functionality here */ },
              icon: const Icon(Icons.share_rounded),
              label: const Text('SHARE THE APP'),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.teal,
                minimumSize: const Size(double.infinity, 50),
                side: const BorderSide(color: Colors.teal),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
