// server.js - Node.js Backend for Advanced Munsell Chart
// This backend serves the interactive HTML frontend and provides RESTful APIs for advanced color features.
// It uses Express.js for routing, tinycolor2 for color manipulations, wcag-contrast for accessibility checks,
// color-blind for color vision deficiency simulations, and Jimp for generating PNG exports.
// Install dependencies: npm install express body-parser tinycolor2 wcag-contrast color-blind jimp

const express = require('express');
const bodyParser = require('body-parser');
const tinycolor = require('tinycolor2');
const contrast = require('wcag-contrast');
const blinder = require('color-blind');
const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

// Munsell data (extracted from the HTML for server-side use)
const munsellData = [
  { hue: "5R", name: "Red", colors: [
    { hex: "#FFE6E6", value: 9, chroma: 2 },
    { hex: "#FFCCCC", value: 8, chroma: 4 },
    { hex: "#FFB3B3", value: 7, chroma: 6 },
    { hex: "#FF9999", value: 6, chroma: 8 },
    { hex: "#FF8080", value: 5, chroma: 10 },
    { hex: "#FF6666", value: 4, chroma: 12 },
    { hex: "#FF4D4D", value: 3, chroma: 14 },
    { hex: "#FF3333", value: 2, chroma: 16 }
  ]},
  { hue: "10R", name: "Red-Orange", colors: [
    { hex: "#FFE6E0", value: 9, chroma: 2 },
    { hex: "#FFCCC0", value: 8, chroma: 4 },
    { hex: "#FFB3A0", value: 7, chroma: 6 },
    { hex: "#FF9980", value: 6, chroma: 8 },
    { hex: "#FF8060", value: 5, chroma: 10 },
    { hex: "#FF6640", value: 4, chroma: 12 },
    { hex: "#FF4D20", value: 3, chroma: 14 },
    { hex: "#FF3300", value: 2, chroma: 16 }
  ]},
  { hue: "5YR", name: "Orange", colors: [
    { hex: "#FFE6D9", value: 9, chroma: 2 },
    { hex: "#FFCCB3", value: 8, chroma: 4 },
    { hex: "#FFB38D", value: 7, chroma: 6 },
    { hex: "#FF9966", value: 6, chroma: 8 },
    { hex: "#FF8040", value: 5, chroma: 10 },
    { hex: "#FF661A", value: 4, chroma: 12 },
    { hex: "#E54D00", value: 3, chroma: 14 },
    { hex: "#CC4400", value: 2, chroma: 16 }
  ]},
  { hue: "10YR", name: "Yellow-Orange", colors: [
    { hex: "#FFF2E6", value: 9, chroma: 2 },
    { hex: "#FFE6CC", value: 8, chroma: 4 },
    { hex: "#FFD9B3", value: 7, chroma: 6 },
    { hex: "#FFCC99", value: 6, chroma: 8 },
    { hex: "#FFBF80", value: 5, chroma: 10 },
    { hex: "#FFB366", value: 4, chroma: 12 },
    { hex: "#FFA64D", value: 3, chroma: 14 },
    { hex: "#FF9933", value: 2, chroma: 16 }
  ]},
  { hue: "5Y", name: "Yellow", colors: [
    { hex: "#FFFFF2", value: 9, chroma: 2 },
    { hex: "#FFFFE6", value: 8, chroma: 4 },
    { hex: "#FFFFD9", value: 7, chroma: 6 },
    { hex: "#FFFFCC", value: 6, chroma: 8 },
    { hex: "#FFFFBF", value: 5, chroma: 10 },
    { hex: "#FFFFB3", value: 4, chroma: 12 },
    { hex: "#FFFF80", value: 3, chroma: 14 },
    { hex: "#FFFF4D", value: 2, chroma: 16 }
  ]},
  { hue: "10Y", name: "Green-Yellow", colors: [
    { hex: "#F2FFE6", value: 9, chroma: 2 },
    { hex: "#E6FFCC", value: 8, chroma: 4 },
    { hex: "#D9FFB3", value: 7, chroma: 6 },
    { hex: "#CCFF99", value: 6, chroma: 8 },
    { hex: "#BFFF80", value: 5, chroma: 10 },
    { hex: "#B3FF66", value: 4, chroma: 12 },
    { hex: "#A6FF4D", value: 3, chroma: 14 },
    { hex: "#99FF33", value: 2, chroma: 16 }
  ]},
  { hue: "5GY", name: "Yellow-Green", colors: [
    { hex: "#E6FFE6", value: 9, chroma: 2 },
    { hex: "#CCFFCC", value: 8, chroma: 4 },
    { hex: "#B3FFB3", value: 7, chroma: 6 },
    { hex: "#99FF99", value: 6, chroma: 8 },
    { hex: "#80FF80", value: 5, chroma: 10 },
    { hex: "#66FF66", value: 4, chroma: 12 },
    { hex: "#4DFF4D", value: 3, chroma: 14 },
    { hex: "#33FF33", value: 2, chroma: 16 }
  ]},
  { hue: "10GY", name: "Green", colors: [
    { hex: "#E6FFEC", value: 9, chroma: 2 },
    { hex: "#CCFFD9", value: 8, chroma: 4 },
    { hex: "#B3FFC6", value: 7, chroma: 6 },
    { hex: "#99FFB3", value: 6, chroma: 8 },
    { hex: "#80FFA0", value: 5, chroma: 10 },
    { hex: "#66FF8D", value: 4, chroma: 12 },
    { hex: "#4DFF7A", value: 3, chroma: 14 },
    { hex: "#33FF66", value: 2, chroma: 16 }
  ]},
  { hue: "5G", name: "Blue-Green", colors: [
    { hex: "#E6FFF2", value: 9, chroma: 2 },
    { hex: "#CCFFE6", value: 8, chroma: 4 },
    { hex: "#B3FFD9", value: 7, chroma: 6 },
    { hex: "#99FFCC", value: 6, chroma: 8 },
    { hex: "#80FFBF", value: 5, chroma: 10 },
    { hex: "#66FFB3", value: 4, chroma: 12 },
    { hex: "#4DFFA6", value: 3, chroma: 14 },
    { hex: "#33FF99", value: 2, chroma: 16 }
  ]},
  { hue: "5B", name: "Blue", colors: [
    { hex: "#E6E6FF", value: 9, chroma: 2 },
    { hex: "#CCCCFF", value: 8, chroma: 4 },
    { hex: "#B3B3FF", value: 7, chroma: 6 },
    { hex: "#9999FF", value: 6, chroma: 8 },
    { hex: "#8080FF", value: 5, chroma: 10 },
    { hex: "#6666FF", value: 4, chroma: 12 },
    { hex: "#4D4DFF", value: 3, chroma: 14 },
    { hex: "#3333FF", value: 2, chroma: 16 }
  ]},
  { hue: "10B", name: "Purple-Blue", colors: [
    { hex: "#EDE6FF", value: 9, chroma: 2 },
    { hex: "#DBCCFF", value: 8, chroma: 4 },
    { hex: "#C9B3FF", value: 7, chroma: 6 },
    { hex: "#B799FF", value: 6, chroma: 8 },
    { hex: "#A580FF", value: 5, chroma: 10 },
    { hex: "#9366FF", value: 4, chroma: 12 },
    { hex: "#814DFF", value: 3, chroma: 14 },
    { hex: "#6F33FF", value: 2, chroma: 16 }
  ]},
  { hue: "5P", name: "Purple", colors: [
    { hex: "#F2E6FF", value: 9, chroma: 2 },
    { hex: "#E6CCFF", value: 8, chroma: 4 },
    { hex: "#D9B3FF", value: 7, chroma: 6 },
    { hex: "#CC99FF", value: 6, chroma: 8 },
    { hex: "#BF80FF", value: 5, chroma: 10 },
    { hex: "#B366FF", value: 4, chroma: 12 },
    { hex: "#A64DFF", value: 3, chroma: 14 },
    { hex: "#9933FF", value: 2, chroma: 16 }
  ]},
  { hue: "10P", name: "Red-Purple", colors: [
    { hex: "#FFE6F2", value: 9, chroma: 2 },
    { hex: "#FFCCE6", value: 8, chroma: 4 },
    { hex: "#FFB3D9", value: 7, chroma: 6 },
    { hex: "#FF99CC", value: 6, chroma: 8 },
    { hex: "#FF80BF", value: 5, chroma: 10 },
    { hex: "#FF66B3", value: 4, chroma: 12 },
    { hex: "#FF4DA6", value: 3, chroma: 14 },
    { hex: "#FF3399", value: 2, chroma: 16 }
  ]}
];

