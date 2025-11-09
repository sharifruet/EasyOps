# EasyOps ERP System

## 📋 Overview

EasyOps ERP is a comprehensive, cloud-native enterprise resource planning system designed to streamline business operations across all departments. This modular, scalable platform provides intelligent automation, advanced analytics, and seamless integration capabilities to optimize business processes and drive growth.

## 🏗️ Project Structure

```
easyops-erp/
├── services/                    # Microservices
│   ├── api-gateway/            # API Gateway Service
│   ├── user-management/        # User Management Service
│   ├── auth-service/          # Authentication Service
│   ├── rbac-service/          # Role-Based Access Control Service
│   ├── system-config/         # System Configuration Service
│   └── monitoring-service/     # Monitoring Service
├── frontend/                   # React Frontend Application
├── shared/                     # Shared Libraries
│   ├── common/                # Common utilities
│   ├── models/                # Data models
│   └── security/              # Security utilities
├── infrastructure/             # Infrastructure as Code
│   ├── docker/               # Docker configurations
│   ├── kubernetes/            # Kubernetes manifests
│   └── terraform/             # Terraform configurations
├── database-versioning/        # Database Schema Management
│   ├── changelog/            # Liquibase changesets
│   ├── scripts/              # Migration scripts
│   └── docs/                 # Database documentation
├── docs/                      # Documentation
├── tests/                     # Test suites
└── scripts/                   # Development scripts
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Java 25
- Node.js 20+
- Maven 3.9+
- Liquibase (for database migrations)
- PostgreSQL client tools

### Development Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/easyops/erp-system.git
   cd easyops-erp
   ```

2. **Start core platform components in Docker**
   ```bash
   # From the repository root
   docker compose up -d postgres redis liquibase adminer eureka api-gateway
   ```
   This brings up the shared infrastructure (database, cache, Liquibase migrations, Adminer UI, Eureka, API gateway) that the microservices rely on. Use `docker compose ps` to verify container health or `docker compose logs -f <service>` to tail logs.

   💡 Prefer automation? Run the helper script instead:
   ```bash
   ./scripts/dev-start.sh        # Starts the full Docker stack + health checks
   # Stop / restart later with:
   ./scripts/dev-stop.sh         # Gracefully stops containers
   ./scripts/dev-restart.sh      # Restarts the Docker stack
   ```

3. **Run Spring Boot microservices locally**
   ```bash
   ./scripts/start-spring-services.sh
   ```
   The script launches all Spring services with the `local` profile, wiring them to the Docker infrastructure above. Logs are streamed to `logs/local-services/`. To start a subset, set `SERVICES_OVERRIDE="hr-service,accounting-service"` before running the script.

4. **Start the frontend in Docker**
   ```bash
   docker compose up -d frontend
   ```
   The container exposes the React dev server on http://localhost:3000 and watches the local `frontend/` directory. Use `docker compose logs -f frontend` to inspect UI logs.

5. **(Optional) Start the combined dev helper scripts**
   ```bash
   # Simple startup (recommended)
   ./scripts/start-dev-simple.sh

   # Or use Docker Compose directly
   docker-compose up -d
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:8081
   - Adminer: http://localhost:8080
   - Eureka: http://localhost:8761

## 📚 Development Phases

### Phase 0: Administrative Foundation (Months 1-6)
- **Phase 0.1**: System Foundation (Months 1-2)
- **Phase 0.2**: Multi-Tenancy & Organization Management (Months 3-4)
- **Phase 0.3**: Integration & API Management (Months 5-6)

### Phase 1: Accounting Module (Months 7-15)
- **Phase 1.1**: Core Accounting Foundation (Months 7-9)
- **Phase 1.2**: Subledgers & Cash Management (Months 10-12)
- **Phase 1.3**: Advanced Accounting Features (Months 13-15)

### Phase 2: Inventory Module (Months 16-24)
- **Phase 2.1**: Core Inventory Management (Months 16-18)
- **Phase 2.2**: Warehouse Operations (Months 19-21)
- **Phase 2.3**: Advanced Inventory Features (Months 22-24)

### Phase 3: Sales Module (Months 25-33)
- **Phase 3.1**: Core Sales Management (Months 25-27)
- **Phase 3.2**: Customer Management & Fulfillment (Months 28-30)
- **Phase 3.3**: Advanced Sales Features (Months 31-33)

## 🔧 Technology Stack

- **Backend**: Java 25 + Spring Boot 4 + Spring Cloud
- **Frontend**: React 19 + TypeScript 5.5 + Material-UI
- **Database**: PostgreSQL 17 + MongoDB 7 + Redis 7
- **Infrastructure**: Kubernetes + Docker + Terraform
- **Security**: Spring Security 6 + OAuth 2.0 + JWT
- **Testing**: JUnit 5 + Jest + Cypress + JMeter

## 📖 Documentation

### Main Documentation
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture overview
- [Docker Setup Guide](./DOCKER_START.md) - Docker deployment guide
- [Testing Guide](./TESTING_GUIDE.md) - Testing strategy and guides
- [Quick Start](./QUICKSTART.md) - Quick start guide
- [Frontend Guide](./FRONTEND_GUIDE.md) - Frontend development guide
- **[📁 Database Versioning](./database-versioning/README.md)** - Database schema management with Liquibase

### Implementation Documentation
- **[📁 Implementation Docs](./implementations/)** - All implementation guides and phase completion reports
  - Phase 0 Complete Guide
  - Phase 0.2 Organization & RBAC
  - Phase 0.3 Monitoring & Notifications
  - Service-specific guides
  - Quick start guides
  - Troubleshooting & fixes

### Requirements
- [Requirements Documentation](../requirements/) - Detailed system requirements
- [Administrative Requirements](../requirements/administrative/) - Phase 0 requirements

## 🤝 Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Technical Support**: [support@easyops.com](mailto:support@easyops.com)
- **Documentation**: [docs.easyops.com](https://docs.easyops.com)
- **Community Forum**: [community.easyops.com](https://community.easyops.com)
