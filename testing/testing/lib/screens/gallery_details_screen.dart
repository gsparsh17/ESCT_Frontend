import 'package:flutter/material.dart';
import 'tabs/gallery_screen.dart'; // Import the model from the gallery screen

class GalleryDetailScreen extends StatelessWidget {
  final GalleryItem item;

  const GalleryDetailScreen({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          // ** REVAMPED SLIVER APP BAR **
          SliverAppBar(
            expandedHeight: 250.0,
            backgroundColor: Colors.teal,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                item.headline,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 16.0,
                  shadows: [Shadow(blurRadius: 8.0, color: Colors.black45)],
                ),
              ),
              background: Hero(
                tag: item.imageUrl, // Must be the same unique tag as in the list
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      item.imageUrl,
                      fit: BoxFit.cover,
                    ),
                    // Gradient overlay for title readability
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.6),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          // Content body
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.headline,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.calendar_today_outlined, size: 16, color: Colors.grey.shade600),
                      const SizedBox(width: 8),
                      Text(
                        '${item.date.day}/${item.date.month}/${item.date.year}',
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                      ),
                      const SizedBox(width: 16),
                      Icon(Icons.source_outlined, size: 16, color: Colors.grey.shade600),
                      const SizedBox(width: 8),
                      Text(
                        item.source,
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                      ),
                    ],
                  ),
                  const Divider(height: 32),
                  Text(
                    item.content,
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey.shade800,
                      height: 1.7, // Improves readability
                    ),
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}

