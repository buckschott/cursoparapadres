#!/bin/bash
cd ~/Developer/cursoparapadres

echo "Converting gray text to white..."

# Light grays (300, 400) -> white
find app components -name "*.tsx" -exec sed -i '' 's/text-gray-300/text-white/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/text-gray-400/text-white\/70/g' {} \;

# Medium gray (500) -> white/60
find app components -name "*.tsx" -exec sed -i '' 's/text-gray-500/text-white\/60/g' {} \;

# Hover states
find app components -name "*.tsx" -exec sed -i '' 's/hover:text-gray-300/hover:text-white/g' {} \;

echo "✓ Gray text converted"
echo ""
echo "Remaining gray text: $(grep -r 'text-gray-[0-9]' app components --include='*.tsx' | wc -l)"
