import 'package:flutter/material.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Notifications',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: const Color(0xFF00897B),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.checklist_rounded),
            onPressed: () {
              // Mark all as read action
            },
            tooltip: 'Mark all as read',
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFF8F9FC),
              Color(0xFFEFF2F7),
            ],
          ),
        ),
        child: Column(
          children: [
            // Filter chips
            Container(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              color: Colors.white,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterChip('All', true),
                    const SizedBox(width: 8),
                    _buildFilterChip('Unread', false),
                    const SizedBox(width: 8),
                    _buildFilterChip('Donations', false),
                    const SizedBox(width: 8),
                    _buildFilterChip('Updates', false),
                    const SizedBox(width: 8),
                    _buildFilterChip('System', false),
                  ],
                ),
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: const [
                  _NotificationItem(
                    title: 'Donation Received',
                    message: 'Your donation of ₹5,000 to Rahul Sharma has been successfully processed.',
                    time: '2 hours ago',
                    icon: Icons.favorite,
                    isUnread: true,
                    type: 'donation',
                  ),
                  SizedBox(height: 12),
                  _NotificationItem(
                    title: 'New Campaign',
                    message: 'A new education support campaign has been launched. Help children in need.',
                    time: '5 hours ago',
                    icon: Icons.campaign,
                    isUnread: true,
                    type: 'update',
                  ),
                  SizedBox(height: 12),
                  _NotificationItem(
                    title: 'Thank You Message',
                    message: 'Rahul Sharma sent you a thank you message for your generous donation.',
                    time: 'Yesterday',
                    icon: Icons.thumb_up,
                    isUnread: false,
                    type: 'donation',
                  ),
                  SizedBox(height: 12),
                  _NotificationItem(
                    title: 'Monthly Report',
                    message: 'Your monthly donation report is ready. View your impact summary.',
                    time: '2 days ago',
                    icon: Icons.bar_chart,
                    isUnread: false,
                    type: 'system',
                  ),
                  SizedBox(height: 12),
                  _NotificationItem(
                    title: 'Payment Reminder',
                    message: 'Your monthly donation subscription will renew in 3 days.',
                    time: '3 days ago',
                    icon: Icons.notifications_active,
                    isUnread: false,
                    type: 'system',
                  ),
                  SizedBox(height: 12),
                  _NotificationItem(
                    title: 'Campaign Goal Reached',
                    message: 'The medical campaign you supported has reached its funding goal!',
                    time: '1 week ago',
                    icon: Icons.celebration,
                    isUnread: false,
                    type: 'update',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isSelected) {
    return FilterChip(
      label: Text(
        label,
        style: TextStyle(
          fontFamily: 'Poppins',
          color: isSelected ? Colors.white : const Color(0xFF00897B),
          fontWeight: FontWeight.w500,
        ),
      ),
      selected: isSelected,
      onSelected: (value) {
        // Handle filter selection
      },
      backgroundColor: Colors.white,
      selectedColor: const Color(0xFF00897B),
      checkmarkColor: Colors.white,
      side: BorderSide(
        color: isSelected ? const Color(0xFF00897B) : Colors.grey.shade300,
        width: 1,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
    );
  }
}

class _NotificationItem extends StatelessWidget {
  final String title;
  final String message;
  final String time;
  final IconData icon;
  final bool isUnread;
  final String type;

  const _NotificationItem({
    required this.title,
    required this.message,
    required this.time,
    required this.icon,
    required this.isUnread,
    required this.type,
  });

  Color _getIconColor() {
    switch (type) {
      case 'donation':
        return const Color(0xFF4CAF50);
      case 'update':
        return const Color(0xFF2196F3);
      case 'system':
        return const Color(0xFFFF9800);
      default:
        return const Color(0xFF00897B);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      borderRadius: BorderRadius.circular(16),
      color: Colors.white,
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.1),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        leading: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: _getIconColor().withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: _getIconColor(),
            size: 24,
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontWeight: isUnread ? FontWeight.w600 : FontWeight.w500,
                  color: Colors.grey.shade800,
                  fontSize: 15,
                ),
              ),
            ),
            if (isUnread)
              Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(
                  color: Color(0xFF00897B),
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text(
              message,
              style: TextStyle(
                fontFamily: 'Poppins',
                color: Colors.grey.shade600,
                fontSize: 13,
                height: 1.4,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Text(
              time,
              style: TextStyle(
                fontFamily: 'Poppins',
                color: Colors.grey.shade500,
                fontSize: 11,
              ),
            ),
          ],
        ),
        onTap: () {
          // Handle notification tap
        },
      ),
    );
  }
}