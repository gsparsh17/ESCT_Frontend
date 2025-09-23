import 'package:equatable/equatable.dart';

abstract class NomineeEvent extends Equatable {
  const NomineeEvent();
  @override
  List<Object> get props => [];
}

class FetchNominees extends NomineeEvent {}
