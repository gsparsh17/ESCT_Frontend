import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/nominee_model.dart';

class NomineeRepository {
  final String _baseUrl = 'http://34.131.221.81:10000/api';
  final _storage = const FlutterSecureStorage();

  Future<Map<String, String>> _getAuthHeaders() async {
    final token = await _storage.read(key: 'token');
    if (token == null) throw Exception('Not authenticated');
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<List<NomineeModel>> getMyNominees() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/users/nominees'),
        headers: await _getAuthHeaders(),
      );

      final responseBody = jsonDecode(response.body);

      if (response.statusCode == 200 && responseBody['success'] == true) {
        final List<dynamic> nomineeData = responseBody['data'];
        return nomineeData.map((data) => NomineeModel.fromJson(data)).toList();
      } else {
        throw Exception(responseBody['message'] ?? 'Failed to load nominees');
      }
    } catch (e) {
      if (kDebugMode) {
        print('[NomineeRepo] Error fetching nominees: $e');
      }
      rethrow;
    }
  }
}
