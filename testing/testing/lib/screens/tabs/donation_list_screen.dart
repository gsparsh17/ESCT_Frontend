import 'package:flutter/material.dart';
import '../../widgets/custom_app_bar.dart';
import '../donation/late_doctor_wise_list_screen.dart';
import '../donation/gatimaan_sahyog_list_screen.dart';

class DonationListScreen extends StatelessWidget {
  const DonationListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'सहयोग सूची'),
      backgroundColor: Colors.grey.shade100,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            _buildOptionCard(
              context: context,
              title: 'वर्तमान सहयोग सूची',
              subtitle: '(Late Doctor Wise)',
              description: 'View active donation drives for the families of doctors who have unfortunately passed away.',
              icon: Icons.family_restroom_rounded,
              gradientColors: [Colors.purple.shade300, Colors.purple.shade500],
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) =>  LateDoctorWiseListScreen()));
              },
            ),
            _buildOptionCard(
              context: context,
              title: 'गतिमान सहयोग सूची',
              subtitle: '(Ongoing Support List)',
              description: 'Track the status and details of ongoing support initiatives and contributions.',
              icon: Icons.track_changes_rounded,
              gradientColors: [Colors.orange.shade300, Colors.orange.shade500],
              onTap: () {
                 Navigator.push(context, MaterialPageRoute(builder: (_) =>  GatimaanSahyogListScreen()));
              },
            ),
             _buildOptionCard(
              context: context,
              title: 'पुरानी सहयोग सूची',
              subtitle: '(Archived Drives)',
              description: 'Access the records and details of all completed donation drives and their impact.',
              icon: Icons.archive_rounded,
              gradientColors: [Colors.blue.shade300, Colors.blue.shade500],
              onTap: () {
               // _showComingSoonDialog(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) =>  LateDoctorWiseListScreen()));

              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionCard({
    required BuildContext context,
    required String title,
    required String subtitle,
    required String description,
    required IconData icon,
    required List<Color> gradientColors,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 20),
      elevation: 6,
      shadowColor: gradientColors[1].withOpacity(0.3),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
             gradient: LinearGradient(
              colors: [gradientColors[0], gradientColors[1]],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.white.withOpacity(0.9),
                      child: Icon(icon, color: gradientColors[1], size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                           Text(
                            title,
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          if (subtitle.isNotEmpty)
                          Text(
                            subtitle,
                            style: TextStyle(fontSize: 15, color: Colors.white.withOpacity(0.9)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  description,
                  style: TextStyle(fontSize: 15, color: Colors.white.withOpacity(0.9), height: 1.4),
                ),
                const SizedBox(height: 16),
                Align(
                  alignment: Alignment.bottomRight,
                  child:  Icon(Icons.arrow_forward_ios, color: Colors.white.withOpacity(0.8)),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showComingSoonDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Feature Coming Soon!'),
        content: const Text('This section is currently under development.'),
        actions: <Widget>[
          TextButton(
            child: const Text('Okay'),
            onPressed: () => Navigator.of(ctx).pop(),
          )
        ],
      ),
    );
  }
}

