#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * 
 * This script helps generate PWA icons in the required sizes.
 * You'll need to have ImageMagick installed for this to work.
 * 
 * Usage:
 * 1. Place your logo (e.g., logo.png) in the public/icons/ directory
 * 2. Run: node scripts/generate-pwa-icons.js
 * 
 * Required icon sizes for PWA:
 * - 72x72 (Android)
 * - 96x96 (Android)
 * - 128x128 (Android)
 * - 144x144 (Android)
 * - 152x152 (iOS)
 * - 192x192 (Android)
 * - 384x384 (Android)
 * - 512x512 (Android)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [
  72, 96, 128, 144, 152, 192, 384, 512
];

const ICONS_DIR = path.join(__dirname, '../public/icons');

function checkImageMagick() {
  try {
    execSync('convert --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function generateIcons(sourceImage) {
  if (!fs.existsSync(sourceImage)) {
    console.error(`❌ Source image not found: ${sourceImage}`);
    console.log('Please place your logo in the public/icons/ directory');
    return false;
  }

  console.log(`🔄 Generating PWA icons from: ${sourceImage}`);

  ICON_SIZES.forEach(size => {
    const outputFile = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    
    try {
      execSync(`convert "${sourceImage}" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "${outputFile}"`, {
        stdio: 'ignore'
      });
      console.log(`✅ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate icon-${size}x${size}.png`);
    }
  });

  return true;
}

function main() {
  console.log('🎨 PWA Icon Generator');
  console.log('====================\n');

  // Check if ImageMagick is installed
  if (!checkImageMagick()) {
    console.error('❌ ImageMagick is not installed or not in PATH');
    console.log('Please install ImageMagick:');
    console.log('  - macOS: brew install imagemagick');
    console.log('  - Windows: Download from https://imagemagick.org/');
    console.log('  - Linux: sudo apt-get install imagemagick');
    return;
  }

  // Create icons directory if it doesn't exist
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Look for source images
  const possibleSources = [
    path.join(ICONS_DIR, 'logo.png'),
    path.join(ICONS_DIR, 'logo.jpg'),
    path.join(ICONS_DIR, 'logo.svg'),
    path.join(ICONS_DIR, 'icon.png'),
    path.join(ICONS_DIR, 'icon.jpg'),
    path.join(ICONS_DIR, 'icon.svg'),
    path.join(__dirname, '../public/favicon.ico'),
    path.join(__dirname, '../public/lovable-uploads/31c42cd4-bee4-40d8-ba66-0438b1c8dc85.png')
  ];

  let sourceImage = null;
  for (const source of possibleSources) {
    if (fs.existsSync(source)) {
      sourceImage = source;
      break;
    }
  }

  if (!sourceImage) {
    console.error('❌ No source image found');
    console.log('Please place one of these files in the public/icons/ directory:');
    console.log('  - logo.png');
    console.log('  - logo.jpg');
    console.log('  - logo.svg');
    console.log('  - icon.png');
    console.log('  - icon.jpg');
    console.log('  - icon.svg');
    return;
  }

  // Generate icons
  if (generateIcons(sourceImage)) {
    console.log('\n🎉 PWA icons generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Review the generated icons in public/icons/');
    console.log('2. Test your PWA installation');
    console.log('3. Deploy your app');
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateIcons, ICON_SIZES };
