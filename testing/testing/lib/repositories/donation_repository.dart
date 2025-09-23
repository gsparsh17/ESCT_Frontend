import 'dart:convert';
import 'dart:developer';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:testing/models/reciever_model.dart';
import 'package:testing/repositories/auth_repository.dart';

class DonationRepository {
  final AuthRepository authRepository;
  final String _baseUrl = 'http://34.131.221.81:10000/api';

  DonationRepository({required this.authRepository});

  Future<List<ReceiverData>> fetchAllClaims() async {
    final Uri url = Uri.parse('$_baseUrl/claims');
    final headers = await authRepository.getAuthHeaders();
    // ## MODIFIED ##: Changed log() to print() for universal visibility.
    print('--- API Request ---\nURL: GET $url\nHeaders: $headers\n--------------------');
    final response = await http.get(url, headers: headers);
    print('--- API Response ---\nStatus Code: ${response.statusCode}\nBody: ${response.body}\n---------------------');
    if (response.statusCode == 200) {
      final body = jsonDecode(response.body);
      if (body['success'] == true && body['data']['claims'] != null) {
        final List claims = body['data']['claims'];
        return claims.map((claim) => ReceiverData.fromJson(claim)).toList();
      } else {
        throw Exception(body['message'] ?? 'Failed to parse claims data.');
      }
    } else {
      throw Exception('Failed to load claims: ${response.reasonPhrase}');
    }
  }

  Future<String> createClaim({
    required String type,
    required String title,
    required String description,
    required String beneficiaryEhrms,
    required List<PlatformFile> files,
  }) async {
    List<Map<String, String>> uploadedDocuments = [];
    for (var file in files) {
      await Future.delayed(const Duration(milliseconds: 500));
      // ## MODIFIED ##: Changed log() to print()
      print("Simulating upload for: ${file.name}");
      final String uploadedUrl = "https://example.com/uploads/${DateTime.now().millisecondsSinceEpoch}_${file.name}";
      uploadedDocuments.add({
        "documentType": file.extension?.toUpperCase() ?? "File",
        "documentUrl": uploadedUrl,
      });
    }

    final Uri url = Uri.parse('$_baseUrl/claims');
    final headers = await authRepository.getAuthHeaders();
    final body = jsonEncode({
      'type': type,
      'title': title,
      'description': description,
      'beneficiaryEhrms': beneficiaryEhrms,
      'supportingDocuments': uploadedDocuments,
    });

    // ## MODIFIED ##: Changed log() to print()
    print('--- API Request (Create Claim) ---\nURL: POST $url\nHeaders: $headers\nBody: $body\n--------------------');

    final response = await http.post(url, headers: headers, body: body);

    // ## MODIFIED ##: Changed log() to print()
    print('--- API Response (Create Claim) ---\nStatus Code: ${response.statusCode}\nBody: ${response.body}\n---------------------');

    final responseBody = jsonDecode(response.body);
    if (response.statusCode == 201 && responseBody['success'] == true) {
      return responseBody['message'] ?? 'Claim submitted successfully!';
    } else {
      final errorMessage = responseBody['message'] ?? 'Failed to create claim.';
      throw Exception(errorMessage);
    }
  }
}

