#!/bin/bash
cd ~/Developer/cursoparapadres

echo "Converting gray borders to chalk white..."

find app components -name "*.tsx" -exec sed -i '' 's/border-gray-600/border-\[#E8E4DE\]\/20/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/border-gray-700/border-\[#E8E4DE\]\/15/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/border-gray-800/border-\[#E8E4DE\]\/10/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/hover:border-gray-600/hover:border-\[#E8E4DE\]\/40/g' {} \;

echo "✓ Gray borders done"
echo ""
echo "Remaining gray-600/700/800: $(grep -r 'gray-600\|gray-700\|gray-800' app components --include='*.tsx' | wc -l)"
