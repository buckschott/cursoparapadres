#!/bin/bash
cd ~/Developer/cursoparapadres

echo "Converting remaining grays..."

find app components -name "*.tsx" -exec sed -i '' 's/bg-gray-900/bg-\[#2A2A2A\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/bg-gray-800/bg-\[#2A2A2A\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/bg-gray-700/bg-\[#333333\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/hover:bg-gray-700/hover:bg-\[#333333\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/text-gray-600/text-\[#E8E4DE\]\/40/g' {} \;

echo "✓ Remaining grays done"
echo ""
echo "Remaining gray-600/700/800/900: $(grep -r 'gray-600\|gray-700\|gray-800\|gray-900' app components --include='*.tsx' | wc -l)"
