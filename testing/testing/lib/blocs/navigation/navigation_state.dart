import 'package:equatable/equatable.dart';

class NavigationState extends Equatable {
  final int tabIndex;

  const NavigationState({required this.tabIndex});

  @override
  List<Object> get props => [tabIndex];
}