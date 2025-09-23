import 'package:flutter/material.dart';
import '../../widgets/custom_app_bar.dart';

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _submitForm() {
    if (_formKey.currentState!.validate()) {
      // In a real app, you would send this data to a server or email service.
      final name = _nameController.text;
      final email = _emailController.text;
      final message = _messageController.text;

      // Clear the form
      _nameController.clear();
      _emailController.clear();
      _messageController.clear();

      // Show a confirmation message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Thank you! Your message has been sent.'),
          backgroundColor: Colors.green.shade600,
          behavior: SnackBarBehavior.floating,
        ),
      );
      
      // Unfocus the keyboard
      FocusScope.of(context).unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Contact Support'),
      backgroundColor: Colors.grey.shade100,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(),
            const SizedBox(height: 24),
            _buildSectionHeader('Direct Contact', Icons.alternate_email_rounded),
            _buildContactCard(
              icon: Icons.call_outlined,
              title: 'Call Us',
              subtitle: '+91 (522) 234-5678',
              onTap: () { /* Add url_launcher functionality here */ },
              color: Colors.green,
            ),
            const SizedBox(height: 12),
            _buildContactCard(
              icon: Icons.email_outlined,
              title: 'Email Us',
              subtitle: 'support@doctordonate.org',
              onTap: () { /* Add url_launcher functionality here */ },
              color: Colors.orange,
            ),
            const SizedBox(height: 12),
             _buildContactCard(
              icon: Icons.location_on_outlined,
              title: 'Our Office',
              subtitle: 'Vibhuti Khand, Gomti Nagar, Lucknow',
              onTap: () { /* Add map launcher functionality here */ },
              color: Colors.blue,
            ),
            const SizedBox(height: 24),
            _buildSectionHeader('Send us a Message', Icons.message_rounded),
            _buildContactForm(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal.shade400, Colors.teal.shade600],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(15.0),
      ),
      child: const Row(
        children: [
          Icon(Icons.support_agent_rounded, color: Colors.white, size: 50),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Get in Touch',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'We are here to help you with any questions or issues.',
                  style: TextStyle(color: Colors.white70, fontSize: 15),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        children: [
          Icon(icon, color: Colors.teal, size: 24),
          const SizedBox(width: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required Color color,
  }) {
    return Card(
      color: Colors.white,
      elevation: 2,
      shadowColor: color.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: color.withOpacity(0.1),
                child: Icon(icon, color: color, size: 22),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.grey.shade800)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: TextStyle(color: Colors.grey.shade600, fontSize: 14)),
                ],
              ),
              const Spacer(),
              Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey.shade400),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContactForm() {
    return Card(
       color: Colors.white,
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.05),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _nameController,
                decoration: _inputDecoration(label: 'Your Name', icon: Icons.person_outline),
                validator: (value) => value!.isEmpty ? 'Please enter your name' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: _inputDecoration(label: 'Your Email', icon: Icons.email_outlined),
                keyboardType: TextInputType.emailAddress,
                validator: (value) => value!.isEmpty || !value.contains('@') ? 'Please enter a valid email' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _messageController,
                decoration: _inputDecoration(label: 'Your Message', icon: Icons.message_outlined),
                maxLines: 5,
                validator: (value) => value!.isEmpty ? 'Please enter your message' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _submitForm,
                icon: const Icon(Icons.send_rounded),
                label: const Text('SEND MESSAGE'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({required String label, required IconData icon}) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: Colors.teal),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.0)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12.0), borderSide: BorderSide(color: Colors.grey.shade300)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12.0), borderSide: const BorderSide(color: Colors.teal, width: 2.0)),
    );
  }
}
