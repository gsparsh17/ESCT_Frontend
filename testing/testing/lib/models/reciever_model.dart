class ReceiverData {
  final String id;
  final String imageUrl;
  final String receiverName;
  final String nomineeName;
  final String accountDetails; // This will be empty based on your API
  final String ifscCode;       // This will be empty based on your API
  final String category;       // This is the 'type' from the API
  
  // ## NEW ##: Added fields from the 'Get All Claims' API response.
  final String title;
  final String description;
  final int amountRequested;
  final int amountRaised;
  final String status;

  ReceiverData({
    required this.id,
    required this.imageUrl,
    required this.receiverName,
    required this.nomineeName,
    required this.accountDetails,
    required this.ifscCode,
    required this.category,
    // ## NEW ##
    required this.title,
    required this.description,
    required this.amountRequested,
    required this.amountRaised,
    required this.status,
  });

  factory ReceiverData.fromJson(Map<String, dynamic> json) {
    // Helper to safely access nested properties.
    String getNestedValue(Map<String, dynamic> map, List<String> keys, [String defaultValue = '']) {
      dynamic value = map;
      for (var key in keys) {
        if (value is Map<String, dynamic> && value.containsKey(key)) {
          value = value[key];
        } else {
          return defaultValue;
        }
      }
      return value?.toString() ?? defaultValue;
    }

    final String claimId = json['_id'] ?? 'unknown_id';

    return ReceiverData(
      id: claimId,
      // ## MAPPED ##: Maps API fields to our model properties.
      receiverName: getNestedValue(json, ['raisedBy', 'personalDetails', 'fullName'], 'N/A'),
      nomineeName: getNestedValue(json, ['beneficiary', 'personalDetails', 'fullName'], 'N/A'),
      category: json['type'] ?? 'Uncategorized',
      title: json['title'] ?? 'No Title',
      description: json['description'] ?? 'No Description provided.',
      amountRequested: json['amountRequested'] ?? 0,
      amountRaised: json['amountRaised'] ?? 0,
      status: json['status'] ?? 'Unknown',

      // ## MODIFIED ##: These fields are not in the API response, so we provide defaults.
      // The image URL is a placeholder based on the unique claim ID.
      imageUrl: 'https://i.pravatar.cc/150?u=$claimId', 
      accountDetails: '', // Not available in the claims API
      ifscCode: '',       // Not available in the claims API
    );
  }
}

