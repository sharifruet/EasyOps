-- Initialize EasyOps ERP Database
-- This script sets up the initial database structure for Phase 0

-- Create development databases
CREATE DATABASE easyops;
CREATE DATABASE easyops_test;

-- Create development user
CREATE USER easyops_dev WITH PASSWORD 'easyops123';
GRANT ALL PRIVILEGES ON DATABASE easyops TO easyops_dev;
GRANT ALL PRIVILEGES ON DATABASE easyops_test TO easyops_dev;

-- Connect to main database
\c easyops;

-- Create schemas for different modules
CREATE SCHEMA IF NOT EXISTS admin;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS rbac;
CREATE SCHEMA IF NOT EXISTS system;
CREATE SCHEMA IF NOT EXISTS audit;

-- Grant permissions to development user
GRANT ALL PRIVILEGES ON SCHEMA admin TO easyops_dev;
GRANT ALL PRIVILEGES ON SCHEMA users TO easyops_dev;
GRANT ALL PRIVILEGES ON SCHEMA auth TO easyops_dev;
GRANT ALL PRIVILEGES ON SCHEMA rbac TO easyops_dev;
GRANT ALL PRIVILEGES ON SCHEMA system TO easyops_dev;
GRANT ALL PRIVILEGES ON SCHEMA audit TO easyops_dev;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID
);

-- Organizations table
CREATE TABLE admin.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    domain VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- User organizations (many-to-many)
CREATE TABLE users.user_organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES admin.organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'USER',
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

-- Roles table
CREATE TABLE rbac.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Permissions table
CREATE TABLE rbac.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions (many-to-many)
CREATE TABLE rbac.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES rbac.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES rbac.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- User roles (many-to-many)
CREATE TABLE rbac.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES rbac.roles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES admin.organizations(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, role_id, organization_id)
);

-- System configuration table
CREATE TABLE system.configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(100),
    is_encrypted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Audit logs table
CREATE TABLE audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users.users(email);
CREATE INDEX idx_users_username ON users.users(username);
CREATE INDEX idx_users_active ON users.users(is_active);
CREATE INDEX idx_user_organizations_user_id ON users.user_organizations(user_id);
CREATE INDEX idx_user_organizations_org_id ON users.user_organizations(organization_id);
CREATE INDEX idx_roles_code ON rbac.roles(code);
CREATE INDEX idx_permissions_code ON rbac.permissions(code);
CREATE INDEX idx_permissions_resource ON rbac.permissions(resource);
CREATE INDEX idx_user_roles_user_id ON rbac.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON rbac.user_roles(role_id);
CREATE INDEX idx_configurations_key ON system.configurations(key);
CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit.audit_logs(action);

-- Insert default system roles
INSERT INTO rbac.roles (name, code, description, is_system_role) VALUES
('System Administrator', 'SYSTEM_ADMIN', 'Full system access', true),
('Organization Administrator', 'ORG_ADMIN', 'Organization-level administration', true),
('User', 'USER', 'Standard user access', true),
('Guest', 'GUEST', 'Limited guest access', true);

-- User sessions table (for authentication service)
CREATE TABLE auth.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    token VARCHAR(1000) UNIQUE NOT NULL,
    refresh_token VARCHAR(1000) UNIQUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE
);

-- Password reset tokens table
CREATE TABLE auth.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users.users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Login attempts table
CREATE TABLE auth.login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    successful BOOLEAN DEFAULT false,
    failure_reason VARCHAR(255),
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for auth tables
CREATE INDEX idx_user_sessions_user_id ON auth.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON auth.user_sessions(token);
CREATE INDEX idx_user_sessions_refresh_token ON auth.user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_is_active ON auth.user_sessions(is_active);
CREATE INDEX idx_password_reset_tokens_user_id ON auth.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON auth.password_reset_tokens(token);
CREATE INDEX idx_login_attempts_username ON auth.login_attempts(username);
CREATE INDEX idx_login_attempts_attempted_at ON auth.login_attempts(attempted_at);

