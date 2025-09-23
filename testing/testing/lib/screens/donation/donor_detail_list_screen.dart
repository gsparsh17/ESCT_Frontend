import 'package:flutter/material.dart';
import 'late_doctor_wise_list_screen.dart';

class Donor {
  final String name;
  final String id;
  final String district;
  final String schoolName;
  final double totalAmount;

  Donor({ required this.name, required this.id, required this.district, required this.schoolName, required this.totalAmount });
}

class DonorDetailListScreen extends StatefulWidget {
  final DonationCase caseItem;
  const DonorDetailListScreen({super.key, required this.caseItem});

  @override
  State<DonorDetailListScreen> createState() => _DonorDetailListScreenState();
}

class _DonorDetailListScreenState extends State<DonorDetailListScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Donor> _filteredDonors = [];

  final List<Donor> _allDonors = [
    Donor(name: 'Dr. Rahul Bhardwaj', id: '24796514', district: 'Moradabad', schoolName: 'PS MORADABAD', totalAmount: 5000.0),
    Donor(name: 'Dr. Sneha Verma', id: '24796515', district: 'Lucknow', schoolName: 'KGMU', totalAmount: 7500.0),
    Donor(name: 'Dr. Alok Pandey', id: '24796516', district: 'Kanpur', schoolName: 'G.S.V.M. Medical College', totalAmount: 4000.0),
    Donor(name: 'Dr. Naval Kishor', id: '24796482', district: 'Bareilly', schoolName: 'Ups Thiriya Saidpur', totalAmount: 5500.0),
    Donor(name: 'Dr. Priya Singh', id: '24796517', district: 'Varanasi', schoolName: 'IMS, BHU', totalAmount: 6000.0),
  ];

  @override
  void initState() {
    super.initState();
    // Sort donors by amount to find the top donor
    _allDonors.sort((a, b) => b.totalAmount.compareTo(a.totalAmount));
    _filteredDonors = _allDonors;
    _searchController.addListener(_filterDonors);
  }

  void _filterDonors() {
    String query = _searchController.text.toLowerCase();
    setState(() {
      _filteredDonors = _allDonors.where((donor) {
        return donor.name.toLowerCase().contains(query) ||
               donor.district.toLowerCase().contains(query);
      }).toList();
    });
  }

   @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220.0,
            backgroundColor: Colors.teal,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              // title: Text('Case of ${widget.caseItem.doctorName}', style: const TextStyle(fontSize: 16.0, shadows: [Shadow(blurRadius: 8.0, color: Colors.black45)])),
              background: _buildHeaderCard(),
            ),
          ),
          SliverToBoxAdapter(child: _buildFilterSection()),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                // The first donor in the sorted list is the top donor
                bool isTopDonor = _filteredDonors[index] == _allDonors.first && _searchController.text.isEmpty;
                return _buildDonorCard(_filteredDonors[index], index + 1, isTopDonor);
              },
              childCount: _filteredDonors.length,
            ),
          )
        ],
      ),
    );
  }

  Widget _buildHeaderCard() {
    return Container(
      padding: const EdgeInsets.all(16).copyWith(top: 80, bottom: 60),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal.shade400, Colors.teal.shade700],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Total Collection: ₹${widget.caseItem.totalAmount.toStringAsFixed(0)}',
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white, shadows: [Shadow(blurRadius: 4.0, color: Colors.black26)]),
          ),
          const SizedBox(height: 8),
          Text(
            'Beneficiary: ${widget.caseItem.accountHolderName}',
            style: TextStyle(fontSize: 16, color: Colors.white.withOpacity(0.9)),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterSection() {
    return Container(
       padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
       color: Colors.grey.shade100,
       child: Column(
         crossAxisAlignment: CrossAxisAlignment.start,
         children: [
           TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search donors by name or district...',
              prefixIcon: Icon(Icons.search, color: Colors.grey.shade600),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
           Padding(
             padding: const EdgeInsets.only(top: 16.0, left: 8.0),
             child: Text(
              '${_filteredDonors.length} Supporters',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey.shade800),
            ),
           ),
         ],
       ),
    );
  }

  Widget _buildDonorCard(Donor donor, int serial, bool isTopDonor) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: isTopDonor ? 8 : 4,
      shadowColor: isTopDonor ? Colors.amber.withOpacity(0.3) : Colors.black.withOpacity(0.08),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
        side: isTopDonor ? BorderSide(color: Colors.amber.shade600, width: 2) : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: isTopDonor ? Colors.amber.shade100 : Colors.teal.shade50,
                  child: Text(serial.toString(), style: TextStyle(color: isTopDonor ? Colors.amber.shade800 : Colors.teal, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(donor.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
                      const SizedBox(height: 4),
                      Text(donor.district, style: TextStyle(color: Colors.grey.shade600)),
                    ],
                  ),
                ),
                if(isTopDonor)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade600,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.star, color: Colors.white, size: 14),
                        SizedBox(width: 4),
                        Text('Top Donor', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                  )
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                 Expanded(child: Text(donor.schoolName, style: TextStyle(color: Colors.grey.shade700, fontStyle: FontStyle.italic))),
                 Row(
                   children: [
                      Icon(Icons.volunteer_activism, color: Colors.green.shade600, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        '₹${donor.totalAmount.toStringAsFixed(0)}',
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green.shade800, fontSize: 16),
                      ),
                   ],
                 )
              ],
            )
          ],
        ),
      ),
    );
  }
}

