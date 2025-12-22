#!/bin/bash
cd ~/Developer/cursoparapadres

echo "Converting to Pastel Easter Colors..."

# Chalk White -> Pure White
find app components -name "*.tsx" -exec sed -i '' 's/#E8E4DE/#FFFFFF/g' {} \;
sed -i '' 's/#E8E4DE/#FFFFFF/g' app/globals.css

# Chalk Yellow -> Bright Yellow
find app components -name "*.tsx" -exec sed -i '' 's/#E8D5A3/#FFE566/g' {} \;

# Chalk Pink -> Bright Pink
find app components -name "*.tsx" -exec sed -i '' 's/#D4A5A5/#FF9999/g' {} \;

# Chalk Blue -> Bright Blue
find app components -name "*.tsx" -exec sed -i '' 's/#8BA5B5/#7EC8E3/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/#7A949F/#6BB8D3/g' {} \;

# Chalk Green -> Bright Green
find app components -name "*.tsx" -exec sed -i '' 's/#8FB5A1/#77DD77/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/#7DA38F/#66CC66/g' {} \;

# Chalk Orange -> Bright Orange
find app components -name "*.tsx" -exec sed -i '' 's/#D4B896/#FFB347/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/#C4A786/#FFA337/g' {} \;

# Chalk Purple -> Bright Purple
find app components -name "*.tsx" -exec sed -i '' 's/#A89BB5/#B19CD9/g' {} \;

echo "✓ Pastel colors applied!"
echo ""
echo "Refresh localhost:3000 to see the changes"