const app = express();
app.use(bodyParser.json());

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Serve the frontend HTML at root
app.get('/', (req, res) => {
  // In a real setup, serve from file: res.sendFile(path.join(__dirname, 'index.html'));
  // For this example, paste the entire HTML content here as a string
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Munsell Chart</title>
    <style>
        /* Paste the entire CSS from the provided HTML here */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }

        /* ... (omit for brevity, paste full CSS) */
    </style>
</head>
<body>
    <!-- Paste the entire body content from the provided HTML here -->
    <div class="container">
        <!-- ... (omit for brevity, paste full body) -->
    </div>

    <script>
        /* Paste the entire JavaScript from the provided HTML here */
        const munsellData = [ /* ... */ ];
        /* Note: In production, modify the frontend JS to fetch data from /api/munsell-data and call other APIs */
        /* For example, use fetch('/api/generate-palette', { method: 'POST', body: JSON.stringify({type, baseColor}) }) */
    </script>
</body>
</html>`;

  res.send(htmlContent);
});

// API to get all Munsell data (for dynamic loading in frontend)
app.get('/api/munsell-data', (req, res) => {
  res.json(munsellData);
});

// API to generate color palette
app.post('/api/generate-palette', (req, res) => {
  const { type, baseColor } = req.body;
  if (!type || !baseColor || !tinycolor(baseColor).isValid()) {
    return res.status(400).json({ error: 'Invalid type or base color' });
  }

  const base = tinycolor(baseColor);
  let palette = [base.toHexString()];

  try {
    switch (type.toLowerCase()) {
      case 'monochromatic':
        palette.push(base.brighten(20).toHexString());
        palette.push(base.darken(20).toHexString());
        palette.push(base.brighten(40).toHexString());
        palette.push(base.darken(40).toHexString());
        break;
      case 'analogous':
        const analogous = base.analogous();
        palette = analogous.map(c => c.toHexString());
        break;
      case 'complementary':
        palette.push(base.complement().toHexString());
        palette.push(base.brighten(10).complement().toHexString());
        palette.push(base.darken(10).complement().toHexString());
        break;
      case 'triadic':
        palette = base.triad().map(c => c.toHexString());
        break;
      case 'tetradic':
        palette = base.tetrad().map(c => c.toHexString());
        break;
      case 'random':
        for (let i = 0; i < 5; i++) {
          palette.push(tinycolor.random().toHexString());
        }
        break;
      default:
        return res.status(400).json({ error: 'Unsupported palette type' });
    }
    res.json({ palette });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate palette' });
  }
});

// API to compare two colors
app.post('/api/compare-colors', (req, res) => {
  const { colorA, colorB } = req.body;
  if (!tinycolor(colorA).isValid() || !tinycolor(colorB).isValid()) {
    return res.status(400).json({ error: 'Invalid colors' });
  }

  const ratio = contrast.hex(colorA, colorB);
  const hslA = tinycolor(colorA).toHsl();
  const hslB = tinycolor(colorB).toHsl();
  const hueDiff = Math.abs(hslA.h - hslB.h);
  const rating = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA (Large Text)' : 'Fail';

  res.json({
    contrastRatio: ratio.toFixed(2) + ':1',
    colorDifference: hueDiff.toFixed(1),
    wcagRating: rating
  });
});

// API for color blind simulation
app.post('/api/simulate-color-blind', (req, res) => {
  const { colors, type } = req.body;
  if (!Array.isArray(colors) || !type || !blinder[type]) {
    return res.status(400).json({ error: 'Invalid colors array or type (use: deuteranomaly, protanomaly, tritanomaly, etc.)' });
  }

  const simulated = colors.map(color => {
    if (!tinycolor(color).isValid()) return null;
    return blinder[type](color);
  }).filter(c => c !== null);

  res.json({ simulated });
});

// API for exporting colors
app.post('/api/export-colors', async (req, res) => {
  const { format, colors } = req.body;
  if (!Array.isArray(colors) || colors.length === 0) {
    return res.status(400).json({ error: 'Invalid colors array' });
  }

  try {
    switch (format.toLowerCase()) {
      case 'json':
        res.json({ colors });
        break;
      case 'css':
        const cssVars = colors.map((color, i) => `--color-${i + 1}: ${color};`).join('\n');
        res.set('Content-Type', 'text/css');
        res.send(`:root {\n${cssVars}\n}`);
        break;
      case 'png':
        // Generate a PNG palette image with swatches
        const swatchSize = 100;
        const width = swatchSize * colors.length;
        const height = swatchSize;
        const image = new Jimp(width, height, 0xffffffff);

        for (let i = 0; i < colors.length; i++) {
          const hex = parseInt(colors[i].replace('#', '0x'));
          image.scan(i * swatchSize, 0, swatchSize, height, (x, y, idx) => {
            image.bitmap.data[idx] = (hex >> 16) & 0xff;
            image.bitmap.data[idx + 1] = (hex >> 8) & 0xff;
            image.bitmap.data[idx + 2] = hex & 0xff;
            image.bitmap.data[idx + 3] = 255;
          });
        }

        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', 'attachment; filename=palette.png');
        res.send(buffer);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format (json, css, png)' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to export' });
  }
});

// API for color harmony (similar to palette, but focused on harmony rules)
app.post('/api/color-harmony', (req, res) => {
  const { baseColor, type } = req.body; // type: complementary, analogous, etc.
  // Reuse generate-palette logic for harmony
  return app.post('/api/generate-palette', req, res); // Redirect to palette generator for simplicity
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});