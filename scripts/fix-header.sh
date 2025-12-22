#!/bin/bash
cd ~/Developer/cursoparapadres

# Fix line 64 in Header.tsx
sed -i '' '64s/.*/        className={`xl:hidden fixed inset-0 top-[73px] bg-background z-[100] ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}/' components/Header.tsx

echo "Fixed Header.tsx"
