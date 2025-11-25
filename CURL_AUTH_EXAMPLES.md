# CURL Authentication Examples for EasyOps ERP

## Quick Authentication

### Method 1: Using the JSON file (Recommended for Windows)

I've created a `login-request.json` file with the default admin credentials. Use it like this:

```powershell
curl.exe -X POST http://localhost:8083/api/auth/login `
  -H "Content-Type: application/json" `
  -d @login-request.json
```

### Method 2: Using PowerShell with escaped JSON

```powershell
$body = @{
    usernameOrEmail = "admin"
    password = "Admin123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:8083/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### Method 3: Using curl.exe with inline JSON (PowerShell)

```powershell
curl.exe -X POST http://localhost:8083/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"usernameOrEmail\":\"admin\",\"password\":\"Admin123!\"}'
```

### Method 4: Using curl.exe with single quotes (Git Bash/WSL)

```bash
curl -X POST http://localhost:8083/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail": "admin", "password": "Admin123!"}'
```

## Service Endpoints

- **Auth Service (Direct)**: `http://localhost:8083/api/auth`
- **API Gateway**: `http://localhost:8081/api/auth`

## Default Credentials

- **Username**: `admin`
- **Password**: `Admin123!`
- **Email**: `admin@easyops.com`

## Successful Login Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000,
  "userId": "39915ce7-e756-43ee-aa80-3dcf53abd199",
  "username": "admin",
  "email": "admin@easyops.com",
  "firstName": "System",
  "lastName": "Administrator",
  "roles": [],
  "permissions": []
}
```

## Using the Access Token

After successful login, use the `accessToken` in subsequent requests:

```powershell
$token = "YOUR_ACCESS_TOKEN_HERE"

# Validate token
curl.exe -X GET http://localhost:8083/api/auth/validate `
  -H "Authorization: Bearer $token"

# Example: Get users (via API Gateway)
curl.exe -X GET http://localhost:8081/api/users `
  -H "Authorization: Bearer $token"
```

## Health Check

Test if the auth service is running:

```powershell
curl.exe -X GET http://localhost:8083/api/auth/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "Authentication Service"
}
```

## Notes

- The auth service runs on port **8083** when started locally
- Access tokens expire after 24 hours (86400000 milliseconds)
- Refresh tokens expire after 7 days
- Use the API Gateway (port 8081) for service discovery in production scenarios
- Use direct auth service (port 8083) for development/testing

