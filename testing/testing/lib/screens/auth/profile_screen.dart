import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_event.dart';
import '../../blocs/auth/auth_state.dart';
import '../../blocs/nominee/nominee_bloc.dart';
import '../../blocs/nominee/nominee_event.dart';
import '../../blocs/nominee/nominee_state.dart';
import '../../models/user_model.dart';
import '../../models/nominee_model.dart';
import '../../repositories/nominee_repository.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => NomineeBloc(
        nomineeRepository: NomineeRepository(),
      )..add(FetchNominees()),
      child: const ProfileView(),
    );
  }
}

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      appBar: AppBar(
        elevation: 0,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF00897B), Color(0xFF26A69A)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        title: const Text(
          "My Profile",
          style: TextStyle(
            color: Colors.white,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.w600,
            fontSize: 20,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: () => context.read<AuthBloc>().add(LoggedOut()),
            icon: const Icon(Icons.logout_rounded, color: Colors.white),
            tooltip: 'Logout',
          )
        ],
      ),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          if (state is AuthAuthenticated) {
            final UserModel user = state.user;
            final personal = user.personalDetails;
            final bank = user.bankDetails;
            final employment = user.employmentDetails;

            return ListView(
              children: [
                _buildProfileHeader(user),
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      _buildSectionTitle("Personal Information"),
                      _buildProfileItem(Icons.badge_outlined, "EHRMS / Pensioner ID",
                          user.ehrmsCode ?? user.pensionerNumber ?? 'N/A'),
                      _buildProfileItem(Icons.phone_outlined, "Mobile Number", personal.phone),
                      _buildProfileItem(Icons.email_outlined, "Email Address", personal.email),
                      _buildProfileItem(Icons.cake_outlined, "Date of Birth",
                          DateFormat('dd MMM yyyy').format(personal.dateOfBirth)),
                      _buildProfileItem(Icons.wc_outlined, "Sex", personal.sex),
                      _buildProfileItem(Icons.fingerprint, "Aadhaar", personal.aadhaarNumber),

                      if (user.userType == 'EMPLOYEE' && employment != null) ...[
                        const SizedBox(height: 24),
                        _buildSectionTitle("Professional Details"),
                        _buildProfileItem(Icons.work_outline, "Designation", employment.designation),
                        _buildProfileItem(Icons.corporate_fare, "Department", employment.department),
                        _buildProfileItem(Icons.location_city_outlined, "District", employment.district),
                        _buildProfileItem(Icons.map_outlined, "State", employment.state),
                        _buildProfileItem(Icons.event, "Date of Joining",
                            DateFormat('dd MMM yyyy').format(employment.dateOfJoining)),
                        _buildProfileItem(Icons.event, "Date of Retirement",
                            employment.dateOfRetirement != null
                                ? DateFormat('dd MMM yyyy').format(employment.dateOfRetirement!)
                                : 'N/A'),
                      ],

                      const SizedBox(height: 24),
                      _buildSectionTitle("My Bank Details"),
                      _buildProfileItem(Icons.account_balance, "Bank Name", bank.bankName),
                      _buildProfileItem(Icons.pin, "Account Number", bank.accountNumber),
                      _buildProfileItem(Icons.qr_code, "IFSC Code", bank.ifscCode),
                      if (bank.branchName != null && bank.branchName!.isNotEmpty)
                        _buildProfileItem(Icons.location_on_outlined, "Branch", bank.branchName!),
                      if (bank.upiId != null && bank.upiId!.isNotEmpty)
                        _buildProfileItem(Icons.payment, "UPI ID", bank.upiId!),

                      const SizedBox(height: 24),
                      _buildSectionTitle("Nominee Details"),
                      _buildNomineeSection(),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ],
            );
          }
          return const Center(
            child: CircularProgressIndicator(
              color: Color(0xFF00897B),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(UserModel user) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF00897B), Color(0xFF26A69A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(40),
          bottomRight: Radius.circular(40),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 15,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 110,
            height: 110,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Text(
                user.personalDetails.fullName.isNotEmpty
                    ? user.personalDetails.fullName[0].toUpperCase()
                    : 'U',
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF00897B),
                  fontFamily: 'Poppins',
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            user.personalDetails.fullName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w600,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 6),
          Text(
            user.employmentDetails?.designation ?? user.userType.toUpperCase(),
            style: TextStyle(
              color: Colors.white.withOpacity(0.9),
              fontSize: 16,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFFE0F2F1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        title,
        style: const TextStyle(
          fontFamily: 'Poppins',
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Color(0xFF00796B),
        ),
      ),
    );
  }

  Widget _buildProfileItem(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ListTile(
        leading: Container(
          width: 45,
          height: 45,
          decoration: BoxDecoration(
            color: const Color(0xFFE0F2F1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFF00897B), size: 22),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontFamily: 'Poppins',
            color: Colors.grey.shade600,
            fontSize: 13,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(
            fontFamily: 'Poppins',
            color: Colors.black87,
            fontWeight: FontWeight.w500,
            fontSize: 16,
          ),
        ),
      ),
    );
  }

  Widget _buildNomineeSection() {
    return BlocBuilder<NomineeBloc, NomineeState>(
      builder: (context, state) {
        if (state is NomineeLoading) {
          return const Center(
            child: CircularProgressIndicator(
              color: Color(0xFF00897B),
            ),
          );
        }
        if (state is NomineeLoaded) {
          if (state.nominees.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const ListTile(
                leading: Icon(Icons.info_outline, color: Colors.grey),
                title: Text(
                  'No nominee details found.',
                  style: TextStyle(fontFamily: 'Poppins'),
                ),
              ),
            );
          }
          return Column(
            children:
                state.nominees.map((nominee) => _buildNomineeCard(nominee)).toList(),
          );
        }
        if (state is NomineeError) {
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(16),
            ),
            child: ListTile(
              leading: const Icon(Icons.error_outline, color: Colors.red),
              title: const Text(
                'Could not load nominee details',
                style: TextStyle(fontFamily: 'Poppins'),
              ),
              subtitle: Text(
                state.message,
                style: const TextStyle(fontFamily: 'Poppins'),
              ),
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildNomineeCard(NomineeModel nominee) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.15),
            blurRadius: 12,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: nominee.isPrimary 
                        ? const Color(0xFF00897B) 
                        : Colors.grey.shade300,
                  ),
                  child: Icon(
                    Icons.person,
                    color: nominee.isPrimary ? Colors.white : Colors.grey.shade700,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        nominee.name,
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        nominee.relation,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                if (nominee.isPrimary)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF00897B), Color(0xFF26A69A)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      "PRIMARY",
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            const Divider(height: 1, color: Colors.grey),
            const SizedBox(height: 16),
            _buildProfileItem(Icons.cake_outlined, "Date of Birth",
                DateFormat('dd MMM yyyy').format(nominee.dateOfBirth)),
            _buildProfileItem(Icons.fingerprint, "Aadhaar", nominee.aadhaarNumber),
            const SizedBox(height: 12),
            const Text(
              "Nominee's Bank Details",
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF00796B),
              ),
            ),
            const SizedBox(height: 8),
            _buildProfileItem(
                Icons.account_balance, "Bank Name", nominee.bankDetails.bankName),
            _buildProfileItem(Icons.pin, "Account Number",
                nominee.bankDetails.accountNumber),
          ],
        ),
      ),
    );
  }
}