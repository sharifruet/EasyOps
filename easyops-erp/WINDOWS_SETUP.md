# 🪟 Windows Setup Guide - EasyOps ERP

## ⚠️ Important: Start Docker Desktop First!

Before running the system, you **MUST** start Docker Desktop on Windows.

---

## 🚀 Complete Windows Setup

### **Step 1: Start Docker Desktop**

1. Open **Docker Desktop** application
2. Wait for Docker to fully start (whale icon in system tray should be stable)
3. Verify Docker is running:
   ```powershell
   docker --version
   docker ps
   ```

### **Step 2: Navigate to Project**

Open **PowerShell** or **Command Prompt**:

```powershell
cd C:\workspace\together\EasyOps\easyops-erp
```

### **Step 3: Start All Services**

**Option A - Using Batch File (Easiest):**
```cmd
start-docker.bat
```

**Option B - Using Docker Compose Directly:**
```powershell
docker-compose up -d
```

### **Step 4: Wait for Services**

Services will take **2-3 minutes** to fully start. You can monitor progress:

```powershell
# Watch all logs
docker-compose logs -f

# Or watch specific service
docker-compose logs -f frontend
```

### **Step 5: Access the Application**

Open your browser:
```
http://localhost:3000
```

Login with:
```
Username: admin
Password: Admin123!
```

---

## 📊 Verify Everything is Running

### **Check Container Status**

```powershell
docker-compose ps
```

You should see **15 containers** all showing "Up":
- postgres
- mongodb
- redis
- kafka
- zookeeper
- rabbitmq
- elasticsearch
- adminer
- eureka
- api-gateway
- user-management
- auth-service
- rbac-service
- organization-service
- frontend

### **Test Services**

**PowerShell:**
```powershell
# Test API Gateway
Invoke-WebRequest -Uri http://localhost:8081/actuator/health

# Test Auth Service
Invoke-WebRequest -Uri http://localhost:8083/api/auth/health

# Test Frontend
Invoke-WebRequest -Uri http://localhost:3000
```

**Or use curl (if installed):**
```powershell
curl http://localhost:3000
curl http://localhost:8081/actuator/health
curl http://localhost:8083/api/auth/health
```

---

## 🛠️ Management Commands

### **View Logs**

```powershell
# All services
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f auth-service
docker-compose logs -f postgres

# Last 50 lines
docker-compose logs --tail=50 frontend
```

### **Restart Services**

```powershell
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart frontend
docker-compose restart auth-service
```

### **Stop Services**

```powershell
# Using batch file
stop-docker.bat

# Or directly
docker-compose stop
```

### **Start Stopped Services**

```powershell
docker-compose start
```

### **Rebuild Services**

```powershell
# Rebuild specific service
docker-compose up -d --build frontend

# Rebuild all services
docker-compose up -d --build

# Force rebuild (no cache)
docker-compose build --no-cache frontend
```

---

## 🗑️ Cleanup Commands

### **Stop and Remove**

```powershell
# Stop and remove containers (keep data)
docker-compose down

# Stop and remove containers + volumes (DELETES DATA!)
docker-compose down -v

# Complete cleanup
docker-compose down -v --rmi all --remove-orphans
```

### **Clean Docker System**

```powershell
# Remove unused containers, networks, images
docker system prune

# Remove everything (including volumes)
docker system prune -a --volumes
```

---

## 🐛 Troubleshooting

### **Issue 1: Docker Desktop Not Running**

**Error:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/...
```

**Solution:**
1. Start Docker Desktop application
2. Wait for it to fully start (green light in system tray)
3. Try again: `docker ps`
4. Then run: `start-docker.bat`

### **Issue 2: Port Already in Use**

**Error:**
```
Bind for 0.0.0.0:3000 failed: port is already allocated
```

**Solution - Find and kill process:**

**PowerShell:**
```powershell
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Or change port in docker-compose.yml:**
```yaml
frontend:
  ports:
    - "3001:3000"  # Use 3001 instead
```

### **Issue 3: Services Won't Start**

```powershell
# Check Docker resources
docker info

# View detailed logs
docker-compose logs

# Restart Docker Desktop
# Then run: docker-compose up -d
```

### **Issue 4: Frontend Build Fails**

```powershell
# Remove old containers and rebuild
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

### **Issue 5: Database Not Initialized**

```powershell
# Stop everything and remove volumes
docker-compose down -v

# Start again (will reinitialize databases)
docker-compose up -d
```

### **Issue 6: Slow Performance**

1. Open **Docker Desktop Settings**
2. Go to **Resources**
3. Increase:
   - **CPUs**: 4 or more
   - **Memory**: 8GB or more
   - **Swap**: 2GB
4. Click **Apply & Restart**

---

## 📝 WSL2 Backend (Recommended)

For better performance on Windows:

1. Install **WSL2**:
   ```powershell
   wsl --install
   ```

2. In **Docker Desktop Settings**:
   - Go to **General**
   - Enable "**Use WSL 2 based engine**"
   - Click **Apply & Restart**

---

## 🔍 Useful Commands

### **Check Resource Usage**

```powershell
# Container stats
docker stats

