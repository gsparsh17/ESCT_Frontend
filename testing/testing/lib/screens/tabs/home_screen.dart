import 'dart:async';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:testing/blocs/auth/auth_bloc.dart';
import 'package:testing/blocs/auth/auth_state.dart';
import 'package:testing/blocs/donation/donation_bloc.dart';
import 'package:testing/blocs/donation/donation_state.dart';
import 'package:testing/models/reciever_model.dart';
import 'package:testing/screens/claim/claim_screen.dart';
import 'package:testing/screens/notification/notification_screen.dart';
import 'package:testing/screens/reciever/category_detail_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 220.0,
            backgroundColor: Colors.transparent,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              background: _buildTransitioningAppBar(),
              collapseMode: CollapseMode.pin,
            ),
          ),
          SliverList(
            delegate: SliverChildListDelegate([
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionTitle("Current Donations"),
                    const SizedBox(height: 12),
                    BlocBuilder<DonationBloc, DonationState>(
                      builder: (context, state) {
                        if (state is DonationLoading ||
                            state is DonationInitial) {
                          return const _LoadingIndicator();
                        }
                        if (state is DonationLoaded) {
                          return _buildGroupedDonationsSlider(
                            state.currentDonations,
                          );
                        }
                        if (state is DonationError) {
                          return _ErrorDisplay(message: state.message);
                        }
                        return const SizedBox.shrink();
                      },
                    ),
                    const SizedBox(height: 28),
                    _buildSectionTitle("Ongoing Donations"),
                    const SizedBox(height: 12),
                    BlocBuilder<DonationBloc, DonationState>(
                      builder: (context, state) {
                        if (state is DonationLoading ||
                            state is DonationInitial) {
                          return const _LoadingIndicator();
                        }
                        if (state is DonationLoaded) {
                          return _buildGroupedDonationsSlider(
                            state.ongoingDonations,
                            isLessDetailed: true,
                          );
                        }
                        if (state is DonationError) {
                          return _ErrorDisplay(message: state.message);
                        }
                        return const SizedBox.shrink();
                      },
                    ),
                    const SizedBox(height: 28),
                    _buildSectionTitle("Upcoming Donations"),
                    const SizedBox(height: 12),
                    BlocBuilder<DonationBloc, DonationState>(
                      builder: (context, state) {
                        if (state is DonationLoading ||
                            state is DonationInitial) {
                          return const _LoadingIndicator();
                        }
                        if (state is DonationLoaded) {
                          return _buildGroupedDonationsSlider(
                            state.upcomingDonations,
                            isLessDetailed: true,
                          );
                        }
                        if (state is DonationError) {
                          return _ErrorDisplay(message: state.message);
                        }
                        return const SizedBox.shrink();
                      },
                    ),
                    const SizedBox(height: 28),
                    _buildTotalDonationSection(),
                    const SizedBox(height: 28),
                    _buildSectionTitle("Gallery"),
                    const SizedBox(height: 12),
                    _buildImageSlider(),
                    const SizedBox(height: 28),
                    _buildSectionTitle("News Coverage"),
                    const SizedBox(height: 12),
                    _buildImageSlider(),
                    const SizedBox(height: 28),
                    _buildSectionTitle("Testimonials"),
                    const SizedBox(height: 12),
                    _buildTestimonialSlider(),
                    const SizedBox(height: 28),
                    _buildSanctionedAmountSection("Current Month"),
                    const SizedBox(height: 20),
                    _buildSanctionedAmountSection("Previous Month"),
                    const SizedBox(height: 28),
                    _buildContributionSummaryCard(),
                    const SizedBox(height: 28),
                    _buildSectionTitle("Apply for Assistance"),
                    const SizedBox(height: 12),
                    _buildApplicationCategoryList(),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ]),
          ),
        ],
      ),
    );
  }

  Widget _buildGroupedDonationsSlider(
    List<ReceiverData> donations, {
    bool isLessDetailed = false,
  }) {
    if (donations.isEmpty) {
      return Container(
        height: 150,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            colors: [Colors.teal.shade50, Colors.white],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Text(
          "No donations in this category.",
          style: TextStyle(color: Colors.teal.shade700, fontSize: 14),
        ),
      );
    }

    final Map<String, List<ReceiverData>> groupedData = {};
    for (var donation in donations) {
      (groupedData[donation.category] ??= []).add(donation);
    }

    final double cardHeight = isLessDetailed ? 220 : 210;

    return SizedBox(
      height: cardHeight,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: groupedData.keys.length,
        itemBuilder: (context, index) {
          final category = groupedData.keys.elementAt(index);
          final receivers = groupedData[category]!;
          return _CategoryAutoScrollCard(
            category: category,
            receivers: receivers,
            isLessDetailed: isLessDetailed,
          );
        },
      ),
    );
  }

  Widget _buildTransitioningAppBar() {
    const double expandedHeight = 180.0;
    const double collapsedHeight = kToolbarHeight;

    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        final double currentHeight = constraints.maxHeight;
        final double topPadding = MediaQuery.of(context).padding.top;

        final double t = ((currentHeight - (collapsedHeight + topPadding)) /
                (expandedHeight - (collapsedHeight + topPadding)))
            .clamp(0.0, 1.0);

        final double initialIconTop = expandedHeight - 48.0;
        final double finalIconTop = topPadding + (collapsedHeight / 2) - 15;
        final double iconTop = lerpDouble(finalIconTop, initialIconTop, t)!;

        final double contentOpacity = t;

        return Stack(
          fit: StackFit.expand,
          children: [
            Opacity(
              opacity: contentOpacity,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      const Color(0xFF006A6E), // Dark teal
                      const Color(0xFF00897B), // Medium teal
                      const Color(0xFF4DB6AC), // Light teal
                    ],
                    stops: const [0.0, 0.5, 1.0],
                  ),
                ),
              ),
            ),
            Positioned.fill(
              child: SafeArea(
                child: Opacity(
                  opacity: contentOpacity,
                  child: _buildAppBarFadingContent(),
                ),
              ),
            ),
            Positioned(
              top: iconTop,
              right: 16.0,
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF008080).withOpacity(1.0 - t),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 6,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: IconButton(
                  icon: const Icon(
                    Icons.notifications,
                    color: Colors.white,
                    size: 30,
                  ),
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(
                      builder: (context) => const NotificationScreen(),
                    ));
                  },
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildAppBarFadingContent() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Top row with logos
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildLogoCircle('ESCT LOGO'),
              _buildLogoCircle('Jeevandhan\nFoundation\nLOGO'),
            ],
          ),

          // Middle section with user info
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // User photo on the left
                Container(
                  width: 70,
                  height: 70,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const CircleAvatar(
                    radius: 30,
                    backgroundImage: NetworkImage(
                      "https://i.pravatar.cc/150?u=a042581f4e29026704d",
                    ),
                  ),
                ),

                // const SizedBox(width: 16),

                // User name and welcome text
                // User name and welcome text
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(0.0, 0, 50.0, 0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.start, // Change this
                      crossAxisAlignment: CrossAxisAlignment.center, // Add this
                      children: [
                        const Text(
                          "Welcome",
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 18,
                            fontFamily: 'Poppins',
                            fontWeight: FontWeight.w300,
                          ),
                        ),
                        const SizedBox(height: 4),
                        // BlocBuilder to get user name
                        BlocBuilder<AuthBloc, AuthState>(
                          builder: (context, state) {
                            final String displayName =
                                (state is AuthAuthenticated)
                                    ? state.user.personalDetails.fullName
                                    : "User Name";
                    
                            return Text(
                              displayName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 26,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Poppins',
                                shadows: [
                                  Shadow(
                                    blurRadius: 4,
                                    color: Colors.black26,
                                    offset: Offset(1, 1),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoCircle(String text) {
    return Container(
      width: 70,
      height: 70,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withOpacity(0.9),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(4.0),
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Color(0xFF006666),
              fontSize: 10,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Color(0xFF004D40),
          fontFamily: 'Poppins',
        ),
      ),
    );
  }

  Widget _buildTotalDonationSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF00897B), Color(0xFF00695C)],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.teal.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children:
                [
                  '2',
                  '4',
                  '5',
                  '7',
                  '8',
                  '9',
                  '5',
                  '0',
                ].map((digit) => _buildDigitBox(digit)).toList(),
          ),
          const SizedBox(height: 16),
          const Center(
            child: Text(
              "Total Donation on ESCT Till Date",
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
                fontFamily: 'Poppins',
              ),
            ),
          ),
          const Divider(color: Colors.white24, height: 32),
          _buildDonationStatRow("Death After Service", "₹65,42,300"),
          _buildDonationStatRow("Retirement", "₹87,35,650"),
          _buildDonationStatRow("Death During Service", "₹45,20,100"),
          _buildDonationStatRow("Other Help", "₹47,80,900"),
        ],
      ),
    );
  }

  Widget _buildDigitBox(String digit) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        digit,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 20,
          fontWeight: FontWeight.bold,
          fontFamily: 'Poppins',
        ),
      ),
    );
  }

  Widget _buildDonationStatRow(String category, String amount) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            category,
            style: const TextStyle(
              color: Colors.white70,
              fontFamily: 'Poppins',
            ),
          ),
          Text(
            amount,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageSlider() {
    return SizedBox(
      height: 160,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: 5,
        itemBuilder: (context, index) {
          return Container(
            width: 220,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Stack(
                children: [
                  Image.network(
                    "https://picsum.photos/220/160?random=${index + 30}",
                    fit: BoxFit.cover,
                    width: double.infinity,
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          Colors.black.withOpacity(0.6),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                  const Positioned(
                    bottom: 12,
                    left: 12,
                    child: Text(
                      "Community Support",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Poppins',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTestimonialSlider() {
    return SizedBox(
      height: 200,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: 5,
        itemBuilder: (context, index) {
          return Container(
            width: 300,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.teal.shade50, Colors.white],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.15),
                  blurRadius: 12,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: const Color(0xFF00897B),
                            width: 2,
                          ),
                        ),
                        child: ClipOval(
                          child: Image.network(
                            'https://i.pravatar.cc/150?img=${index + 20}',
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Rahul Sharma",
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            Text(
                              "Beneficiary",
                              style: TextStyle(
                                color: Colors.teal,
                                fontSize: 12,
                                fontFamily: 'Poppins',
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.format_quote,
                        color: Colors.teal.shade300,
                        size: 30,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    "The support from Jeevandhan helped my daughter complete her education. We are forever grateful.",
                    style: TextStyle(
                      fontStyle: FontStyle.italic,
                      height: 1.5,
                      color: Colors.grey.shade700,
                      fontFamily: 'Poppins',
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSanctionedAmountSection(String month) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal.shade50, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Category Wise Sanctioned Amount ($month)",
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF00695C),
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 16),
          _buildSanctionedRow("Death After Service", "₹12,50,000", 0.7),
          _buildSanctionedRow("Retirement", "₹8,75,000", 0.5),
          _buildSanctionedRow("Death During Service", "₹5,20,000", 0.3),
        ],
      ),
    );
  }

  Widget _buildSanctionedRow(String category, String amount, double progress) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text(
              category,
              style: const TextStyle(fontFamily: 'Poppins'),
            ),
          ),
          Expanded(
            flex: 4,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.teal.shade400),
                minHeight: 10,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              amount,
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: Color(0xFF00695C),
                fontFamily: 'Poppins',
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContributionSummaryCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal.shade50, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Your Contribution & Eligibility",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF00695C),
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 16),
          _buildSummaryRow("Your Contribution Till Date:", "₹1,25,000"),
          const SizedBox(height: 12),
          _buildSummaryRow("Your Eligibility Amount for Help:", "₹2,50,000"),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String title, String amount) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFF004D40),
              fontFamily: 'Poppins',
            ),
          ),
          Text(
            amount,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: Color(0xFF00695C),
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildApplicationCategoryList() {
    return Column(
      children: [
        _buildApplicationCategoryItem(
          icon: Icons.family_restroom,
          title: "Death After Service",
          eligibilityText: "You are eligible for this category.",
        ),
        const SizedBox(height: 16),
        _buildApplicationCategoryItem(
          icon: Icons.work,
          title: "Death During Service",
          eligibilityText: "You are eligible for this category.",
        ),
        const SizedBox(height: 16),
        _buildApplicationCategoryItem(
          icon: Icons.medical_services,
          title: "Medical Claim",
          eligibilityText: "You are eligible for this category.",
        ),
        const SizedBox(height: 16),
        _buildApplicationCategoryItem(
          icon: Icons.celebration,
          title: "Kanyadan Claim",
          eligibilityText:
              "Not active yet, more contributors required. Coming soon.",
          isEligible: false,
        ),
        const SizedBox(height: 16),
        _buildApplicationCategoryItem(
          icon: Icons.airport_shuttle,
          title: "Farewell",
          eligibilityText:
              "Not active yet, more contributors required. Coming soon.",
          isEligible: false,
        ),
      ],
    );
  }

  Widget _buildApplicationCategoryItem({
    required IconData icon,
    required String title,
    required String eligibilityText,
    bool isEligible = true,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors:
              isEligible
                  ? [Colors.teal.shade50, Colors.white]
                  : [Colors.grey.shade100, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors:
                    isEligible
                        ? [const Color(0xFF00897B), const Color(0xFF00695C)]
                        : [Colors.grey.shade400, Colors.grey.shade600],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                    color:
                        isEligible
                            ? const Color(0xFF00695C)
                            : Colors.grey.shade700,
                    fontFamily: 'Poppins',
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  eligibilityText,
                  style: TextStyle(
                    fontSize: 12,
                    color:
                        isEligible ? Colors.teal.shade700 : Colors.red.shade700,
                    fontFamily: 'Poppins',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          Builder(
            builder: (context) {
              return ElevatedButton(
                onPressed:
                    isEligible
                        ? () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder:
                                  (context) =>
                                      CreateClaimScreen(claimType: title),
                            ),
                          );
                        }
                        : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      isEligible
                          ? const Color(0xFF00897B)
                          : Colors.grey.shade400,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                ),
                child: const Text(
                  "Apply",
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _LoadingIndicator extends StatelessWidget {
  const _LoadingIndicator();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 210,
      alignment: Alignment.center,
      child: const CircularProgressIndicator(
        color: Color(0xFF00897B),
        strokeWidth: 2,
      ),
    );
  }
}

class _ErrorDisplay extends StatelessWidget {
  final String message;
  const _ErrorDisplay({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 210,
      alignment: Alignment.center,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, color: Colors.teal.shade700, size: 40),
          const SizedBox(height: 12),
          const Text(
            'Failed to load donations',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Please try again later.',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryAutoScrollCard extends StatefulWidget {
  final String category;
  final List<ReceiverData> receivers;
  final bool isLessDetailed;

  const _CategoryAutoScrollCard({
    required this.category,
    required this.receivers,
    this.isLessDetailed = false,
  });

  @override
  State<_CategoryAutoScrollCard> createState() =>
      _CategoryAutoScrollCardState();
}

class _CategoryAutoScrollCardState extends State<_CategoryAutoScrollCard> {
  late final ScrollController _scrollController;
  Timer? _timer;

  static const _scrollDuration = Duration(seconds: 4);
  static const _animationDuration = Duration(milliseconds: 600);
  late final double _itemHeight;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _itemHeight = widget.isLessDetailed ? 150.0 : 120.0;

    if (widget.receivers.length > 1) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _startAutoScroll();
      });
    }
  }

  void _startAutoScroll() {
    _timer = Timer.periodic(_scrollDuration, (timer) {
      if (!_scrollController.hasClients || !mounted) {
        timer.cancel();
        return;
      }
      final maxScroll = _scrollController.position.maxScrollExtent;
      final currentScroll = _scrollController.offset;

      if (currentScroll >= maxScroll - 1.0) {
        _scrollController.jumpTo(0);
      } else {
        _scrollController.animateTo(
          currentScroll + _itemHeight,
          duration: _animationDuration,
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final double cardWidth = widget.isLessDetailed ? 200 : 340;
    final double cardHeight = widget.isLessDetailed ? 220 : 210;

    return Container(
      width: cardWidth,
      height: cardHeight,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal.shade50, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        // boxShadow: [
        //   BoxShadow(
        //     color: Colors.grey.withOpacity(0.2),
        //     spreadRadius: 1,
        //     blurRadius: 8,
        //     offset: const Offset(0, 4),
        //   ),
        // ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
              child: Text(
                widget.category,
                style: TextStyle(
                  color: const Color(0xFF004D40),
                  fontWeight: FontWeight.w600,
                  fontSize: widget.isLessDetailed ? 14 : 16,
                  fontFamily: 'Poppins',
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: ListView.builder(
                controller: _scrollController,
                itemCount: widget.receivers.length,
                itemBuilder: (context, index) {
                  return widget.isLessDetailed
                      ? _SimpleReceiverRow(data: widget.receivers[index])
                      : _ReceiverDetailRow(data: widget.receivers[index]);
                },
              ),
            ),
          ),
          InkWell(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder:
                      (context) => CategoryDetailScreen(
                        category: widget.category,
                        receivers: widget.receivers,
                      ),
                ),
              );
            },
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(16),
              bottomRight: Radius.circular(16),
            ),
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 12.0,
              ),
              decoration: BoxDecoration(
                color: Colors.teal.withOpacity(0.1),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'View All',
                    style: TextStyle(
                      color: Colors.teal.shade800,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    Icons.arrow_forward,
                    color: Colors.teal.shade800,
                    size: 16,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SimpleReceiverRow extends StatelessWidget {
  final ReceiverData data;
  const _SimpleReceiverRow({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 140,
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Center(
                child: Hero(
                  tag: data.imageUrl,
                  child: Image.network(
                    data.imageUrl,
                    width: 150,
                    height: 100,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "For ${data.receiverName}",
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.grey.shade600,
              fontSize: 12,
              fontFamily: 'Poppins',
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _ReceiverDetailRow extends StatelessWidget {
  final ReceiverData data;
  const _ReceiverDetailRow({required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 110,
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Row(
        children: [
          Hero(
            tag: data.imageUrl,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                data.imageUrl,
                height: 100,
                width: 80,
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  data.receiverName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                    fontFamily: 'Poppins',
                  ),
                ),
                const SizedBox(height: 8),
                _buildDetailRow("Nominee:", data.nomineeName),
                const SizedBox(height: 4),
                _buildDetailRow("A/C:", data.accountDetails),
                const SizedBox(height: 4),
                _buildDetailRow("IFSC:", data.ifscCode),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Text.rich(
      TextSpan(
        text: '$label ',
        style: TextStyle(
          color: Colors.grey.shade600,
          fontSize: 12,
          fontFamily: 'Poppins',
        ),
        children: [
          TextSpan(
            text: value,
            style: const TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.w500,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
      maxLines: 1,
      overflow: TextOverflow.ellipsis,
    );
  }
}
