#!/bin/bash

# Script to copy the migration SQL to clipboard (macOS)
# Usage: ./copy-migration.sh

echo "Copying database migration SQL to clipboard..."

if command -v pbcopy &> /dev/null; then
    # macOS
    cat migrations/001_initial_schema.sql | pbcopy
    echo "✅ Migration SQL copied to clipboard!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://supabase.com/dashboard"
    echo "2. Select your project: zgxhwqvmbhpdvegqqndk"
    echo "3. Navigate to SQL Editor"
    echo "4. Click 'New Query'"
    echo "5. Paste (Cmd+V) and click 'Run'"
    echo ""
elif command -v xclip &> /dev/null; then
    # Linux
    cat migrations/001_initial_schema.sql | xclip -selection clipboard
    echo "✅ Migration SQL copied to clipboard!"
elif command -v clip &> /dev/null; then
    # Windows
    cat migrations/001_initial_schema.sql | clip
    echo "✅ Migration SQL copied to clipboard!"
else
    echo "❌ Clipboard utility not found."
    echo "Please manually copy the contents of migrations/001_initial_schema.sql"
fi

echo ""
echo "📁 Migration file location: $(pwd)/migrations/001_initial_schema.sql"
