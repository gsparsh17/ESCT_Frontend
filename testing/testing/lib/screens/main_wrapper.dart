import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_state.dart';
import '../blocs/navigation/navigation_bloc.dart';
import '../blocs/navigation/navigation_event.dart';
import '../blocs/navigation/navigation_state.dart';
import '../widgets/scrollable_nav_bar.dart';

// Import all your tab screens
import 'tabs/home_screen.dart';
import 'tabs/about_us_screen.dart';
import 'tabs/notice_screen.dart';
import 'tabs/doctors_list_screen.dart';
import 'tabs/donation_list_screen.dart';
import 'tabs/rules_screen.dart';
import 'tabs/blog_screen.dart';
import 'tabs/gallery_screen.dart';
import 'tabs/contact_screen.dart';
import 'tabs/rate_us_screen.dart';
import 'auth/profile_screen.dart';
import 'auth/login_screen.dart';

class MainWrapper extends StatelessWidget {
  const MainWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => NavigationBloc(),
      child: const MainScreenView(),
    );
  }
}

class MainScreenView extends StatefulWidget {
  const MainScreenView({super.key});

  @override
  State<MainScreenView> createState() => _MainScreenViewState();
}

class _MainScreenViewState extends State<MainScreenView> {
  late final PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, authState) {
        // After a successful login...
        if (authState is AuthAuthenticated) {
          // ...automatically switch the view to the Home Screen (the first tab).
          context.read<NavigationBloc>().add(const TabChanged(tabIndex: 0));
        }
      },
      child: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, authState) {
          final List<Map<String, dynamic>> tabs = _getTabs(authState);
          final List<Widget> screens = _getScreens(authState);

          return BlocConsumer<NavigationBloc, NavigationState>(
            listener: (context, navState) {
              if (_pageController.hasClients && _pageController.page?.round() != navState.tabIndex) {
                // Animate to the new page when the navigation state changes
                _pageController.jumpToPage(navState.tabIndex);
              }
            },
            builder: (context, navState) {
              return Scaffold(
                body: PageView(
                  physics: const NeverScrollableScrollPhysics(), // Disable swipe navigation
                  controller: _pageController,
                  // Re-enable swiping as the navigation is now self-contained
                  onPageChanged: (index) {
                     context.read<NavigationBloc>().add(TabChanged(tabIndex: index));
                  },
                  children: screens,
                ),
                bottomNavigationBar: ScrollableNavBar(
                  currentIndex: navState.tabIndex,
                  tabs: tabs,
                  // --- MODIFIED: Simplified onTap logic ---
                  // Now it just tells the NavigationBloc to change the tab.
                  onTap: (index) {
                    context.read<NavigationBloc>().add(TabChanged(tabIndex: index));
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }

  List<Map<String, dynamic>> _getTabs(AuthState authState) {
    List<Map<String, dynamic>> allTabs = [
      {'title': 'Home', 'icon': Icons.home},
      {'title': 'About Us', 'icon': Icons.info},
      {'title': 'Notice', 'icon': Icons.notifications},
      {'title': 'Claim', 'icon': Icons.add},
      {'title': 'Donations', 'icon': Icons.volunteer_activism},
      {'title': 'Rules', 'icon': Icons.rule},
      {'title': 'Blog', 'icon': Icons.article},
      {'title': 'Gallery', 'icon': Icons.photo_library},
      {'title': 'Contact', 'icon': Icons.contact_mail},
      {'title': 'Rate Us', 'icon': Icons.star_rate},
    ];

    if (authState is AuthAuthenticated) {
      allTabs.add({'title': 'Profile', 'icon': Icons.person});
    } else {
      allTabs.add({'title': 'Login', 'icon': Icons.login});
    }
    return allTabs;
  }

  List<Widget> _getScreens(AuthState authState) {
    List<Widget> allScreens = [
       HomeScreen(),
      const AboutUsScreen(),
      const NoticeScreen(),
      const DoctorsListScreen(),
      const DonationListScreen(),
      const RulesScreen(),
      const BlogScreen(),
      GalleryScreen(),
      const ContactScreen(),
      const RateUsScreen(),
    ];

    if (authState is AuthAuthenticated) {
      allScreens.add(const ProfileScreen());
    } else {
      // --- MODIFIED: LoginScreen is now part of the PageView ---
      // It's no longer a placeholder.
      allScreens.add(const LoginScreen()); 
    }
    return allScreens;
  }
}

