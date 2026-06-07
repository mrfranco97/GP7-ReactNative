#!/usr/bin/env node
/**
 * use-platform.js
 * Switches the active platform (android | ios) by merging the appropriate
 * manifest into package.json and re-running npm install.
 *
 * Usage:
 *   node scripts/use-platform.js android
 *   node scripts/use-platform.js ios
 *
 * Or via npm scripts:
 *   npm run use:android
 *   npm run use:ios
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const platform = process.argv[2];

if (!['android', 'ios'].includes(platform)) {
  console.error('❌  Usage: node scripts/use-platform.js android|ios');
  process.exit(1);
}

const root         = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'manifests', `package.${platform}.json`);
const pkgPath      = path.join(root, 'package.json');
const platformFile = path.join(root, '.platform');

if (!fs.existsSync(manifestPath)) {
  console.error(`❌  Manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const current  = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Merge: keep all non-dependency fields, replace dependencies from manifest
const next = { ...current, dependencies: manifest.dependencies };

fs.writeFileSync(pkgPath, JSON.stringify(next, null, 2) + '\n');
fs.writeFileSync(platformFile, platform);

console.log(`\n🔄  Switched to ${platform.toUpperCase()} (Expo SDK ${platform === 'android' ? '55' : '54'})`);
console.log('📦  Installing packages…\n');

try {
  execSync('npm install', { cwd: root, stdio: 'inherit' });
  console.log(`\n✅  Ready! Run: expo start --${platform}\n`);
} catch (err) {
  console.error('\n❌  npm install failed. Check the output above.');
  process.exit(1);
}
