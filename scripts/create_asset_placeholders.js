#!/usr/bin/env node

/**
 * Create placeholder asset files for CI/CD environments
 * These are minimal files that allow tests to run without the full CDN assets
 */

const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const floorplansDir = path.join(__dirname, '..', 'assets', 'floorplans-local');
const modelsDir = path.join(__dirname, '..', 'assets', 'models-local');

if (!fs.existsSync(floorplansDir)) {
  fs.mkdirSync(floorplansDir, { recursive: true });
}

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Create minimal SVG placeholder
const placeholderSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <text x="50%" y="50%" font-family="Arial" font-size="12" text-anchor="middle" dy=".3em">Placeholder</text>
</svg>`;

// Create minimal 1x1 PNG placeholder (base64)
const placeholderPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGAhyG5EQAAAABJRU5ErkJggg==',
  'base64'
);

// Create minimal PDF placeholder
const placeholderPDF = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Placeholder) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000202 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
295
%%EOF`;

// Create minimal JPG placeholder (base64 - 1x1 pixel)
const placeholderJPG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A+4H',
  'base64'
);

// Write placeholder files
try {
  fs.writeFileSync(path.join(floorplansDir, 'ground-floor.svg'), placeholderSVG);
  fs.writeFileSync(path.join(floorplansDir, 'first-floor.svg'), placeholderSVG);
  fs.writeFileSync(path.join(floorplansDir, 'ground-floor.png'), placeholderPNG);
  fs.writeFileSync(path.join(floorplansDir, 'first-floor.png'), placeholderPNG);
  fs.writeFileSync(path.join(floorplansDir, 'plan-pack.pdf'), placeholderPDF);
  
  fs.writeFileSync(path.join(modelsDir, 'poster.jpg'), placeholderJPG);
  
  console.log('✅ Created placeholder asset files for CI/CD');
  console.log('   - Floor plans: SVG, PNG, PDF placeholders');
  console.log('   - Models: JPG poster placeholder');
  console.log('   Note: These are minimal files for testing. Production uses CDN assets.');
} catch (error) {
  console.error('❌ Error creating placeholder files:', error);
  process.exit(1);
}
