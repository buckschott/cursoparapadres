#!/bin/bash
# Dark Theme Conversion Script for CursoParaPadres
# Run from project root: chmod +x dark-theme-convert.sh && ./dark-theme-convert.sh

echo "🌙 Converting to dark theme..."

# Function to do replacements in a file
convert_file() {
  local file="$1"
  
  # Background conversions
  sed -i '' 's/bg-white/bg-black/g' "$file"
  sed -i '' 's/bg-gray-50/bg-gray-950/g' "$file"
  sed -i '' 's/bg-gray-100/bg-gray-900/g' "$file"
  
  # Text conversions
  sed -i '' 's/text-gray-900/text-white/g' "$file"
  sed -i '' 's/text-gray-700/text-gray-300/g' "$file"
  sed -i '' 's/text-gray-600/text-gray-400/g' "$file"
  sed -i '' 's/text-gray-500/text-gray-500/g' "$file"  # Keep as-is, works on both
  
  # Border conversions
  sed -i '' 's/border-gray-100/border-gray-800/g' "$file"
  sed -i '' 's/border-gray-200/border-gray-700/g' "$file"
  sed -i '' 's/border-gray-300/border-gray-600/g' "$file"
  
  # Hover states
  sed -i '' 's/hover:bg-gray-50/hover:bg-gray-900/g' "$file"
  sed -i '' 's/hover:bg-gray-100/hover:bg-gray-800/g' "$file"
  sed -i '' 's/hover:bg-gray-200/hover:bg-gray-700/g' "$file"
  sed -i '' 's/hover:text-gray-900/hover:text-white/g' "$file"
  
  # Shadow adjustments (make shadows more visible on dark)
  sed -i '' 's/shadow-sm/shadow-sm shadow-black\/20/g' "$file"
  sed -i '' 's/shadow-lg/shadow-lg shadow-black\/30/g' "$file"
  sed -i '' 's/shadow-xl/shadow-xl shadow-black\/40/g' "$file"
  sed -i '' 's/shadow-2xl/shadow-2xl shadow-black\/50/g' "$file"
  
  echo "  ✓ $file"
}

# Process all TSX files in app/ and components/
echo ""
echo "Processing app/ directory..."
find app -name "*.tsx" -type f | while read file; do
  convert_file "$file"
done

echo ""
echo "Processing components/ directory..."
find components -name "*.tsx" -type f | while read file; do
  convert_file "$file"
done

echo ""
echo "✅ Dark theme conversion complete!"
echo ""
echo "⚠️  MANUAL REVIEW NEEDED:"
echo "   1. Check form inputs - may need explicit bg-gray-900 + text-white"
echo "   2. Check any bg-white/30 or bg-white/20 overlays"
echo "   3. Verify contrast on buttons and CTAs"
echo "   4. Test mobile menu overlay"
echo ""
echo "Run 'npm run dev' and visually inspect all pages."
