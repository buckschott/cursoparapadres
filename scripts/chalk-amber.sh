#!/bin/bash
cd ~/Developer/cursoparapadres

echo "Converting amber to Chalk Orange..."

find app components -name "*.tsx" -exec sed -i '' 's/amber-50/\[#D4B896\]\/10/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-100/\[#D4B896\]\/20/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-200/\[#D4B896\]\/30/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-300/\[#D4B896\]\/50/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-400/\[#D4B896\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-500/\[#D4B896\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-600/\[#D4B896\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-700/\[#C4A786\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-800/\[#D4B896\]/g' {} \;
find app components -name "*.tsx" -exec sed -i '' 's/amber-900/\[#D4B896\]/g' {} \;

echo "✓ Amber done"
echo ""
echo "Remaining amber: $(grep -r 'amber-[0-9]' app components --include='*.tsx' | wc -l)"
