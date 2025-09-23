import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../models/nominee_model.dart';

class AuthRepository {
  final String _baseUrl = 'http://34.131.221.81:10000/api';
  final _storage = const FlutterSecureStorage();

  // ## MODIFIED ##: This method is now public (renamed from _getAuthHeaders)
  // and can be used by other repositories.
  Future<Map<String, String>> getAuthHeaders() async {
    final token = await _storage.read(key: 'token');
    if (token == null) {
      // If no token is found, we cannot make an authenticated request.
      throw Exception('Authentication token not found. Please log in.');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  Future<UserModel> login({
    required String identifier,
    required String password,
  }) async {
    try {
      final url = Uri.parse('$_baseUrl/auth/login');
      final body = jsonEncode({'ehrmsCode': identifier, 'password': password});

      if (kDebugMode) {
        print("[AuthRepo] Sending LOGIN request to: $url");
        print("[AuthRepo] Request Body: $body");
      }

      final response = await http.post(url, headers: {'Content-Type': 'application/json'}, body: body);

      if (kDebugMode) {
        print("[AuthRepo] LOGIN Response Status Code: ${response.statusCode}");
        print("[AuthRepo] LOGIN Response Body: ${response.body}");
      }

      final responseBody = jsonDecode(response.body);

      if (response.statusCode == 200 && responseBody['success'] == true) {
        final token = responseBody['data']['token'];
        await _storage.write(key: 'token', value: token);
        final user = await getMe();
        if (user == null) throw Exception('Login successful, but failed to fetch user profile.');
        return user;
      } else {
        throw Exception(responseBody['message'] ?? 'Login failed');
      }
    } catch (e) {
      if (kDebugMode) print("[AuthRepo] LOGIN ERROR: ${e.toString()}");
      throw Exception(e.toString().replaceFirst("Exception: ", ""));
    }
  }

  Future<UserModel> register({
    required String userType,
    String? ehrmsCode,
    String? pensionerNumber,
    required String password,
    EmploymentDetails? employmentDetails,
    required PersonalDetails personalDetails,
    required BankDetails bankDetails,
    required NomineeModel nominee,
  }) async {
    final Map<String, dynamic> userPayload = {
      'userType': userType,
      'password': password,
      'personalDetails': personalDetails.toJson(),
      'bankDetails': bankDetails.toJson(),
    };
    if (userType == 'EMPLOYEE') {
      userPayload['ehrmsCode'] = ehrmsCode;
      userPayload['employmentDetails'] = employmentDetails?.toJson();
    } else {
      userPayload['pensionerNumber'] = pensionerNumber;
    }

    final userResponse = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(userPayload),
    );
    
    final userResponseBody = jsonDecode(userResponse.body);

    if (kDebugMode) {
      print("[AuthRepo] STEP 1 USER REGISTER Response Status: ${userResponse.statusCode}");
      print("[AuthRepo] STEP 1 USER REGISTER Response Body: ${userResponse.body}");
    }

    if (userResponse.statusCode != 201 || userResponseBody['success'] != true) {
      throw Exception(userResponseBody['message'] ?? 'User registration failed');
    }

    final token = userResponseBody['data']['token'];
    await _storage.write(key: 'token', value: token);

    try {
      final nomineeResponse = await http.post(
        Uri.parse('$_baseUrl/users/nominees'),
        headers: await getAuthHeaders(), // Use the public method here
        body: jsonEncode(nominee.toJson()),
      );

      final nomineeResponseBody = jsonDecode(nomineeResponse.body);

      if (kDebugMode) {
        print("[AuthRepo] STEP 2 NOMINEE ADD Response Status: ${nomineeResponse.statusCode}");
        print("[AuthRepo] STEP 2 NOMINEE ADD Response Body: ${nomineeResponse.body}");
      }
      
      if (nomineeResponse.statusCode != 201 || nomineeResponseBody['success'] != true) {
        throw Exception(nomineeResponseBody['message'] ?? 'Nominee registration failed');
      }

      final user = await getMe();
      if (user == null) throw Exception('Registration complete, but failed to fetch final user profile.');
      return user;

    } catch (e) {
      await logout();
      if (kDebugMode) print("[AuthRepo] REGISTER/NOMINEE ERROR: ${e.toString()}");
      throw Exception(e.toString().replaceFirst("Exception: ", ""));
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'token');
  }

  Future<UserModel?> getMe() async {
    try {
      final token = await _storage.read(key: 'token');
      if (token == null) return null;

      final response = await http.get(
        Uri.parse('$_baseUrl/auth/me'),
        headers: await getAuthHeaders(), // Use the public method here
      );
      final responseBody = jsonDecode(response.body);

      if (response.statusCode == 200 && responseBody['success'] == true) {
        return UserModel.fromJson(responseBody['data']);
      } else {
        await logout();
        return null;
      }
    } catch (e) {
      if (kDebugMode) print("[AuthRepo] GetMe Error: $e");
      return null;
    }
  }
}
