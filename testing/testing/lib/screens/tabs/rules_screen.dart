import 'package:flutter/material.dart';
import '../../widgets/custom_app_bar.dart';

// Model for a rule item
class RuleItem {
  final String title;
  final String content;
  final IconData icon;

  RuleItem({required this.title, required this.content, required this.icon});
}

class RulesScreen extends StatefulWidget {
  const RulesScreen({super.key});

  @override
  State<RulesScreen> createState() => _RulesScreenState();
}

class _RulesScreenState extends State<RulesScreen> {
  bool _agreedToTerms = false;

  final List<RuleItem> _eligibilityRules = [
    RuleItem(
      title: 'For Government Doctors Only',
      icon: Icons.verified_user_outlined,
      content: 'This platform and its benefits are exclusively for verified government doctors currently in service. Membership is subject to verification of your credentials.',
    ),
    RuleItem(
      title: 'Accurate and Truthful Information',
      icon: Icons.fact_check_outlined,
      content: 'All members must provide accurate and truthful information during registration. Any misrepresentation may lead to immediate termination of the account and a permanent ban from the platform.',
    ),
  ];

  final List<RuleItem> _donationRules = [
    RuleItem(
      title: 'Case Verification Process',
      icon: Icons.policy_outlined,
      content: 'Every request for financial assistance is subject to a strict verification process by our internal committee. This ensures that aid reaches genuine cases of need. We may require documentation to support a claim.',
    ),
    RuleItem(
      title: 'Voluntary Contributions',
      icon: Icons.volunteer_activism_outlined,
      content: 'All donations made on this platform are strictly voluntary. Members should contribute based on their own will and capacity. There is no mandatory contribution required to maintain membership.',
    ),
    RuleItem(
      title: 'No Refunds Policy',
      icon: Icons.money_off_csred_outlined,
      content: 'Once a donation is made to a verified cause, it cannot be refunded. This policy is in place to ensure that funds committed to a family in need are secured and disbursed promptly.',
    ),
  ];
  
  final List<RuleItem> _conductRules = [
      RuleItem(
      title: 'Respectful and Professional Conduct',
      icon: Icons.groups_outlined,
      content: 'All interactions on this platform must be respectful and professional. Harassment, hate speech, or any form of abuse towards other members or families will not be tolerated.',
    ),
    RuleItem(
      title: 'No Direct Solicitation',
      icon: Icons.pan_tool_outlined,
      content: 'Members are strictly prohibited from directly soliciting funds from other members privately. All requests for aid must go through the official platform verification process.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Rules & Guidelines'),
      backgroundColor: Colors.grey.shade100,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 16.0),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: _buildHighlightedRuleCard(),
            ),
            const SizedBox(height: 24),
            _buildRuleSection('Membership & Eligibility', _eligibilityRules),
            const SizedBox(height: 16),
            _buildRuleSection('Donation & Verification Process', _donationRules),
            const SizedBox(height: 16),
            _buildRuleSection('Community Conduct', _conductRules),
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: _buildAcknowledgementSection(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHighlightedRuleCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
        side: BorderSide(color: Colors.amber.shade300, width: 1.5),
      ),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.hourglass_top_rounded, color: Colors.amber.shade800, size: 28),
                const SizedBox(width: 12),
                Text(
                  '15-Day Eligibility Period',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.amber.shade900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'To ensure the integrity and stability of our community fund, all new members are subject to a mandatory 15-day waiting period after successful registration. During this time, you can explore the app and make donations, but you will not be eligible to apply for or receive financial benefits. This period allows us to complete necessary verifications.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey.shade700,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRuleSection(String title, List<RuleItem> rules) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 12),
          Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            clipBehavior: Clip.antiAlias,
            color: Colors.white,
            child: ListView.separated(
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              itemCount: rules.length,
              separatorBuilder: (context, index) => Divider(height: 1, color: Colors.grey.shade200, indent: 20, endIndent: 20),
              itemBuilder: (context, index) {
                return _buildRuleExpansionTile(rules[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRuleExpansionTile(RuleItem rule) {
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ExpansionTile(
        leading: CircleAvatar(
          radius: 20,
          backgroundColor: Colors.teal.withOpacity(0.1),
          child: Icon(rule.icon, color: Colors.teal, size: 20),
        ),
        tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          rule.title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
        ),
        iconColor: Colors.teal,
        collapsedIconColor: Colors.grey.shade600,
        childrenPadding: const EdgeInsets.fromLTRB(24, 0, 24, 20),
        children: [
          Text(
            rule.content,
            style: TextStyle(
              color: Colors.grey.shade700,
              height: 1.6,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAcknowledgementSection() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        child: CheckboxListTile(
          value: _agreedToTerms,
          onChanged: (newValue) {
            setState(() {
              _agreedToTerms = newValue ?? false;
            });
          },
          title: const Text(
            'I have read and agree to all rules and guidelines.',
            style: TextStyle(fontWeight: FontWeight.w500, color: Colors.black87),
          ),
          controlAffinity: ListTileControlAffinity.leading,
          activeColor: Colors.teal,
        ),
      ),
    );
  }
}

