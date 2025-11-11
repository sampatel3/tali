#!/bin/bash

echo "=========================================="
echo "  🗄️  TALI Database Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt install postgresql"
    echo "  Windows: Download from postgresql.org"
    exit 1
fi

echo "✅ PostgreSQL found"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  PostgreSQL is not running. Starting..."
    # Try to start PostgreSQL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo service postgresql start
    fi
    sleep 2
fi

echo "Creating database user and database..."
echo ""

# Create user and database
psql -U postgres <<EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'taliuser') THEN
        CREATE USER taliuser WITH PASSWORD 'talipass123';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE tali OWNER taliuser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'tali')\gexec

-- Grant necessary privileges
ALTER USER taliuser CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE tali TO taliuser;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Database: tali"
    echo "User: taliuser"
    echo "Password: talipass123"
    echo "Connection: postgresql://taliuser:talipass123@localhost:5432/tali"
else
    echo ""
    echo "❌ Database setup failed!"
    echo "You may need to run this script with sudo or as postgres user"
    exit 1
fi

echo ""
echo "=========================================="
