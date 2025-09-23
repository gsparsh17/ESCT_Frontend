import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:testing/models/reciever_model.dart';
import 'package:testing/repositories/donation_repository.dart';
import 'donation_event.dart';
import 'donation_state.dart';

class DonationBloc extends Bloc<DonationEvent, DonationState> {
  final DonationRepository donationRepository;

  DonationBloc({required this.donationRepository}) : super(DonationInitial()) {
    on<FetchDonations>(_onFetchDonations);
  }

  // ## MODIFIED ##: This method now calls the real API and categorizes the results.
  Future<void> _onFetchDonations(
    FetchDonations event,
    Emitter<DonationState> emit,
  ) async {
    emit(DonationLoading());
    try {
      // Fetch all claims from the repository.
      final allClaims = await donationRepository.fetchAllClaims();
      
      // Categorize the claims based on their status.
      // You can adjust this logic based on the actual statuses in your system.
      final List<ReceiverData> currentDonations = allClaims
          .where((claim) => claim.status == 'Active' || claim.status == 'Approved')
          .toList();
          
      final List<ReceiverData> ongoingDonations = allClaims
          .where((claim) => claim.status == 'In Progress')
          .toList();
          
      final List<ReceiverData> upcomingDonations = allClaims
          .where((claim) => claim.status == 'Pending Verification')
          .toList();

      // Emit the loaded state with the categorized data.
      emit(DonationLoaded(
        currentDonations: currentDonations,
        ongoingDonations: ongoingDonations,
        upcomingDonations: upcomingDonations,
      ));
    } catch (e) {
      // Emit an error state if anything goes wrong.
      emit(DonationError(e.toString()));
    }
  }
}

