import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:testing/blocs/donation/donation_bloc.dart'; // Import DonationBloc
import 'package:testing/blocs/donation/donation_event.dart'; // Import DonationEvent
import 'package:testing/repositories/donation_repository.dart';
import 'blocs/auth/auth_bloc.dart';
import 'blocs/auth/auth_event.dart';
import 'repositories/auth_repository.dart';
import 'screens/main_wrapper.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Using MultiRepositoryProvider to provide multiple repositories
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthRepository>(
          create: (context) => AuthRepository(),
        ),
        RepositoryProvider<DonationRepository>(
          create: (context) => DonationRepository(
            authRepository: RepositoryProvider.of<AuthRepository>(context),
          ),
        ),
      ],
      // ## MODIFIED ##: Use MultiBlocProvider to provide BLoCs to the whole app.
      child: MultiBlocProvider(
        providers: [
          BlocProvider<AuthBloc>(
            create: (context) => AuthBloc(
              authRepository: RepositoryProvider.of<AuthRepository>(context),
            )..add(AppStarted()),
          ),
          // ## NEW ##: Provide the DonationBloc here.
          // It will now be accessible from any screen in your app.
          BlocProvider<DonationBloc>(
            create: (context) => DonationBloc(
              donationRepository: RepositoryProvider.of<DonationRepository>(context),
            )..add(FetchDonations()), // Fetch initial data when the app starts.
          ),
        ],
        child: MaterialApp(
          title: 'ESCT',
          theme: ThemeData(
            primarySwatch: Colors.teal,
            visualDensity: VisualDensity.adaptivePlatformDensity,
          ),
          home: const MainWrapper(),
          debugShowCheckedModeBanner: false,
        ),
      ),
    );
  }
}