# Disk usage
docker system df
```

### **Enter a Container**

```powershell
# Enter frontend container
docker-compose exec frontend sh

# Enter PostgreSQL
docker-compose exec postgres psql -U easyops -d easyops

# Enter MongoDB
docker-compose exec mongodb mongosh -u easyops -p easyops123

# Enter Redis
docker-compose exec redis redis-cli
```

### **View Container Details**

```powershell
# Inspect container
docker inspect easyops-frontend

# View container logs
docker logs easyops-frontend

# Follow container logs
docker logs -f easyops-frontend
```

---

## 📱 Access Services

Once everything is running:

### **Web Interfaces**
- **Main App**: http://localhost:3000
- **Eureka Dashboard**: http://localhost:8761
- **Adminer (Database)**: http://localhost:8080
  - Server: `postgres`
  - Username: `easyops`
  - Password: `easyops123`
  - Database: `easyops`
- **RabbitMQ Admin**: http://localhost:15672
  - Username: `easyops`
  - Password: `easyops123`

### **API Endpoints**
- **API Gateway**: http://localhost:8081
- **Auth Service**: http://localhost:8083
- **RBAC Service**: http://localhost:8084
- **User Service**: http://localhost:8082

---

## 🎯 Quick Test

After starting, test with PowerShell:

```powershell
# Test frontend
Start-Process "http://localhost:3000"

# Test API (if curl is installed)
curl http://localhost:8081/actuator/health

# Or use Invoke-WebRequest
Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing
```

---

## 🔄 Daily Workflow

### **Morning - Start Work**
```powershell
cd C:\workspace\together\EasyOps\easyops-erp
start-docker.bat
```

### **During Work - View Logs**
```powershell
docker-compose logs -f frontend
```

### **End of Day - Stop Services**
```powershell
stop-docker.bat
```

---

## 📊 Health Check Script

Create `health-check.bat`:

```batch
@echo off
echo Checking EasyOps ERP Services...
echo.

curl -s http://localhost:3000 >nul && echo Frontend: ✅ Running || echo Frontend: ❌ Not Running
curl -s http://localhost:8081/actuator/health >nul && echo API Gateway: ✅ Running || echo API Gateway: ❌ Not Running
curl -s http://localhost:8083/api/auth/health >nul && echo Auth Service: ✅ Running || echo Auth Service: ❌ Not Running
curl -s http://localhost:8761 >nul && echo Eureka: ✅ Running || echo Eureka: ❌ Not Running

echo.
pause
```

Run: `health-check.bat`

---

## 🎓 Pro Tips for Windows

1. **Use PowerShell ISE or Windows Terminal** for better experience
2. **Pin Docker Desktop** to taskbar for quick access
3. **Enable WSL2** for better performance
4. **Use VS Code** with Docker extension for container management
5. **Set Docker to start on Windows startup** in Docker Desktop settings

---

## 🆘 Common Windows Issues

### **Permission Denied**
Run PowerShell or Command Prompt as **Administrator**

### **Line Ending Issues**
If you edit files on Windows:
```powershell
# Configure Git to handle line endings
git config --global core.autocrlf true
```

### **Path Issues**
Use forward slashes in docker-compose.yml:
```yaml
./frontend/src  # ✅ Correct
.\frontend\src  # ❌ Wrong
```

### **Firewall Blocking**
If ports are blocked:
1. Open **Windows Defender Firewall**
2. Go to **Advanced Settings**
3. Add **Inbound Rules** for ports 3000, 8081, etc.

---

## ✅ Final Checklist

Before starting:
- [ ] Docker Desktop is installed
- [ ] Docker Desktop is running (green light in system tray)
- [ ] You can run `docker ps` without errors
- [ ] You're in the `easyops-erp` directory
- [ ] All files are present

After starting:
- [ ] Run `docker-compose ps` - shows all services "Up"
- [ ] Open http://localhost:3000 - frontend loads
- [ ] Can login with admin/Admin123!
- [ ] Dashboard shows statistics
- [ ] No errors in `docker-compose logs`

---

## 🎉 Success!

If you can access http://localhost:3000 and login, **congratulations!**

Your complete EasyOps ERP system is running in Docker! 🚀

---

## 🚀 Next Steps

1. Explore the dashboard
2. Create some test users
3. Try the search functionality
4. Check Eureka dashboard: http://localhost:8761
5. View database in Adminer: http://localhost:8080

---

**For more help, see:**
- `QUICKSTART.md` - Quick start guide
- `DOCKER_START.md` - Detailed Docker guide
- `FRONTEND_GUIDE.md` - Frontend documentation
- `COMPLETE_IMPLEMENTATION.md` - Full system overview

**Happy coding on Windows! 🪟🚀**

