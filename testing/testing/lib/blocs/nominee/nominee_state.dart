import 'package:equatable/equatable.dart';
import '../../models/nominee_model.dart';

abstract class NomineeState extends Equatable {
  const NomineeState();
  @override
  List<Object> get props => [];
}

class NomineeInitial extends NomineeState {}

class NomineeLoading extends NomineeState {}

class NomineeLoaded extends NomineeState {
  final List<NomineeModel> nominees;
  const NomineeLoaded(this.nominees);
  @override
  List<Object> get props => [nominees];
}

class NomineeError extends NomineeState {
  final String message;
  const NomineeError(this.message);
  @override
  List<Object> get props => [message];
}
