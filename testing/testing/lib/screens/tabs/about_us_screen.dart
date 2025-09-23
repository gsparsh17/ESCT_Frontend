import 'package:flutter/material.dart';
import '../../widgets/custom_app_bar.dart';

class AboutUsScreen extends StatelessWidget {
  const AboutUsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'About Us'),
      backgroundColor: Colors.grey.shade100,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              const SizedBox(height: 24),
              _buildSectionCard(
                icon: Icons.flag_circle_outlined,
                title: 'Our Mission: Standing in Solidarity',
                content: "In the noble profession of medicine, government doctors form the bedrock of our nation's health. We are a community bound by a shared commitment to serve, often facing immense challenges with unwavering resilience. Our mission is to extend this bond beyond the hospital walls, creating a dedicated support system where doctors stand for doctors. We believe that in times of crisis, the hand that heals should also be the first to help.",
                color: Colors.blue.shade400,
              ),
              const SizedBox(height: 20),
              _buildSectionCard(
                icon: Icons.work_outline_rounded,
                title: 'What We Do',
                content: "This platform is a dedicated, transparent, and secure digital space built exclusively for the community of government doctors. Our primary purpose is to channel immediate financial support to the families of our colleagues who have tragically lost their lives or to those doctors who are facing severe personal or medical crises.",
                color: Colors.orange.shade400,
              ),
              const SizedBox(height: 20),
              _buildSectionCard(
                icon: Icons.lightbulb_outline_rounded,
                title: 'The Need for This Platform',
                content: "The life of a government doctor is one of relentless service, but it is not without its perils. Accidents, unforeseen health calamities, and other tragic events can leave families in sudden and profound distress. Timely financial assistance can provide a crucial safety net to manage immediate expenses, support a child's education, or simply offer the breathing room a family needs to navigate their darkest hours.",
                color: Colors.green.shade400,
              ),
              const SizedBox(height: 24),
              _buildSectionHeader('How It Works'),
              _buildProcessStep(
                number: '1',
                title: 'Verification',
                content: 'Every case presented on our platform is carefully verified to ensure that the need is genuine and the details are accurate.',
              ),
              _buildProcessStep(
                number: '2',
                title: 'Contribution',
                content: 'Fellow doctors can browse through active causes, understand the circumstances, and donate directly and securely through the app.',
              ),
              _buildProcessStep(
                number: '3',
                title: 'Direct Support',
                content: 'The funds collected are transferred directly to the affected doctor or their immediate family, minimizing overhead and maximizing impact.',
              ),
              const SizedBox(height: 24),
              _buildCommunitySection(),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20.0),
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
                  'A Community of Healers, A Circle of Support.',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: Colors.grey.shade800,
        ),
      ),
    );
  }
  
  Widget _buildSectionCard({
    required IconData icon,
    required String title,
    required String content,
    required Color color,
  }) {
    return Card(
      color: Colors.white,
      elevation: 2,
      shadowColor: color.withOpacity(0.2),
      shape: RoundedRectangleBorder(
        side: BorderSide(color: color.withOpacity(0.5), width: 1),
        borderRadius: BorderRadius.circular(15.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 28),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade800,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              content,
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey.shade600,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildProcessStep({
    required String number,
    required String title,
    required String content,
  }) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.symmetric(vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              backgroundColor: Colors.teal,
              radius: 14,
              child: Text(
                number,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    content,
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildCommunitySection() {
    return Container(
      padding: const EdgeInsets.all(20.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15.0),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Icon(Icons.groups_2_rounded, color: Colors.teal, size: 40),
          const SizedBox(height: 12),
          Text(
            'Our Community: A Family of Healers',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'By joining this platform, you are upholding a promise to be there for one another. Thank you for being a part of this vital circle of support.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              color: Colors.grey.shade600,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
