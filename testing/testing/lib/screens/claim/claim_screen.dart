import 'package:testing/blocs/claim/claim_bloc.dart';
import 'package:testing/blocs/donation/donation_bloc.dart';
import 'package:testing/blocs/donation/donation_event.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:testing/repositories/donation_repository.dart';

class CreateClaimScreen extends StatelessWidget {
  final String claimType;

  const CreateClaimScreen({super.key, required this.claimType});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ClaimBloc(
        donationRepository: RepositoryProvider.of<DonationRepository>(context),
      ),
      child: Scaffold(
        backgroundColor: const Color(0xFFF5F9FA),
        appBar: AppBar(
          title: Text('Apply for $claimType'),
          backgroundColor: const Color(0xFF008080),
          foregroundColor: Colors.white,
          elevation: 2,
        ),
        // ## MODIFIED ##: The BlocListener is the key to connecting the BLoCs.
        body: BlocListener<ClaimBloc, ClaimState>(
          listener: (context, state) {
            if (state is ClaimSubmissionSuccess) {
              // --- THIS IS THE MAGIC ---
              // Before showing the success message, find the DonationBloc
              // instance from the HomeScreen and tell it to fetch the data again.
              context.read<DonationBloc>().add(FetchDonations());
              // -------------------------

              ScaffoldMessenger.of(context)
                ..hideCurrentSnackBar()
                ..showSnackBar(
                  SnackBar(
                    content: Text(state.message),
                    backgroundColor: Colors.green.shade700,
                  ),
                );
              // Pop the screen after a short delay
              Future.delayed(const Duration(seconds: 2), () {
                if (Navigator.canPop(context)) {
                  Navigator.of(context).pop();
                }
              });
            } else if (state is ClaimSubmissionFailure) {
              ScaffoldMessenger.of(context)
                ..hideCurrentSnackBar()
                ..showSnackBar(
                  SnackBar(
                    content: Text('Error: ${state.error}'),
                    backgroundColor: Colors.red.shade700,
                  ),
                );
            }
          },
          // We use a BlocBuilder here to separate the listening logic from the UI building.
          child: BlocBuilder<ClaimBloc, ClaimState>(
            builder: (context, state) {
              if (state is ClaimSubmissionInProgress) {
                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(color: Color(0xFF008080)),
                      SizedBox(height: 16),
                      Text("Submitting your claim..."),
                    ],
                  ),
                );
              }
              return _ClaimForm(claimType: claimType);
            },
          ),
        ),
      ),
    );
  }
}
// ... The rest of the file (_ClaimForm, _ClaimFormState, etc.) remains exactly the same.
// No changes are needed there.
class _ClaimForm extends StatefulWidget {
  final String claimType;
  const _ClaimForm({required this.claimType});

  @override
  State<_ClaimForm> createState() => _ClaimFormState();
}

class _ClaimFormState extends State<_ClaimForm> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _beneficiaryController = TextEditingController();

  List<PlatformFile> _pickedFiles = [];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _beneficiaryController.dispose();
    super.dispose();
  }

  Future<void> _pickFiles() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      );

      if (result != null) {
        setState(() {
          _pickedFiles.addAll(result.files);
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error picking files: $e')),
      );
    }
  }

  void _submitClaim() {
    if (_formKey.currentState!.validate() && _pickedFiles.isNotEmpty) {
      context.read<ClaimBloc>().add(
            SubmitClaim(
              type: widget.claimType,
              title: _titleController.text,
              description: _descriptionController.text,
              beneficiaryEhrms: _beneficiaryController.text,
              supportingDocuments: _pickedFiles,
            ),
          );
    } else if (_pickedFiles.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please attach at least one supporting document.'),
          backgroundColor: Colors.orange,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          Card(
            color: Colors.white,
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'You are applying for the category "${widget.claimType}". Please fill out the details below.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: const Color(0xFF004D40)
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          Card(
            color: Colors.white,
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Claim Details", style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: const Color(0xFF006666),
                    fontWeight: FontWeight.bold
                  )),
                  const Divider(height: 24),
                  _buildTextFormField(
                    controller: _titleController,
                    labelText: 'Claim Title',
                    hintText: 'e.g., Emergency medical expenses',
                    icon: Icons.title,
                  ),
                  const SizedBox(height: 16),
                  _buildTextFormField(
                    controller: _descriptionController,
                    labelText: 'Description',
                    hintText: 'Provide a brief summary of the situation.',
                    icon: Icons.description,
                    maxLines: 4,
                  ),
                  const SizedBox(height: 16),
                  _buildTextFormField(
                    controller: _beneficiaryController,
                    labelText: "Beneficiary's EHRMS Code",
                    hintText: 'e.g., EHRMS123456',
                    icon: Icons.person_pin,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Card(
            color: Colors.white,
            elevation: 2,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   Text("Supporting Documents", style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: const Color(0xFF006666),
                    fontWeight: FontWeight.bold
                  )),
                  const Divider(height: 24),
                  if (_pickedFiles.isNotEmpty)
                    ..._pickedFiles.map((file) => _buildFileChip(file)).toList(),
                  Center(
                    child: OutlinedButton.icon(
                      onPressed: _pickFiles,
                      icon: const Icon(Icons.attach_file),
                      label: const Text('Add Document'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF008080),
                        side: const BorderSide(color: Color(0xFF008080)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton(
            onPressed: _submitClaim,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF006666),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 16),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            child: const Text('Submit Claim'),
          ),
        ],
      ),
    );
  }

  Widget _buildFileChip(PlatformFile file) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Chip(
        avatar: CircleAvatar(
          backgroundColor: const Color(0xFF008080),
          child: Icon(
            _getIconForFileType(file.extension),
            color: Colors.white,
            size: 18,
          ),
        ),
        label: Text(file.name, overflow: TextOverflow.ellipsis),
        onDeleted: () {
          setState(() {
            _pickedFiles.remove(file);
          });
        },
        deleteIconColor: Colors.red.shade400,
      ),
    );
  }
  
  IconData _getIconForFileType(String? extension) {
    switch (extension?.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return Icons.image;
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'doc':
      case 'docx':
        return Icons.description;
      default:
        return Icons.insert_drive_file;
    }
  }
  
  TextFormField _buildTextFormField({
    required TextEditingController controller,
    required String labelText,
    required String hintText,
    required IconData icon,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        prefixIcon: Icon(icon, color: const Color(0xFF008080)),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFF008080), width: 2),
        ),
      ),
      validator: (value) =>
          value!.trim().isEmpty ? 'This field cannot be empty' : null,
    );
  }
}

