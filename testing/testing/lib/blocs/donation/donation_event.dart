import 'package:equatable/equatable.dart';

// Using Equatable for value comparison of objects.
abstract class DonationEvent extends Equatable {
  const DonationEvent();

  @override
  List<Object> get props => [];
}

// The single event our UI will dispatch to fetch all donation data.
class FetchDonations extends DonationEvent {}
