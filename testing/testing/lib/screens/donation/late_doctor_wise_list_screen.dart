import 'package:flutter/material.dart';
import 'donor_detail_list_screen.dart';

class DonationCase {
  final String doctorName;
  final String accountHolderName;
  final String deathDate;
  final int amountPerPerson;
  final int totalDonors;
  final int targetDonors;
  final String cause;

  DonationCase({
    required this.doctorName,
    required this.accountHolderName,
    required this.deathDate,
    required this.amountPerPerson,
    required this.totalDonors,
    required this.targetDonors,
    required this.cause,
  });

  double get progress => totalDonors / targetDonors;
  int get totalAmount => totalDonors * amountPerPerson;
}

class LateDoctorWiseListScreen extends StatelessWidget {
   LateDoctorWiseListScreen({super.key});

  final List<DonationCase> _donationCases =  [
    DonationCase(doctorName: 'Dr. Noshad Ahmad', accountHolderName: 'SHABANA AZMI', deathDate: '2024-09-01', amountPerPerson: 155, totalDonors: 1850, targetDonors: 3000, cause: 'Sudden Cardiac Arrest'),
    DonationCase(doctorName: 'Dr. Chandra Prakash', accountHolderName: 'SUMAN DEVI', deathDate: '2024-10-10', amountPerPerson: 155, totalDonors: 980, targetDonors: 3000, cause: 'Road Accident'),
    DonationCase(doctorName: 'Dr. Arun Kumar', accountHolderName: 'SARITA SAKSENA', deathDate: '2024-10-24', amountPerPerson: 155, totalDonors: 2500, targetDonors: 3000, cause: 'Prolonged Illness'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Active Donation Drives',style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.teal,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      backgroundColor: Colors.grey.shade100,
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: _donationCases.length,
        itemBuilder: (context, index) {
          return _buildCaseCard(context, _donationCases[index], index + 1);
        },
      ),
    );
  }

  Widget _buildCaseCard(BuildContext context, DonationCase caseItem, int serial) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 20),
      elevation: 6,
      shadowColor: Colors.black.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: InkWell(
        onTap: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => DonorDetailListScreen(caseItem: caseItem)));
        },
        borderRadius: BorderRadius.circular(15),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'In Loving Memory of ${caseItem.doctorName}',
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black87),
              ),
              const SizedBox(height: 4),
              Text(
                'Cause of Demise: ${caseItem.cause}',
                style: TextStyle(fontSize: 15, color: Colors.red.shade700, fontStyle: FontStyle.italic),
              ),
              const Divider(height: 24),
              Text('Total Collection: ₹ ${caseItem.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.teal)),
              const SizedBox(height: 8),
              LinearProgressIndicator(
                value: caseItem.progress,
                minHeight: 8,
                backgroundColor: Colors.teal.withOpacity(0.2),
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.teal),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${caseItem.totalDonors} Donors', style: TextStyle(color: Colors.grey.shade600)),
                  Text('${(caseItem.progress * 100).toStringAsFixed(0)}% Complete', style: TextStyle(color: Colors.grey.shade600)),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Beneficiary: ${caseItem.accountHolderName}', style: const TextStyle(fontSize: 15)),
                  ElevatedButton(
                    onPressed: () {
                       Navigator.push(context, MaterialPageRoute(builder: (_) => DonorDetailListScreen(caseItem: caseItem)));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal.shade50,
                      foregroundColor: Colors.teal.shade800,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('View Donors'),
                  )
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}

