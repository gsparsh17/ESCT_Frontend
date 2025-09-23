import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_event.dart';
import '../../blocs/auth/auth_state.dart';
import '../../models/user_model.dart';
import '../../models/nominee_model.dart'; // Import the new model

enum UserType { employee, pensioner }

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  int _activeStep = 0;
  UserType _selectedUserType = UserType.employee;
  late final PageController _pageController;
  late final List<GlobalKey<FormState>> _formKeys;

  // --- CONTROLLERS ---
  // Credentials
  final _ehrmsController = TextEditingController();
  final _pensionerController = TextEditingController();
  final _passwordController = TextEditingController();
  // Personal
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _aadhaarController = TextEditingController();
  String? _selectedSex;
  DateTime? _dob;
  // Employment
  final _stateController = TextEditingController();
  final _districtController = TextEditingController();
  final _departmentController = TextEditingController();
  final _designationController = TextEditingController();
  DateTime? _doj;
  DateTime? _dor;
  // --- NOMINEE CONTROLLERS ---
  final _nomineeNameController = TextEditingController();
  final _nomineeRelationController = TextEditingController();
  final _nomineeAadhaarController = TextEditingController();
  DateTime? _nomineeDob;
  final _nomineeAccountNumberController = TextEditingController();
  final _nomineeIfscController = TextEditingController();
  final _nomineeBankNameController = TextEditingController();
  final _nomineeBranchNameController = TextEditingController();
  // Bank
  final _accountNumberController = TextEditingController();
  final _confirmAccountNumberController = TextEditingController();
  final _ifscController = TextEditingController();
  final _bankNameController = TextEditingController();
  final _branchNameController = TextEditingController();
  final _upiController = TextEditingController();

  // --- UI STATE & HELPERS ---
  List<String> get _stepTitles => _selectedUserType == UserType.employee
      ? ['User Type', 'Account', 'Personal', 'Employment', 'Nominee', 'Bank Info']
      : ['User Type', 'Account', 'Personal', 'Nominee', 'Bank Info'];

  final Color _primaryColor = const Color(0xFF008080);
  final Color _accentColor = const Color(0xFF26A69A);
  final Color _backgroundColor = const Color(0xFFF1F8F7);
  final Color _errorColor = const Color(0xFFFF6B6B);

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _formKeys = List.generate(5, (_) => GlobalKey<FormState>());
  }

  @override
  void dispose() {
    // Dispose all controllers...
    super.dispose();
  }

  // --- LOGIC ---
  void _onRegisterPressed() {
    if (!_formKeys[_activeStep - 1].currentState!.validate()) return;

    final personalDetails = PersonalDetails(fullName: _fullNameController.text, phone: _phoneController.text, email: _emailController.text, dateOfBirth: _dob!, aadhaarNumber: _aadhaarController.text, sex: _selectedSex!, age: 0);
    final bankDetails = BankDetails(accountNumber: _accountNumberController.text, confirmAccountNumber: _confirmAccountNumberController.text, ifscCode: _ifscController.text.toUpperCase(), bankName: _bankNameController.text, branchName: _branchNameController.text, upiId: _upiController.text);
    
    final nomineeBankDetails = NomineeBankDetails(accountNumber: _nomineeAccountNumberController.text, ifscCode: _nomineeIfscController.text.toUpperCase(), bankName: _nomineeBankNameController.text, branchName: _nomineeBranchNameController.text);
    final nominee = NomineeModel(name: _nomineeNameController.text, relation: _nomineeRelationController.text, dateOfBirth: _nomineeDob!, aadhaarNumber: _nomineeAadhaarController.text, bankDetails: nomineeBankDetails);

    EmploymentDetails? employmentDetails;
    if (_selectedUserType == UserType.employee) {
      employmentDetails = EmploymentDetails(state: _stateController.text, district: _districtController.text, department: _departmentController.text, designation: _designationController.text, dateOfJoining: _doj!, dateOfRetirement: _dor);
    }
    
    context.read<AuthBloc>().add(RegisterRequested(
        userType: _selectedUserType == UserType.employee ? 'EMPLOYEE' : 'PENSIONER',
        ehrmsCode: _selectedUserType == UserType.employee ? _ehrmsController.text.toUpperCase() : null,
        pensionerNumber: _selectedUserType == UserType.pensioner ? _pensionerController.text.toUpperCase() : null,
        password: _passwordController.text,
        personalDetails: personalDetails,
        employmentDetails: employmentDetails,
        bankDetails: bankDetails,
        nominee: nominee));
  }
  
  void _onContinue() {
    if (_activeStep > 0) {
      if (!_formKeys[_activeStep - 1].currentState!.validate()) return;
    }
    if (_activeStep < _stepTitles.length - 1) {
      _pageController.nextPage(duration: const Duration(milliseconds: 400), curve: Curves.easeInOutCubic);
    } else {
      _onRegisterPressed();
    }
  }

  void _onBack() {
    _pageController.previousPage(duration: const Duration(milliseconds: 400), curve: Curves.easeInOutCubic);
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message), backgroundColor: _errorColor, behavior: SnackBarBehavior.floating));
  }
  
  // --- UI ---
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _backgroundColor,
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0, leading: IconButton(icon: Icon(Icons.arrow_back_ios_new_rounded, color: _primaryColor), onPressed: () => Navigator.of(context).pop())),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthFailure) _showErrorSnackBar(state.message);
          if (state is AuthAuthenticated) Navigator.of(context).popUntil((route) => route.isFirst);
        },
        child: Column(
          children: [
            _buildStepper(),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (index) => setState(() => _activeStep = index),
                children: _buildPages(),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildNavigationButtons(),
    );
  }

  List<Widget> _buildPages() {
    final pages = [
      _buildFormStep(_buildUserTypeStep(), -1),
      _buildFormStep(_buildCredentialsForm(), 0),
      _buildFormStep(_buildPersonalDetailsForm(), 1),
    ];
    if (_selectedUserType == UserType.employee) {
      pages.add(_buildFormStep(_buildEmploymentDetailsForm(), 2));
    }
    // The nominee and bank steps now have dynamic indices
    final nomineeIndex = _selectedUserType == UserType.employee ? 3 : 2;
    final bankIndex = _selectedUserType == UserType.employee ? 4 : 3;
    pages.add(_buildFormStep(_buildNomineeDetailsForm(), nomineeIndex));
    pages.add(_buildFormStep(_buildBankDetailsForm(), bankIndex));
    return pages;
  }
  
  // ... (_buildStepper, _buildFormStep, _buildUserTypeCard, _buildNavigationButtons, _inputDecoration etc. remain unchanged)
  Widget _buildStepper() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        children: [
          Row(
            children: List.generate(_stepTitles.length, (index) {
              return Expanded(
                child: Text(_stepTitles[index], maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, fontWeight: _activeStep >= index ? FontWeight.bold : FontWeight.normal, color: _activeStep >= index ? _primaryColor : Colors.grey.shade500)));
            }),
          ),
          const SizedBox(height: 8),
          Stack(
            children: [
              Container(height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                height: 4,
                width: MediaQuery.of(context).size.width / (_stepTitles.length) * (_activeStep + 0.5),
                decoration: BoxDecoration(color: _primaryColor, borderRadius: BorderRadius.circular(2)),
              ),
            ],
          ),
        ],
      ),
    );
  }
  Widget _buildFormStep(Widget child, int formKeyIndex) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 12.0, left: 4.0),
            child: Text(_stepTitles[_activeStep], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87)),
          ),
          formKeyIndex >= 0 
            ? Form(key: _formKeys[formKeyIndex], child: Card(elevation: 2, shadowColor: _primaryColor.withOpacity(0.1), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), child: Padding(padding: const EdgeInsets.all(20.0), child: child)))
            : child,
        ],
      ),
    ).animate().fadeIn(duration: 500.ms).slideX(begin: 0.1, curve: Curves.easeOutCubic);
  }
  Widget _buildUserTypeStep() {
    return Column(
      children: [
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(child: _buildUserTypeCard(UserType.employee, 'Employee', Icons.work_outline_rounded)),
            const SizedBox(width: 16),
            Expanded(child: _buildUserTypeCard(UserType.pensioner, 'Pensioner', Icons.elderly_rounded)),
          ],
        ),
        const SizedBox(height: 20),
      ],
    );
  }
  Widget _buildUserTypeCard(UserType type, String title, IconData icon) {
    bool isSelected = _selectedUserType == type;
    return GestureDetector(
      onTap: () { if (_selectedUserType != type) { setState(() => _selectedUserType = type); } },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 150,
        decoration: BoxDecoration(
          color: isSelected ? _primaryColor.withOpacity(0.1) : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isSelected ? _primaryColor : Colors.grey.shade300, width: 2),
          boxShadow: isSelected ? [BoxShadow(color: _primaryColor.withOpacity(0.2), blurRadius: 10, offset: const Offset(0,4))] : [],
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Icon(icon, size: 50, color: isSelected ? _primaryColor : Colors.grey.shade500),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isSelected ? _primaryColor : Colors.black87)),
        ]),
      ),
    ).animate().scale(duration: 300.ms, curve: Curves.easeOutBack);
  }
  Widget _buildCredentialsForm() {
    return Column(
      children: [
        if (_selectedUserType == UserType.employee)
          _buildFancyFormField(controller: _ehrmsController, label: 'EHRMS Code', icon: Icons.badge_outlined, validator: (v) => v!.isEmpty ? 'Required' : null, textCapitalization: TextCapitalization.characters).animate().fadeIn(),
        if (_selectedUserType == UserType.pensioner)
          _buildFancyFormField(controller: _pensionerController, label: 'Pensioner Number', icon: Icons.receipt_long_outlined, validator: (v) => v!.isEmpty ? 'Required' : null, textCapitalization: TextCapitalization.characters).animate().fadeIn(),
        const SizedBox(height: 20),
        _buildFancyFormField(controller: _passwordController, label: 'Create Password', icon: Icons.lock_outline, obscureText: true, validator: (v) => v!.length < 8 ? 'Min 8 characters required' : null),
      ],
    );
  }
  Widget _buildPersonalDetailsForm() {
    return Column(children: [
      _buildFancyFormField(controller: _fullNameController, label: 'Full Name', icon: Icons.person_outline, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _aadhaarController, label: 'Aadhaar Number', icon: Icons.fingerprint, keyboardType: TextInputType.number, validator: (v) => v!.length != 12 ? 'Must be 12 digits' : null),
      const SizedBox(height: 20),
      _buildFancyDropdownField(value: _selectedSex, label: 'Sex', icon: Icons.wc_outlined, items: ['MALE', 'FEMALE', 'OTHER'], onChanged: (value) => setState(() => _selectedSex = value), validator: (v) => v == null ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyDatePickerField(value: _dob, label: 'Date of Birth', icon: Icons.cake_outlined, onTap: () async { final date = await showDatePicker(context: context, initialDate: DateTime(1990), firstDate: DateTime(1920), lastDate: DateTime.now()); if (date != null) setState(() => _dob = date);}, validator: (_) => _dob == null ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _phoneController, label: 'Phone Number', icon: Icons.phone_outlined, keyboardType: TextInputType.phone, validator: (v) => v!.length != 10 ? 'Must be 10 digits' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _emailController, label: 'Email Address', icon: Icons.email_outlined, keyboardType: TextInputType.emailAddress, validator: (v) => !(v?.contains('@') ?? false) ? 'Invalid email' : null),
    ]);
  }
  Widget _buildEmploymentDetailsForm() {
    return Column(children: [
      _buildFancyFormField(controller: _stateController, label: 'State', icon: Icons.map_outlined, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _districtController, label: 'District', icon: Icons.location_city_outlined, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _departmentController, label: 'Department', icon: Icons.corporate_fare, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _designationController, label: 'Designation', icon: Icons.work_outline, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyDatePickerField(value: _doj, label: 'Date of Joining', icon: Icons.event_available_outlined, onTap: () async { final date = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime(1950), lastDate: DateTime.now()); if (date != null) setState(() => _doj = date);}, validator: (_) => _doj == null ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyDatePickerField(value: _dor, label: 'Date of Retirement (Optional)', icon: Icons.event_busy_outlined, onTap: () async { final date = await showDatePicker(context: context, initialDate: DateTime.now().add(const Duration(days: 365 * 10)), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365 * 50))); if (date != null) setState(() => _dor = date);}, validator: (_) => null),
    ]);
  }
  Widget _buildBankDetailsForm() {
    return Column(children: [
      _buildFancyFormField(controller: _accountNumberController, label: 'Your Account Number', icon: Icons.pin_outlined, keyboardType: TextInputType.number, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _confirmAccountNumberController, label: 'Confirm Account Number', icon: Icons.pin_outlined, keyboardType: TextInputType.number, validator: (v) => v != _accountNumberController.text ? 'Account numbers do not match' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _ifscController, label: 'Your IFSC Code', icon: Icons.qr_code_2_outlined, textCapitalization: TextCapitalization.characters, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _bankNameController, label: 'Your Bank Name', icon: Icons.account_balance_outlined, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _branchNameController, label: 'Your Branch Name (Optional)', icon: Icons.location_city_outlined),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _upiController, label: 'Your UPI ID (Optional)', icon: Icons.payment_outlined),
    ]);
  }
  Widget _buildNavigationButtons() {
    bool isLoading = context.watch<AuthBloc>().state is AuthLoading;
    return Container(
        padding: const EdgeInsets.all(16.0).copyWith(bottom: 30.0),
        decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: Color(0xFFF0F0F0)))),
        child: Row(children: [
          if (_activeStep > 0)
            Expanded(child: OutlinedButton(onPressed: isLoading ? null : _onBack, style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))), child: const Text('BACK'))),
          if (_activeStep > 0) const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              onPressed: isLoading ? null : _onContinue,
              style: ElevatedButton.styleFrom(backgroundColor: _primaryColor, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
              child: (isLoading && _activeStep == _stepTitles.length - 1)
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(_activeStep == _stepTitles.length - 1 ? 'REGISTER' : 'CONTINUE'),
            ),
          ),
        ]));
  }
  TextFormField _buildFancyFormField({required TextEditingController controller, required String label, required IconData icon, bool obscureText = false, TextInputType? keyboardType, TextCapitalization textCapitalization = TextCapitalization.none, String? Function(String?)? validator}) {
    return TextFormField(controller: controller, obscureText: obscureText, keyboardType: keyboardType, textCapitalization: textCapitalization, validator: validator, cursorColor: _primaryColor, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.grey.shade800), decoration: _inputDecoration(label: label, icon: icon));
  }
  DropdownButtonFormField<String> _buildFancyDropdownField({required String? value, required String label, required IconData icon, required List<String> items, required void Function(String?)? onChanged, String? Function(String?)? validator}) {
    return DropdownButtonFormField<String>(value: value, items: items.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(), onChanged: onChanged, validator: validator, decoration: _inputDecoration(label: label, icon: icon), icon: Icon(Icons.arrow_drop_down, color: _primaryColor));
  }
  TextFormField _buildFancyDatePickerField({required DateTime? value, required String label, required IconData icon, required VoidCallback onTap, String? Function(DateTime?)? validator}) {
    return TextFormField(readOnly: true, onTap: onTap, validator: (v) => validator?.call(value), decoration: _inputDecoration(label: value == null ? label : DateFormat('dd MMMM yyyy').format(value), icon: icon));
  }
  InputDecoration _inputDecoration({required String label, required IconData icon}) {
    return InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.grey.shade600),
        prefixIcon: Icon(icon, color: _primaryColor, size: 22),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: _primaryColor, width: 2)));
  }

  // --- NEW: Form Section for Nominee Details ---
  Widget _buildNomineeDetailsForm() {
    return Column(children: [
      _buildFancyFormField(controller: _nomineeNameController, label: "Nominee's Full Name", icon: Icons.person_outline, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _nomineeRelationController, label: "Relation with Nominee", icon: Icons.people_outline, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyDatePickerField(value: _nomineeDob, label: "Nominee's Date of Birth", icon: Icons.cake_outlined, onTap: () async { final date = await showDatePicker(context: context, initialDate: DateTime(1990), firstDate: DateTime(1920), lastDate: DateTime.now()); if (date != null) setState(() => _nomineeDob = date);}, validator: (_) => _nomineeDob == null ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _nomineeAadhaarController, label: "Nominee's Aadhaar", icon: Icons.fingerprint, keyboardType: TextInputType.number, validator: (v) => v!.length != 12 ? 'Must be 12 digits' : null),
      const SizedBox(height: 20),
      const Divider(height: 30),
      Text("Nominee's Bank Details", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _primaryColor)),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _nomineeAccountNumberController, label: "Nominee's Account No.", icon: Icons.pin_outlined, keyboardType: TextInputType.number, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _nomineeIfscController, label: "Nominee's IFSC Code", icon: Icons.qr_code_2_outlined, textCapitalization: TextCapitalization.characters, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _nomineeBankNameController, label: "Nominee's Bank Name", icon: Icons.account_balance_outlined, validator: (v) => v!.isEmpty ? 'Required' : null),
      const SizedBox(height: 20),
      _buildFancyFormField(controller: _nomineeBranchNameController, label: "Nominee's Branch (Optional)", icon: Icons.location_city_outlined),
    ]);
  }

}

