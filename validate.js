#!/usr/bin/env node

/**
 * Simple validation script for LOOMPER landing page
 * Checks for common issues and validates structure
 */

const fs = require('fs');
const path = require('path');

const basePath = __dirname;
const errors = [];
const warnings = [];
const success = [];

// Check if required files exist
const requiredFiles = [
  'index.html',
  'assets/loomper-app.css',
  'assets/loomper-app.js',
  'privacy.html',
  'terms.html',
  'netlify.toml'
];

console.log('🔍 Validating LOOMPER Landing Page...\n');

// Check files
requiredFiles.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    success.push(`✅ ${file} exists`);
  } else {
    errors.push(`❌ ${file} not found`);
  }
});

// Check images
const imageFiles = [
  'assets/images/logo-horizontal.jpg',
  'assets/images/hero-truck.png',
  'assets/images/icon-l.png'
];

imageFiles.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    success.push(`✅ Image ${file} exists`);
  } else {
    warnings.push(`⚠️  Image ${file} not found`);
  }
});

// Read and validate HTML
try {
  const html = fs.readFileSync(path.join(basePath, 'index.html'), 'utf8');
  
  // Check for required sections
  const requiredSections = [
    { id: 'ecossistema', name: 'Ecossistema section' },
    { id: 'simulador', name: 'Simulador section' },
    { id: 'apoie', name: 'Apoie section' },
    { id: 'stakeholders', name: 'Stakeholders section' },
    { id: 'waitlist', name: 'Waitlist section' }
  ];
  
  requiredSections.forEach(section => {
    if (html.includes(`id="${section.id}"`)) {
      success.push(`✅ ${section.name} present`);
    } else {
      errors.push(`❌ ${section.name} missing`);
    }
  });
  
  // Check for Netlify Forms configuration
  if (html.includes('data-netlify="true"') && html.includes('name="waitlist"')) {
    success.push('✅ Netlify Forms configured');
  } else {
    errors.push('❌ Netlify Forms not properly configured');
  }
  
  // Check for hidden fields
  if (html.includes('name="id_user"') && html.includes('name="referrer_id"')) {
    success.push('✅ Hidden tracking fields present');
  } else {
    warnings.push('⚠️  Some tracking fields may be missing');
  }
  
  // Check for modals
  if (html.includes('id="success-modal"') && html.includes('id="stakeholder-modal"')) {
    success.push('✅ Modals configured');
  } else {
    warnings.push('⚠️  Some modals may be missing');
  }
  
} catch (error) {
  errors.push(`❌ Error reading HTML: ${error.message}`);
}

// Read and validate JavaScript
try {
  const js = fs.readFileSync(path.join(basePath, 'assets/loomper-app.js'), 'utf8');
  
  // Check for required functions
  const requiredFunctions = [
    'getOrCreateUserId',
    'handleWaitlistSubmit',
    'showSuccessModal',
    'initPix',
    'initSimulador',
    'initStakeholders',
    'showStakeholderModal'
  ];
  
  requiredFunctions.forEach(func => {
    if (js.includes(`function ${func}`) || js.includes(`const ${func}`)) {
      success.push(`✅ Function ${func} defined`);
    } else {
      errors.push(`❌ Function ${func} not found`);
    }
  });
  
  // Check for constants
  if (js.includes('const WA_NUMBER') && js.includes('const PIX_KEY')) {
    success.push('✅ Configuration constants defined');
  } else {
    warnings.push('⚠️  Some configuration constants may be missing');
  }
  
} catch (error) {
  errors.push(`❌ Error reading JavaScript: ${error.message}`);
}

// Read and validate CSS
try {
  const css = fs.readFileSync(path.join(basePath, 'assets/loomper-app.css'), 'utf8');
  
  // Check for key styles
  const requiredStyles = [
    '.stakeholder-cards',
    '.stakeholder-card',
    '.whatsapp-fab',
    '.modal',
    '.sim-result'
  ];
  
  requiredStyles.forEach(style => {
    if (css.includes(style)) {
      success.push(`✅ Style ${style} defined`);
    } else {
      warnings.push(`⚠️  Style ${style} may be missing`);
    }
  });
  
  // Check for media queries
  if (css.includes('@media')) {
    success.push('✅ Responsive styles present');
  } else {
    warnings.push('⚠️  No responsive styles found');
  }
  
} catch (error) {
  errors.push(`❌ Error reading CSS: ${error.message}`);
}

// Print results
console.log('\n📊 Validation Results:\n');

if (success.length > 0) {
  console.log('✨ Success (%d):', success.length);
  success.forEach(msg => console.log('  ' + msg));
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings (%d):', warnings.length);
  warnings.forEach(msg => console.log('  ' + msg));
}

if (errors.length > 0) {
  console.log('\n❌ Errors (%d):', errors.length);
  errors.forEach(msg => console.log('  ' + msg));
}

console.log('\n' + '='.repeat(50));
if (errors.length === 0) {
  console.log('✅ Validation PASSED - No critical errors found!');
  console.log('🚀 Landing page is ready for deployment.');
  process.exit(0);
} else {
  console.log('❌ Validation FAILED - Please fix the errors above.');
  process.exit(1);
}
