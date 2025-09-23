import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_state.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/login_prompt_dialog.dart';

// 1. Data Model for a Doctor
class Doctor {
  final String name;
  final String pool;
  final String id;
  final String ehrmsCode;
  final String tcid;
  final String district;
  final String block;
  final DateTime date;
  final String hospitalName;

  Doctor({
    required this.name,
    required this.pool,
    required this.id,
    required this.ehrmsCode,
    required this.tcid,
    required this.district,
    required this.block,
    required this.date,
    required this.hospitalName,
  });
}

class DoctorsListScreen extends StatefulWidget {
  const DoctorsListScreen({super.key});

  @override
  State<DoctorsListScreen> createState() => _DoctorsListScreenState();
}

class _DoctorsListScreenState extends State<DoctorsListScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Doctor> _filteredDoctors = [];

  // --- Filter State Variables ---
  String? _selectedDistrict;
  String? _selectedBlock;
  List<String> _districts = [];
  Map<String, List<String>> _blocksByDistrict = {};
  List<String> _currentBlocks = [];


  // 2. Dummy Data for Doctors List
  final List<Doctor> _allDoctors = [
    Doctor(name: 'Dr. Aarav Sharma', pool: 'General Physician', id: 'DOC1001', ehrmsCode: 'EHRMS4523', tcid: 'TCID9981', district: 'Lucknow', block: 'Gomti Nagar', date: DateTime(2023, 5, 12), hospitalName: 'Sanjay Gandhi Hospital'),
    Doctor(name: 'Dr. Priya Singh', pool: 'Cardiologist', id: 'DOC1002', ehrmsCode: 'EHRMS4524', tcid: 'TCID9982', district: 'Kanpur', block: 'Swaroop Nagar', date: DateTime(2022, 11, 20), hospitalName: 'Lala Lajpat Rai Hospital'),
    Doctor(name: 'Dr. Rohan Mehra', pool: 'Pediatrician', id: 'DOC1003', ehrmsCode: 'EHRMS4525', tcid: 'TCID9983', district: 'Varanasi', block: 'Lanka', date: DateTime(2023, 1, 30), hospitalName: 'Sir Sunderlal Hospital, BHU'),
    Doctor(name: 'Dr. Anika Gupta', pool: 'Neurologist', id: 'DOC1004', ehrmsCode: 'EHRMS4526', tcid: 'TCID9984', district: 'Prayagraj', block: 'Civil Lines', date: DateTime(2021, 8, 15), hospitalName: 'Swaroop Rani Nehru Hospital'),
    Doctor(name: 'Dr. Vikram Patel', pool: 'Orthopedic Surgeon', id: 'DOC1005', ehrmsCode: 'EHRMS4527', tcid: 'TCID9985', district: 'Agra', block: 'Tajganj', date: DateTime(2023, 2, 25), hospitalName: 'Sarojini Naidu Medical College'),
    Doctor(name: 'Dr. Ishaan Verma', pool: 'Dermatologist', id: 'DOC1006', ehrmsCode: 'EHRMS4528', tcid: 'TCID9986', district: 'Meerut', block: 'Shastri Nagar', date: DateTime(2022, 7, 10), hospitalName: 'Lala Lajpat Rai Memorial Medical College'),
    Doctor(name: 'Dr. Diya Khanna', pool: 'Oncologist', id: 'DOC1007', ehrmsCode: 'EHRMS4529', tcid: 'TCID9987', district: 'Ghaziabad', block: 'Indirapuram', date: DateTime(2023, 8, 5), hospitalName: 'Santosh Hospital'),
    Doctor(name: 'Dr. Kabir Joshi', pool: 'ENT Specialist', id: 'DOC1008', ehrmsCode: 'EHRMS4530', tcid: 'TCID9988', district: 'Noida', block: 'Sector 62', date: DateTime(2021, 12, 1), hospitalName: 'District Government Hospital'),
    Doctor(name: 'Dr. Sanvi Reddy', pool: 'Gastroenterologist', id: 'DOC1009', ehrmsCode: 'EHRMS4531', tcid: 'TCID9989', district: 'Bareilly', block: 'Civil Lines', date: DateTime(2023, 3, 18), hospitalName: 'District Hospital Bareilly'),
    Doctor(name: 'Dr. Arjun Kumar', pool: 'General Physician', id: 'DOC1010', ehrmsCode: 'EHRMS4532', tcid: 'TCID9990', district: 'Aligarh', block: 'Ramghat Road', date: DateTime(2022, 9, 22), hospitalName: 'Jawaharlal Nehru Medical College'),
    Doctor(name: 'Dr. Myra Chaudhary', pool: 'Psychiatrist', id: 'DOC1011', ehrmsCode: 'EHRMS4533', tcid: 'TCID9991', district: 'Moradabad', block: 'Kanth Road', date: DateTime(2023, 6, 30), hospitalName: 'District Hospital Moradabad'),
    Doctor(name: 'Dr. Vivaan Tiwari', pool: 'Pulmonologist', id: 'DOC1012', ehrmsCode: 'EHRMS4534', tcid: 'TCID9992', district: 'Saharanpur', block: 'Court Road', date: DateTime(2021, 10, 11), hospitalName: 'SBD District Hospital'),
    Doctor(name: 'Dr. Zara Khan', pool: 'Ophthalmologist', id: 'DOC1013', ehrmsCode: 'EHRMS4535', tcid: 'TCID9993', district: 'Gorakhpur', block: 'Medical College Road', date: DateTime(2023, 4, 14), hospitalName: 'BRD Medical College'),
    Doctor(name: 'Dr. Reyansh Mishra', pool: 'Cardiologist', id: 'DOC1014', ehrmsCode: 'EHRMS4536', tcid: 'TCID9994', district: 'Lucknow', block: 'Indira Nagar', date: DateTime(2022, 2, 8), hospitalName: 'Ram Manohar Lohia Hospital'),
    Doctor(name: 'Dr. Aisha Agarwal', pool: 'Pediatrician', id: 'DOC1015', ehrmsCode: 'EHRMS4537', tcid: 'TCID9995', district: 'Kanpur', block: 'Kakadeo', date: DateTime(2023, 7, 21), hospitalName: 'Ursula Horsman Memorial Hospital'),
  ];
  
  @override
  void initState() {
    super.initState();
    _initializeFilters();
    _filteredDoctors = _allDoctors;
    _searchController.addListener(_filterDoctors);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = context.read<AuthBloc>().state;
      if (authState is AuthUnauthenticated) {
        _showLoginPromptDialog();
      }
    });
  }

  void _initializeFilters() {
    // Dummy data for filters
    _blocksByDistrict = {
      'Lucknow': ['All Blocks', 'Gomti Nagar', 'Indira Nagar', 'Hazratganj'],
      'Kanpur': ['All Blocks', 'Swaroop Nagar', 'Kakadeo', 'Civil Lines'],
      'Varanasi': ['All Blocks', 'Lanka', 'Sigra', 'Bhelupur'],
      'Prayagraj': ['All Blocks', 'Civil Lines', 'Allahpur', 'Kareli'],
      'Agra': ['All Blocks', 'Tajganj', 'Sikandra', 'Dayalbagh'],
    };
    _districts = ['All Districts', ..._blocksByDistrict.keys];
    _selectedDistrict = _districts[0];
    _currentBlocks = [];
  }

  void _filterDoctors() {
    String query = _searchController.text.toLowerCase();
    setState(() {
      _filteredDoctors = _allDoctors.where((doctor) {
        final queryMatch = doctor.name.toLowerCase().contains(query) ||
               doctor.hospitalName.toLowerCase().contains(query) ||
               doctor.district.toLowerCase().contains(query);
        final districtMatch = _selectedDistrict == 'All Districts' || doctor.district == _selectedDistrict;
        final blockMatch = _selectedBlock == null || _selectedBlock == 'All Blocks' || doctor.block == _selectedBlock;
        return queryMatch && districtMatch && blockMatch;
      }).toList();
    });
  }

  void _showLoginPromptDialog() {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) => const LoginPromptDialog(),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Doctors Directory'),
      backgroundColor: Colors.grey.shade100,
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthAuthenticated) {
            return Column(
              children: [
                _buildFilterSection(),
                Expanded(
                  child: _filteredDoctors.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                          itemCount: _filteredDoctors.length,
                          itemBuilder: (context, index) {
                            return _buildDoctorCard(_filteredDoctors[index]);
                          },
                        ),
                ),
              ],
            );
          } else {
            return _buildLoginRequiredPlaceholder();
          }
        },
      ),
    );
  }

  Widget _buildFilterSection() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      color: Colors.white,
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search by name, hospital...',
              prefixIcon: Icon(Icons.search, color: Colors.grey.shade600),
              filled: true,
              fillColor: Colors.grey.shade50,
              contentPadding: const EdgeInsets.symmetric(vertical: 15),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildFilterDropdown(
                  hint: 'Select District',
                  value: _selectedDistrict,
                  items: _districts,
                  onChanged: (newValue) {
                    setState(() {
                      _selectedDistrict = newValue;
                      // Update block list based on district
                      _selectedBlock = null;
                      _currentBlocks = _blocksByDistrict[newValue] ?? [];
                      _filterDoctors();
                    });
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildFilterDropdown(
                  hint: 'Select Block',
                  value: _selectedBlock,
                  items: _currentBlocks,
                  onChanged: (newValue) {
                     setState(() {
                      _selectedBlock = newValue;
                      _filterDoctors();
                    });
                  },
                  // Disable block filter if no district is selected
                  isDisabled: _selectedDistrict == 'All Districts' || _selectedDistrict == null,
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildFilterDropdown({
    required String hint,
    required String? value,
    required List<String> items,
    required ValueChanged<String?> onChanged,
    bool isDisabled = false,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      items: items.map((item) => DropdownMenuItem(value: item, child: Text(item))).toList(),
      onChanged: isDisabled ? null : onChanged,
      decoration: InputDecoration(
        filled: true,
        fillColor: isDisabled ? Colors.grey.shade200 : Colors.grey.shade50,
        hintText: hint,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
  
  Widget _buildDoctorCard(Doctor doctor) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 16.0),
      elevation: 5,
      shadowColor: Colors.teal.withOpacity(0.1),
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
                  colors: [Colors.teal.shade300, Colors.teal.shade600],
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
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 30,
                          backgroundColor: Colors.teal.withOpacity(0.1),
                          child: Text(
                            doctor.name.isNotEmpty ? doctor.name[0] : 'D',
                            style: const TextStyle(fontSize: 26, color: Colors.teal, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(doctor.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 19, color: Colors.black87)),
                              const SizedBox(height: 4),
                              Text(doctor.pool, style: TextStyle(color: Colors.grey.shade700, fontSize: 15)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Divider(color: Colors.grey.shade200),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        _buildDetailItem('District', doctor.district, Icons.location_city_outlined),
                        _buildDetailItem('Block', doctor.block, Icons.map_outlined),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _buildDetailItem('Hospital', doctor.hospitalName, Icons.local_hospital_outlined, isFullWidth: true),
                    const SizedBox(height: 12),
                     Row(
                      children: [
                        _buildDetailItem('EHRMS', doctor.ehrmsCode, Icons.badge_outlined),
                        _buildDetailItem('Joining Date', '${doctor.date.day}/${doctor.date.month}/${doctor.date.year}', Icons.calendar_today_outlined),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Align(
                      alignment: Alignment.centerRight,
                      child: OutlinedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.arrow_forward_ios, size: 14),
                        label: const Text('View Profile'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.teal,
                          side: BorderSide(color: Colors.teal.shade100),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20.0),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(String label, String value, IconData icon, {bool isFullWidth = false}) {
    return Expanded(
      flex: isFullWidth ? 2 : 1,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.teal, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.black87, fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search_off_rounded, size: 80, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text('No Doctors Found', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
          const SizedBox(height: 8),
          Text('Your search query did not match any doctors.', style: TextStyle(fontSize: 16, color: Colors.grey.shade500), textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildLoginRequiredPlaceholder() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.lock_outline_rounded, size: 80, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text('Authentication Required', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
          const SizedBox(height: 8),
          Text('Please log in to view the doctors directory.', style: TextStyle(fontSize: 16, color: Colors.grey.shade500), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

