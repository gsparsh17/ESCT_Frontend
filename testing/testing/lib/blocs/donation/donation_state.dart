import 'package:equatable/equatable.dart';
import 'package:testing/models/reciever_model.dart';

// The base class for all our donation states.
abstract class DonationState extends Equatable {
  const DonationState();

  @override
  List<Object> get props => [];
}

// Initial state, before any data is fetched.
class DonationInitial extends DonationState {}

// State while the data is being fetched from the API.
class DonationLoading extends DonationState {}

// State when the data has been successfully fetched.
class DonationLoaded extends DonationState {
  final List<ReceiverData> currentDonations;
  final List<ReceiverData> ongoingDonations;
  final List<ReceiverData> upcomingDonations;

  const DonationLoaded({
    required this.currentDonations,
    required this.ongoingDonations,
    required this.upcomingDonations,
  });

  @override
  List<Object> get props => [currentDonations, ongoingDonations, upcomingDonations];
}

// State when an error occurs during data fetching.
class DonationError extends DonationState {
  final String message;

  const DonationError(this.message);

  @override
  List<Object> get props => [message];
}
