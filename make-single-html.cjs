const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error('dist directory does not exist.');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));

if (!jsFile) {
  console.error('JS bundle not found in assets.');
  process.exit(1);
}

let extraCss = '';
const rootStylePath = path.join(distDir, 'style.css');
if (fs.existsSync(rootStylePath)) {
  extraCss += fs.readFileSync(rootStylePath, 'utf-8') + '\n';
}

if (cssFile) {
  extraCss += fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8') + '\n';
}

let jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');

// Replace any import.meta or module references if needed for pure inline execution
jsContent = jsContent.replace(/import\.meta/g, '({url:""})');

const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>视界滞后 - Observation Lag</title>
  <style>
    ${extraCss}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    ${jsContent}
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '视界滞后·L7正式版V1.html'), htmlContent, 'utf-8');
fs.writeFileSync(path.join(distDir, 'standalone.html'), htmlContent, 'utf-8');

console.log('Single-file standalone HTML created successfully with all styles included!');
