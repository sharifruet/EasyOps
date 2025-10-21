# EasyOps ERP Database Versioning

This project manages database schema changes and migrations for the EasyOps ERP system using Liquibase.

## Project Structure

```
database-versioning/
├── README.md                           # This file
├── liquibase.properties                # Liquibase configuration
├── docker-compose.yml                  # Database services for testing
├── changelog/                          # Database change scripts
│   ├── master-changelog.xml            # Main changelog file
│   ├── phase-0/                        # Phase 0: Core System
│   │   ├── 001-initial-schema.sql
│   │   ├── 002-auth-schema.sql
│   │   ├── 003-rbac-schema.sql
│   │   ├── 004-notifications.sql
│   │   └── 005-integration.sql
│   ├── phase-1/                        # Phase 1: Accounting
│   │   ├── 101-accounting-schema.sql
│   │   ├── 102-ar-ap-bank.sql
│   │   └── 103-fixes-and-updates.sql
│   ├── phase-2/                        # Phase 2: Sales
│   │   ├── 201-sales-schema.sql
│   │   └── 202-sales-updates.sql
│   └── data/                           # Reference and test data
│       ├── 001-default-roles.sql
│       ├── 002-default-permissions.sql
│       ├── 003-system-config.sql
│       ├── 004-test-data.sql
│       ├── 005-sales-test-data.sql
│       └── 006-accounting-test-data.sql
├── scripts/                            # Utility scripts
│   ├── migrate.sh                      # Run migrations
│   ├── rollback.sh                     # Rollback changes
│   ├── validate.sh                     # Validate schema
│   └── generate-changelog.sh           # Generate changelog from existing DB
└── docs/                               # Documentation
    ├── migration-guide.md
    ├── rollback-procedures.md
    └── test-data-guide.md
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 11+ (for Liquibase CLI) - Optional (Docker version available)
- PostgreSQL client tools

### Option 1: Test Database Versioning Standalone

1. **Start test environment**:
   ```bash
   # Linux/Mac
   ./scripts/test-database-versioning.sh
   
   # Windows
   scripts\test-database-versioning.bat
   ```

2. **Access test database**:
   - Adminer: http://localhost:8081
   - pgAdmin: http://localhost:5050 (admin@easyops.com / admin123)

### Option 2: Full Application Stack with Migrations

1. **Start entire development environment**:
   ```bash
   # Linux/Mac
   cd ..
   ./scripts/start-dev-with-migrations.sh
   
   # Windows
   cd ..
   scripts\start-dev-with-migrations.bat
   ```

2. **Access services**:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8081
   - Database Admin: http://localhost:8080

### Option 3: Manual Migration Process

1. **Start the database**:
   ```bash
   docker-compose up -d postgres
   ```

2. **Run migrations**:
   ```bash
   ./scripts/migrate.sh
   ```

3. **Validate schema**:
   ```bash
   ./scripts/validate.sh
   ```

### Development Workflow

1. **Create a new changeset**:
   - Add your changes to a new SQL file in the appropriate phase directory
   - Update the master changelog to include your changeset
   - Test the migration on a development database

2. **Test migrations**:
   ```bash
   # Run migrations
   ./scripts/migrate.sh
   
   # Validate the result
   ./scripts/validate.sh
   ```

3. **Rollback if needed**:
   ```bash
   ./scripts/rollback.sh <changeset-id>
   ```

## Configuration

The `liquibase.properties` file contains database connection settings and other configuration options. For different environments, you can override these settings using environment variables or separate properties files.

## Best Practices

1. **Naming Convention**: Use descriptive names for changesets with format: `YYYY-MM-DD-description`
2. **Atomic Changes**: Each changeset should be atomic and reversible
3. **Testing**: Always test migrations on a copy of production data
4. **Rollback Plans**: Ensure every changeset has a proper rollback strategy
5. **Documentation**: Document complex changes and business logic

## Environment-Specific Configuration

- **Development**: Uses local PostgreSQL instance
- **Testing**: Uses test database with sample data
- **Production**: Uses production database with proper credentials

## Test Data

The system includes comprehensive test data for development and testing:

- **Customers**: 20 test customers (10 accounting + 10 sales)
- **Products**: 15 test products (goods and services)
- **Vendors**: 10 test vendors for accounts payable
- **Sales Orders**: 5 test sales orders with line items
- **Quotations**: 5 test quotations with line items
- **AR Invoices**: 8 test invoices with line items
- **AP Bills**: 8 test bills with line items
- **Bank Transactions**: 15 test bank transactions
- **Chart of Accounts**: Complete account structure

All test data is tagged with `context:test-data` and can be excluded from production deployments.

See the [Test Data Guide](docs/test-data-guide.md) for detailed information.

## Troubleshooting

See the [Migration Guide](docs/migration-guide.md) for common issues and solutions.