-- Insert default permissions
INSERT INTO rbac.permissions (name, code, resource, action, description) VALUES
('User Management', 'USER_MANAGE', 'users', 'manage', 'Manage user accounts'),
('User View', 'USER_VIEW', 'users', 'view', 'View user information'),
('Role Management', 'ROLE_MANAGE', 'roles', 'manage', 'Manage roles and permissions'),
('Role View', 'ROLE_VIEW', 'roles', 'view', 'View roles and permissions'),
('System Configuration', 'SYSTEM_CONFIG', 'system', 'configure', 'Configure system settings'),
('System View', 'SYSTEM_VIEW', 'system', 'view', 'View system information'),
('Audit Logs', 'AUDIT_VIEW', 'audit', 'view', 'View audit logs'),
('Organization Management', 'ORG_MANAGE', 'organizations', 'manage', 'Manage organizations');

-- Assign permissions to System Administrator role
INSERT INTO rbac.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac.roles r, rbac.permissions p
WHERE r.code = 'SYSTEM_ADMIN';

-- Assign basic permissions to Organization Administrator role
INSERT INTO rbac.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac.roles r, rbac.permissions p
WHERE r.code = 'ORG_ADMIN' 
AND p.code IN ('USER_MANAGE', 'USER_VIEW', 'ROLE_VIEW', 'SYSTEM_VIEW', 'AUDIT_VIEW', 'ORG_MANAGE');

-- Assign view permissions to User role
INSERT INTO rbac.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac.roles r, rbac.permissions p
WHERE r.code = 'USER' 
AND p.code IN ('USER_VIEW', 'SYSTEM_VIEW');

-- Insert default system configuration
INSERT INTO system.configurations (key, value, description, category) VALUES
('system.name', 'EasyOps ERP', 'System name', 'general'),
('system.version', '1.0.0', 'System version', 'general'),
('system.timezone', 'UTC', 'Default timezone', 'general'),
('auth.password.min_length', '8', 'Minimum password length', 'security'),
('auth.password.require_uppercase', 'true', 'Require uppercase letters in password', 'security'),
('auth.password.require_lowercase', 'true', 'Require lowercase letters in password', 'security'),
('auth.password.require_numbers', 'true', 'Require numbers in password', 'security'),
('auth.password.require_symbols', 'true', 'Require symbols in password', 'security'),
('auth.session.timeout', '3600', 'Session timeout in seconds', 'security'),
('auth.max_login_attempts', '5', 'Maximum login attempts before lockout', 'security'),
('auth.lockout.duration', '900', 'Account lockout duration in seconds', 'security');

-- Create a default organization
INSERT INTO admin.organizations (name, code, description) VALUES
('EasyOps Demo Organization', 'DEMO_ORG', 'Default demo organization for testing');

-- Create a default system administrator user
-- Password: Admin123! (hashed with bcrypt)
INSERT INTO users.users (username, email, password_hash, first_name, last_name, is_active, is_verified) VALUES
('admin', 'admin@easyops.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'System', 'Administrator', true, true);

-- Assign system administrator role to admin user
INSERT INTO rbac.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users.users u, rbac.roles r
WHERE u.username = 'admin' AND r.code = 'SYSTEM_ADMIN';

-- Assign admin user to default organization
INSERT INTO users.user_organizations (user_id, organization_id, role, is_primary)
SELECT u.id, o.id, 'ADMIN', true
FROM users.users u, admin.organizations o
WHERE u.username = 'admin' AND o.code = 'DEMO_ORG';

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON admin.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON rbac.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON rbac.permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configurations_updated_at BEFORE UPDATE ON system.configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant all privileges to easyops_dev user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA admin TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA users TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA rbac TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA system TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO easyops_dev;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA admin TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA users TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA auth TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA rbac TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA system TO easyops_dev;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO easyops_dev;
