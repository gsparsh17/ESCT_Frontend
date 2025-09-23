import 'package:flutter/material.dart';
import 'package:testing/models/reciever_model.dart'; // Make sure this import is correct

class ReceiverDetailScreen extends StatelessWidget {
  final ReceiverData receiver;
  const ReceiverDetailScreen({super.key, required this.receiver});

  @override
  Widget build(BuildContext context) {
    final double progress = receiver.amountRequested > 0
        ? receiver.amountRaised / receiver.amountRequested
        : 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          receiver.receiverName,
          style: const TextStyle(
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
            fontSize: 22, // [FONT] Slightly smaller app bar title
          ),
        ),
        backgroundColor: const Color(0xFF00897B),
        foregroundColor: Colors.white,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
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
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(top: 20.0), // [UI] Reduced top padding
                  child: Hero(
                    tag: receiver.id,
                    child: Container(
                      width: 200, // [UI] Reduced image size
                      height: 200, // [UI] Reduced image size
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16.0),
                        border: Border.all(
                          color: const Color(0xFF00897B).withOpacity(0.2),
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2), // Softer shadow
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(14.0),
                        child: Image.network(
                          receiver.imageUrl,
                          height: 200, // [UI] Reduced image size
                          width: 200, // [UI] Reduced image size
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => Container(
                            color: const Color(0xFFE0F2F1),
                            child: const Icon(
                              Icons.person,
                              size: 60, // [UI] Reduced icon size
                              color: Color(0xFF00897B),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0), // [UI] Reduced main padding
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Main heading
                    Text(
                      receiver.title,
                      style: const TextStyle(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w600,
                        fontSize: 20, // [FONT] Decreased from 24
                        color: Color(0xFF004D40),
                      ),
                    ),
                    const SizedBox(height: 4), // [UI] Tighter spacing

                    // Sub-heading
                    Text(
                      'Raised by ${receiver.receiverName}',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 14, // [FONT] Decreased from 16
                        color: Colors.grey.shade700,
                      ),
                    ),
                    const SizedBox(height: 16), // [UI] Reduced spacing

                    // Donation progress section
                    Container(
                      padding: const EdgeInsets.all(12), // [UI] Reduced padding
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12), // [UI] Smaller radius
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Raised: ₹${receiver.amountRaised}',
                                style: const TextStyle(
                                  fontFamily: 'Poppins',
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF00796B),
                                  fontSize: 15, // [FONT] Decreased from 16
                                ),
                              ),
                              Text(
                                'Goal: ₹${receiver.amountRequested}',
                                style: TextStyle(
                                  fontFamily: 'Poppins',
                                  color: Colors.grey.shade700,
                                  fontSize: 13, // [FONT] Decreased from 14
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10), // [UI] Reduced spacing
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: LinearProgressIndicator(
                              value: progress,
                              minHeight: 10, // [UI] Slimmer progress bar
                              backgroundColor: Colors.teal.shade100,
                              valueColor:
                                  const AlwaysStoppedAnimation<Color>(
                                      Color(0xFF00897B)),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Align(
                            alignment: Alignment.centerRight,
                            child: Text(
                              '${(progress * 100).toStringAsFixed(0)}% funded',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                color: Colors.grey.shade600,
                                fontSize: 12, // Kept at 12, which is good
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20), // [UI] Reduced spacing

                    // Claim description section
                    Text(
                      "ABOUT THIS CLAIM",
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12, // [FONT] Decreased from 14
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.0, // [UI] Tighter letter spacing
                      ),
                    ),
                    const SizedBox(height: 8), // [UI] Reduced spacing
                    Container(
                      padding: const EdgeInsets.all(12), // [UI] Reduced padding
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Text(
                        receiver.description,
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 14, // [FONT] Decreased from 15
                          height: 1.5,
                          color: Color(0xFF424242),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20), // [UI] Reduced spacing

                    // Details Section
                    Text(
                      "BENEFICIARY DETAILS",
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontSize: 12, // [FONT] Decreased from 14
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.0, // [UI] Tighter letter spacing
                      ),
                    ),
                    const SizedBox(height: 8), // [UI] Reduced spacing
                    Container(
                      padding: const EdgeInsets.all(12), // [UI] Reduced padding
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.1),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          _buildDetailRow(context, Icons.person_outline, "Beneficiary", receiver.nomineeName),
                          _buildDetailRow(context, Icons.credit_card, "Account No.", receiver.accountDetails),
                          _buildDetailRow(context, Icons.code, "IFSC Code", receiver.ifscCode),
                        ],
                      ),
                    ),
                    const SizedBox(height: 44), // [UI] Reduced spacing before button

                    // Donate Button
                    Center(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.favorite_outline, size: 20),
                        label: const Text(
                          "Donate Now",
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text(
                                "Donation feature coming soon!",
                                style: TextStyle(fontFamily: 'Poppins'),
                              ),
                              backgroundColor: const Color(0xFF00897B),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00897B),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 32, vertical: 12), // [UI] Reduced padding
                          textStyle: const TextStyle(fontSize: 16), // [FONT] Decreased from 18
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                          elevation: 4,
                          shadowColor: Colors.teal.withOpacity(0.4),
                        ),
                      ),
                    ),
                      const SizedBox(height: 200), // [UI] Reduced spacing before button
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(
      BuildContext context, IconData icon, String label, String value) {
    if (value.isEmpty || value == "N/A") return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0), // [UI] Tighter padding
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF00897B), size: 20), // [UI] Smaller icon
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    color: Colors.grey.shade700,
                    fontSize: 12, // Kept at 12
                  ),
                ),
                const SizedBox(height: 2), // [UI] Tighter spacing
                Text(
                  value,
                  style: const TextStyle(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w500,
                    fontSize: 14, // [FONT] Decreased from 16
                    color: Color(0xFF004D40),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}