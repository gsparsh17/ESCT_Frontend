import 'package:flutter/material.dart';
import '../../widgets/custom_app_bar.dart';

class BlogScreen extends StatelessWidget {
  const BlogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      appBar: CustomAppBar(title: 'Blog'),
      body: Center(
        child: Text('Blog Screen', style: TextStyle(fontSize: 24)),
      ),
    );
  }
}
