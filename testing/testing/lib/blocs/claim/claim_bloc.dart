import 'package:equatable/equatable.dart';
import 'package:file_picker/file_picker.dart'; // ## NEW: Import file_picker
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:testing/repositories/donation_repository.dart';

// --- BLoC Events ---
abstract class ClaimEvent extends Equatable {
  const ClaimEvent();
  @override
  List<Object> get props => [];
}

// ## MODIFIED ##: Event now takes a list of PlatformFile objects.
class SubmitClaim extends ClaimEvent {
  final String type;
  final String title;
  final String description;
  final String beneficiaryEhrms;
  final List<PlatformFile> supportingDocuments; // Changed from Map to PlatformFile

  const SubmitClaim({
    required this.type,
    required this.title,
    required this.description,
    required this.beneficiaryEhrms,
    required this.supportingDocuments,
  });

  @override
  List<Object> get props =>
      [type, title, description, beneficiaryEhrms, supportingDocuments];
}

// --- BLoC States ---
abstract class ClaimState extends Equatable {
  const ClaimState();
  @override
  List<Object> get props => [];
}

class ClaimInitial extends ClaimState {}
class ClaimSubmissionInProgress extends ClaimState {}

class ClaimSubmissionSuccess extends ClaimState {
  final String message;
  const ClaimSubmissionSuccess(this.message);
  @override
  List<Object> get props => [message];
}

class ClaimSubmissionFailure extends ClaimState {
  final String error;
  const ClaimSubmissionFailure(this.error);
  @override
  List<Object> get props => [error];
}

// --- BLoC Logic ---
class ClaimBloc extends Bloc<ClaimEvent, ClaimState> {
  final DonationRepository _donationRepository;

  ClaimBloc({required DonationRepository donationRepository})
      : _donationRepository = donationRepository,
        super(ClaimInitial()) {
    on<SubmitClaim>(_onSubmitClaim);
  }

  // ## MODIFIED ##: Handler now receives the event with PlatformFile list.
  Future<void> _onSubmitClaim(
    SubmitClaim event,
    Emitter<ClaimState> emit,
  ) async {
    emit(ClaimSubmissionInProgress());
    try {
      final message = await _donationRepository.createClaim(
        type: event.type,
        title: event.title,
        description: event.description,
        beneficiaryEhrms: event.beneficiaryEhrms,
        // Pass the files to the repository for handling
        files: event.supportingDocuments,
      );
      emit(ClaimSubmissionSuccess(message));
    } catch (e) {
      emit(ClaimSubmissionFailure(e.toString()));
    }
  }
}

