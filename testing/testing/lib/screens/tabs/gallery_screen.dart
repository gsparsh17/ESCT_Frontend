import 'package:flutter/material.dart';
import 'package:testing/screens/gallery_details_screen.dart';
import '../../widgets/custom_app_bar.dart';

// 1. Data Model for a Gallery Item
class GalleryItem {
  final String imageUrl;
  final String headline;
  final String content;
  final DateTime date;
  final String source;

  GalleryItem({
    required this.imageUrl,
    required this.headline,
    required this.content,
    required this.date,
    required this.source,
  });
}

class GalleryScreen extends StatelessWidget {
   GalleryScreen({super.key});

  // Helper function to calculate relative time
  String _getTimeAgo(DateTime date) {
    final now = DateTime(2025, 9, 3, 15, 3); // Current time for consistent display
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return '${date.day}/${date.month}/${date.year}';
    } else if (difference.inDays >= 1) {
      return '${difference.inDays}d ago';
    } else if (difference.inHours >= 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inMinutes >= 1) {
      return '${difference.inMinutes}m ago';
    } else {
      return 'Just now';
    }
  }

  // 2. Dummy Data for the Gallery (with DateTime objects)
  final List<GalleryItem> _galleryItems =  [
    GalleryItem(
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      headline: 'New Cardiology Wing Inaugurated at District Hospital',
      date: DateTime(2025, 8, 28),
      source: 'Hospital Press Release',
      content: 'The new state-of-the-art cardiology wing was inaugurated today by the Chief Medical Officer. Equipped with the latest diagnostic and surgical technology, this wing aims to provide advanced cardiac care to patients across the region. The CMO praised the efforts of the doctors and staff in making this project a reality.',
    ),
    GalleryItem(
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      headline: 'Successful Community Health Drive Conducted in Rural Areas',
      date: DateTime(2025, 8, 15),
      source: 'Community Outreach Dept.',
      content: 'Our team of dedicated government doctors conducted a massive health drive across five remote villages, providing free check-ups, medicines, and health awareness sessions to over 2,000 residents. This initiative was aimed at bringing primary healthcare to the doorsteps of those in need.',
    ),
    GalleryItem(
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      headline: 'Doctors Attend National Conference on Advances in Neurology',
      date: DateTime(2025, 7, 30),
      source: 'Medical Education Unit',
      content: 'A delegation of our senior neurologists attended the National Neurology Conference in New Delhi. They presented papers on recent advancements in stroke management and epilepsy treatment, bringing recognition to our institution\'s commitment to academic excellence and patient care.',
    ),
    GalleryItem(
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
      headline: 'Pediatric Ward Receives Child-Friendly Renovation',
      date: DateTime(2025, 7, 12),
      source: 'Hospital Administration',
      content: 'The pediatric ward has been completely renovated with a child-friendly theme to create a more welcoming and less intimidating environment for our young patients. The colorful walls, play areas, and engaging decor are designed to aid in the healing process by reducing anxiety and stress.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'News & Gallery'),
      backgroundColor: Colors.white,
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: _galleryItems.length,
        itemBuilder: (context, index) {
          return _buildGalleryCard(context, _galleryItems[index]);
        },
      ),
    );
  }

  // ** REVAMPED GALLERY CARD UI **
  Widget _buildGalleryCard(BuildContext context, GalleryItem item) {
    return Card(
      margin: const EdgeInsets.only(bottom: 24.0),
      elevation: 8,
      shadowColor: Colors.black.withOpacity(0.15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => GalleryDetailScreen(item: item),
            ),
          );
        },
        child: Stack(
          alignment: Alignment.bottomLeft,
          children: [
            // Hero widget for the seamless image transition
            Hero(
              tag: item.imageUrl, // A unique tag for each image
              child: Ink.image(
                image: NetworkImage(item.imageUrl),
                height: 220,
                fit: BoxFit.cover,
              ),
            ),
            // Gradient overlay for text readability
            Container(
              height: 220,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.2),
                    Colors.black.withOpacity(0.8),
                  ],
                ),
              ),
            ),
            // Text content
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.headline,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        shadows: [
                          Shadow(blurRadius: 10.0, color: Colors.black54)
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Text(
                          item.source,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const Spacer(),
                        Text(
                          _getTimeAgo(item.date),
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 13,
                          ),
                        ),
                      ],
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
}

