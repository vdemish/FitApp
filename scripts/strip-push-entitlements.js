const fs = require('fs');
const path = require('path');

const entitlementsPath = path.join(
  __dirname,
  '..',
  'ios',
  'FitApp',
  'FitApp.entitlements'
);

if (!fs.existsSync(entitlementsPath)) {
  process.exit(0);
}

const contents = fs.readFileSync(entitlementsPath, 'utf8');
const stripped = contents.replace(
  /\s*<key>aps-environment<\/key>\s*<string>[^<]*<\/string>\s*/g,
  '\n'
);

const hasOtherKeys = /<key>/.test(stripped);

const output = hasOtherKeys
  ? stripped
  : `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ` +
    `"http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n` +
    `<plist version="1.0">\n` +
    `  <dict/>\n` +
    `</plist>\n`;

fs.writeFileSync(entitlementsPath, output);
