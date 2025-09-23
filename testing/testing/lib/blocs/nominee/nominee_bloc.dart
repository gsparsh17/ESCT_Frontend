import 'package:flutter_bloc/flutter_bloc.dart';
import '../../repositories/nominee_repository.dart';
import 'nominee_event.dart';
import 'nominee_state.dart';

class NomineeBloc extends Bloc<NomineeEvent, NomineeState> {
  final NomineeRepository nomineeRepository;

  NomineeBloc({required this.nomineeRepository}) : super(NomineeInitial()) {
    on<FetchNominees>(_onFetchNominees);
  }

  void _onFetchNominees(FetchNominees event, Emitter<NomineeState> emit) async {
    emit(NomineeLoading());
    try {
      final nominees = await nomineeRepository.getMyNominees();
      emit(NomineeLoaded(nominees));
    } catch (e) {
      emit(NomineeError(e.toString().replaceFirst("Exception: ", "")));
    }
  }
}
