import 'package:flutter/material.dart';

class GatimaanCase {
  final String name;
  final String id;
  final String ehrmsCode;
  final String school;
  final String district;
  final String lateDoctorName;

  GatimaanCase({ required this.name, required this.id, required this.ehrmsCode, required this.school, required this.district, required this.lateDoctorName });
}

class GatimaanSahyogListScreen extends StatelessWidget {
  GatimaanSahyogListScreen({super.key});
 
  final List<GatimaanCase> _cases =  [
    GatimaanCase(name: 'Anjali Dixit', id: '636488', ehrmsCode: '2221618', school: 'Block resources centre pasgawan kheri', district: 'Lakhimpur Kheri', lateDoctorName: 'Santosh Kumar Singh'),
    GatimaanCase(name: 'Yasha Savita', id: '636477', ehrmsCode: '490155', school: 'UPS JALALA COMPOSITE', district: 'Hamirpur', lateDoctorName: 'Rakesh Kumar'),
    GatimaanCase(name: 'Priya Sharma', id: '636491', ehrmsCode: '358713', school: 'Govt. Girls School', district: 'Lucknow', lateDoctorName: 'Sunita Sharma'),
    GatimaanCase(name: 'Amit Kumar', id: '636492', ehrmsCode: '358714', school: 'Primary School No. 2', district: 'Kanpur', lateDoctorName: 'Rajesh Kumar'),
    GatimaanCase(name: 'Neha Singh', id: '636493', ehrmsCode: '358715', school: 'City Montessori School', district: 'Varanasi', lateDoctorName: 'Suresh Singh'),
    GatimaanCase(name: 'Vikas Yadav', id: '636494', ehrmsCode: '358716', school: 'St. Joseph School', district: 'Agra', lateDoctorName: 'Anil Yadav'),
    GatimaanCase(name: 'Ritu Verma', id: '636495', ehrmsCode: '358717', school: 'Kendriya Vidyalaya', district: 'Allahabad', lateDoctorName: 'Meena Verma'),
    GatimaanCase(name: 'Sandeep Gupta', id: '636496', ehrmsCode: '358718', school: 'DAV Public School', district: 'Bareilly', lateDoctorName: 'Ashok Gupta'),
    GatimaanCase(name: 'Pooja Mishra', id: '636497', ehrmsCode: '358719', school: 'Holy Cross School', district: 'Gorakhpur', lateDoctorName: 'Vijay Mishra'),
    GatimaanCase(name: 'Manish Tiwari', id: '636498', ehrmsCode: '358720', school: 'Sunbeam School', district: 'Jhansi', lateDoctorName: 'Arun Tiwari'),
    GatimaanCase(name: 'Swati Pandey', id: '636499', ehrmsCode: '358721', school: 'Sacred Heart School', district: 'Faizabad', lateDoctorName: 'Ramesh Pandey'),
    GatimaanCase(name: 'Deepak Chauhan', id: '636500', ehrmsCode: '358722', school: 'Modern Public School', district: 'Moradabad', lateDoctorName: 'Sanjay Chauhan'),
    GatimaanCase(name: 'Ravi Verma', id: '636490', ehrmsCode: '358712', school: 'Govt. Inter College', district: 'Sitapur', lateDoctorName: 'Manoj Bajpai'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('गतिमान सहयोग सूची',style: TextStyle(color: Colors.white),),
        backgroundColor: Colors.teal,
        iconTheme: const IconThemeData(color: Colors.white)
      ),
      backgroundColor: Colors.grey.shade100,
      body: Column(
        children: [
          _buildFilterSection(),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _cases.length,
              itemBuilder: (context, index) {
                // The first item in the list is the summary card
                if (index == 0) {
                  return _buildSummaryCard();
                }
                // The rest are the case cards
                return _buildCaseCard(_cases[index-1], index);
              },
            ),
          )
        ],
      ),
    );
  }

  Widget _buildFilterSection() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4))
        ]
      ),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search by name, district...',
          prefixIcon: const Icon(Icons.search),
          filled: true,
          fillColor: Colors.grey.shade100,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        ),
      ),
    );
  }
  
  Widget _buildSummaryCard() {
    return Card(
      margin: const EdgeInsets.only(bottom: 20, top: 16),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
        side: BorderSide(color: Colors.teal.withOpacity(0.3))
      ),
      color: Colors.teal.withOpacity(0.05),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Row(
          children: [
            const Icon(Icons.info_outline_rounded, color: Colors.teal, size: 32),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${_cases.length} Active Cases',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.teal),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'These are ongoing support drives. Your contribution is valuable.',
                    style: TextStyle(color: Colors.grey.shade700),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildCaseCard(GatimaanCase caseItem, int serial) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 6,
      shadowColor: Colors.black.withOpacity(0.1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      clipBehavior: Clip.antiAlias,
      child: IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              width: 8,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.orange.shade300, Colors.orange.shade600],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '$serial | ${caseItem.name}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '(ID: ${caseItem.id} | EHRMS: ${caseItem.ehrmsCode})',
                      style: TextStyle(fontSize: 15, color: Colors.purple.shade700, fontWeight: FontWeight.w500),
                    ),
                    const Divider(height: 24),
                    _buildDetailRow(Icons.family_restroom_outlined, 'In Support Of', caseItem.lateDoctorName),
                    const SizedBox(height: 12),
                    _buildDetailRow(Icons.school_outlined, 'School', caseItem.school),
                    const SizedBox(height: 12),
                    _buildDetailRow(Icons.location_city_outlined, 'District', caseItem.district),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: Colors.teal.withOpacity(0.1),
          child: Icon(icon, color: Colors.teal, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 15),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

