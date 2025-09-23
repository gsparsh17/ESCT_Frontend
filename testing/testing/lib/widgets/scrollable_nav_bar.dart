import 'package:flutter/material.dart';

class ScrollableNavBar extends StatefulWidget {
  final int currentIndex;
  final Function(int) onTap;
  final List<Map<String, dynamic>> tabs;

  const ScrollableNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    required this.tabs,
  });

  @override
  State<ScrollableNavBar> createState() => _ScrollableNavBarState();
}

class _ScrollableNavBarState extends State<ScrollableNavBar> {
  final ScrollController _scrollController = ScrollController();
  
  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
  
  void _scrollToEnd() {
    _scrollController.animateTo(
      _scrollController.position.maxScrollExtent,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (scrollNotification) {
        // Prevent scroll notifications from bubbling up to parent widgets
        return true;
      },
      child: Container(
        height: 75,
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: Row(
          children: [
            // Scroll to end button
            if (widget.tabs.length > 4) // Only show if there are many tabs
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: _scrollToEnd,
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  width: 50,
                  margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Icon(
                    Icons.chevron_right,
                    color: Color(0xFF00897B),
                    size: 20,
                  ),
                ),
              ),
            ),
            
            // Scrollable tabs
            Expanded(
              child: SingleChildScrollView(
                controller: _scrollController,
                scrollDirection: Axis.horizontal,
                physics: const ClampingScrollPhysics(),
                child: Row(
                  children: List.generate(widget.tabs.length, (index) {
                    bool isSelected = widget.currentIndex == index;
                    return Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () => widget.onTap(index),
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF00897B) : Colors.transparent,
                            borderRadius: BorderRadius.circular(20),
                            border: isSelected ? null : Border.all(
                              color: Colors.grey.shade300,
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                widget.tabs[index]['icon'],
                                size: 20,
                                color: isSelected ? Colors.white : Colors.grey.shade600,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                widget.tabs[index]['title'],
                                style: TextStyle(
                                  fontFamily: 'Poppins',
                                  fontSize: 13,
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                                  color: isSelected ? Colors.white : Colors.grey.shade700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}