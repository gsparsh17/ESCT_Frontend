import 'package:flutter/material.dart';
import '../../widgets/custom_app_bar.dart';

// 1. Data Model for a Notice
class Notice {
  final String title;
  final String content;
  final String category;
  final DateTime date;
  final Color categoryColor;

  Notice({
    required this.title,
    required this.content,
    required this.category,
    required this.date,
    required this.categoryColor,
  });
}

class NoticeScreen extends StatefulWidget {
  const NoticeScreen({super.key});

  @override
  State<NoticeScreen> createState() => _NoticeScreenState();
}

class _NoticeScreenState extends State<NoticeScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';

  // 2. Dummy Data for Notices (using current date for relevance)
  final List<Notice> _allNotices = [
    Notice(
      title: 'Urgent: Blood Donation Camp on Sunday',
      content: 'An urgent blood donation camp is being organized this coming Sunday, September 7, 2025, at the Community Hall, Lucknow. All doctors are requested to participate and encourage others. Your contribution can save lives.',
      category: 'Urgent',
      date: DateTime(2025, 9, 3, 11, 0), // Set a specific time for "time ago"
      categoryColor: Colors.red.shade400,
    ),
    Notice(
      title: 'Monthly General Body Meeting',
      content: 'The monthly general body meeting is scheduled for September 10, 2025, at 5:00 PM in the main auditorium. Key agendas include budget review and planning for the next quarter. Attendance is mandatory for all department heads.',
      category: 'Meeting',
      date: DateTime(2025, 9, 2, 18, 0),
      categoryColor: Colors.blue.shade400,
    ),
    Notice(
      title: 'Free Health Check-up Camp Initiative',
      content: 'We are pleased to announce a free health check-up camp for underprivileged families on September 20, 2025. We are looking for volunteers to help with the organization and execution. Please register your name with the administration office.',
      category: 'Camp',
      date: DateTime(2025, 8, 28),
      categoryColor: Colors.green.shade400,
    ),
    Notice(
      title: 'System Maintenance Notification',
      content: 'Please be advised that the hospital\'s internal server will be down for scheduled maintenance on Saturday, September 6, 2025, from 2:00 AM to 6:00 AM. Please save your work and log off before the scheduled time.',
      category: 'Info',
      date: DateTime(2025, 8, 25),
      categoryColor: Colors.orange.shade400,
    ),
     Notice(
      title: 'New Policy Regarding Leave Applications',
      content: 'A new policy for submitting leave applications will be effective from October 1, 2025. All leaves must now be submitted through the online portal at least one week in advance, except in cases of emergency.',
      category: 'Info',
      date: DateTime(2025, 8, 22),
      categoryColor: Colors.orange.shade400,
    ),
  ];

  List<Notice> _filteredNotices = [];

  @override
  void initState() {
    super.initState();
    _filteredNotices = _allNotices;
    // Sort notices by date by default
    _allNotices.sort((a, b) => b.date.compareTo(a.date));
    _searchController.addListener(_filterNotices);
  }

  void _filterNotices() {
    String query = _searchController.text.toLowerCase();
    setState(() {
      _filteredNotices = _allNotices.where((notice) {
        final titleMatch = notice.title.toLowerCase().contains(query);
        final categoryMatch = _selectedCategory == 'All' || notice.category == _selectedCategory;
        return titleMatch && categoryMatch;
      }).toList();
    });
  }

  // Helper function to calculate relative time
  String _getTimeAgo(DateTime date) {
    final now = DateTime(2025, 9, 3, 14, 30); // Current time as specified
    final difference = now.difference(date);

    if (difference.inSeconds < 5) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Notice Board'),
      backgroundColor: Colors.grey.shade100,
      body: Column(
        children: [
          _buildSearchBarAndFilters(),
          Expanded(
            child: _filteredNotices.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: _filteredNotices.length,
                    itemBuilder: (context, index) {
                      return _buildNoticeCard(_filteredNotices[index]);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBarAndFilters() {
    return Container(
      padding: const EdgeInsets.all(16.0),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Color.fromARGB(9, 0, 0, 0),
            blurRadius: 10,
            offset: Offset(0, 4),
          )
        ]
      ),
      child: Column(
        children: [
          // Search Bar
          TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: 'Search notices...',
              prefixIcon: Icon(Icons.search, color: Colors.grey.shade600),
              filled: true,
              fillColor: Colors.grey.shade100,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Filter Chips
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: ['All', 'Urgent', 'Meeting', 'Camp', 'Info']
                  .map((category) => Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: FilterChip(
                          label: Text(category),
                          selected: _selectedCategory == category,
                          onSelected: (selected) {
                            setState(() {
                              _selectedCategory = category;
                              _filterNotices();
                            });
                          },
                          selectedColor: Colors.teal,
                          checkmarkColor: Colors.white,
                          labelStyle: TextStyle(
                            color: _selectedCategory == category ? Colors.white : Colors.black87,
                            fontWeight: FontWeight.bold,
                          ),
                          backgroundColor: Colors.grey.shade200,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(color: Colors.grey.shade300)
                          ),
                        ),
                      ))
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }

  // Helper widget for the styled category chip
  Widget _buildCategoryChip(String category, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        category,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.bold,
          fontSize: 12,
        ),
      ),
    );
  }

  // ** REFACTORED AND ENHANCED NOTICE CARD **
  Widget _buildNoticeCard(Notice notice) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 16.0),
      elevation: 4,
      shadowColor: Colors.black.withOpacity(0.08),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      clipBehavior: Clip.antiAlias,
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          leading: Container(width: 6, color: notice.categoryColor),
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          title: Text(
            notice.title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildCategoryChip(notice.category, notice.categoryColor),
                Text(
                  _getTimeAgo(notice.date),
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                ),
              ],
            ),
          ),
          trailing: const Icon(
            Icons.keyboard_arrow_down_rounded,
            color: Colors.grey,
          ),
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Divider(color: Colors.grey.shade200),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
              child: Text(
                notice.content,
                style: TextStyle(
                  color: Colors.grey.shade700,
                  fontSize: 14,
                  height: 1.6,
                ),
              ),
            ),
          ],
        ),
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
          Text(
            'No Notices Found',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your search or filter.',
            style: TextStyle(fontSize: 16, color: Colors.grey.shade500),
          ),
        ],
      ),
    );
  }
}

