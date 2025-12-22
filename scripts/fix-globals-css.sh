#!/bin/bash
cd ~/Developer/cursoparapadres

echo "Fixing globals.css..."

# Remove the old chalk colors block at the bottom
sed -i '' '/\/\* ===== CHALK KID COLORS/,/^}/d' app/globals.css

# Update the top :root block with all colors
sed -i '' 's/:root {/:root {\
  --chalk-white: #FFFFFF;\
  --chalk-yellow: #FFE566;\
  --chalk-pink: #FF9999;\
  --chalk-blue: #7EC8E3;\
  --chalk-green: #77DD77;\
  --chalk-orange: #FFB347;\
  --chalk-purple: #B19CD9;/g' app/globals.css

echo "✓ globals.css cleaned up"
