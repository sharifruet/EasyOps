# EasyOps ERP - Quick Start Guide

## 🚀 **Deploy in 3 Steps**

### **Step 1: Run Deployment Script**

**Option A - PowerShell (Recommended):**
```powershell
cd C:\workspace\together\EasyOps\easyops-erp
.\deploy-all.ps1
```

**Option B - Batch File (Simpler):**
```cmd
cd C:\workspace\together\EasyOps\easyops-erp
deploy-all.bat
```

**Option C - Docker Compose (Manual):**
```powershell
cd C:\workspace\together\EasyOps\easyops-erp
docker-compose up -d --build
```

### **Step 2: Wait for Services to Start**

⏱️ **Wait 2-3 minutes** for all services to build and start.

Watch the deployment progress in the terminal.

### **Step 3: Access the Application**

🌐 Open your browser and go to: **http://localhost:3000**

📧 Login with:
- **Email**: admin@easyops.com
- **Password**: Admin123!

---

## ✅ **Verify Deployment**

Run the verification script:

```powershell
.\verify-deployment.ps1
```

This will check:
- ✓ All 12 microservices are running
- ✓ Services are registered with Eureka
- ✓ Frontend is accessible
- ✓ Database and cache are operational

---

## 🎯 **What You Get**

### **12 Microservices Running:**
1. Eureka (Service Discovery) - Port 8761
2. API Gateway - Port 8081
3. User Management - Port 8082
4. Auth Service - Port 8083
5. RBAC Service - Port 8084
6. Organization Service - Port 8085
7. Notification Service - Port 8086
8. Monitoring Service - Port 8087
9. Accounting Service - Port 8088
10. AR Service - Port 8090
11. AP Service - Port 8091
12. Bank Service - Port 8092

### **Frontend Application:**
- React-based modern UI
- 14 functional pages
- 7 accounting pages ready to use

### **Infrastructure:**
- PostgreSQL Database
- Redis Cache
- Prometheus Monitoring
- Grafana Dashboards

---

## 📊 **Explore the Application**

### **After Login, Navigate To:**

1. **Dashboard** - System overview
2. **Organizations** - Multi-tenancy management
3. **Accounting Menu** (7 pages):
   - Chart of Accounts
   - Journal Entry
   - Trial Balance
   - Customer Invoices
   - Vendor Bills
   - Bank Reconciliation
   - Aging Reports
4. **Users** - User management
5. **Roles** - Role management
6. **Permissions** - Permission management

---

## 🔧 **Common Commands**

### **View Status:**
```powershell
docker-compose ps
```

### **View Logs:**
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ar-service
```

### **Restart a Service:**
```powershell
docker-compose restart ar-service
```

### **Stop All Services:**
```powershell
docker-compose down
```

### **Fresh Start (Remove All Data):**
```powershell
docker-compose down -v
.\deploy-all.ps1
```

---

## 🌐 **Important URLs**

### **Application:**
- **Frontend**: http://localhost:3000

### **Service Dashboards:**
- **Eureka**: http://localhost:8761
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Adminer (DB)**: http://localhost:8080

### **API Documentation (Swagger):**
- **API Gateway**: http://localhost:8081/swagger-ui.html
- **Accounting**: http://localhost:8088/swagger-ui.html
- **AR Service**: http://localhost:8090/swagger-ui.html
- **AP Service**: http://localhost:8091/swagger-ui.html
- **Bank Service**: http://localhost:8092/swagger-ui.html

---

## 🐛 **Troubleshooting**

### **Services Not Starting?**
1. Check Docker Desktop is running
2. Wait 2-3 minutes for full startup
3. Check logs: `docker-compose logs service-name`
4. Restart: `docker-compose restart service-name`

### **Frontend Not Loading?**
1. Wait 1 more minute (frontend takes time to build)
2. Hard refresh: Ctrl + Shift + R
3. Check logs: `docker-compose logs frontend`
4. Rebuild: `docker-compose up -d --build frontend`

### **Port Already in Use?**
1. Check running processes: `netstat -ano | findstr :3000`
2. Kill process or change port in docker-compose.yml

### **Out of Memory?**
1. Increase Docker Desktop memory (Settings → Resources)
2. Recommended: 8GB minimum
3. Restart Docker Desktop

---

## 🎉 **Success!**

If everything is running:
- ✅ 12 services show as "running" or "healthy"
- ✅ Frontend loads at http://localhost:3000
- ✅ You can login and navigate
- ✅ Eureka shows 11 registered services

**You're ready to use your complete ERP system!** 🚀

---

## 📚 **Next Steps**

1. **Explore the UI** - Navigate through all pages
2. **Create Test Data** - Add customers, vendors, invoices
3. **Try Workflows** - Create and post transactions
4. **Monitor System** - Check Grafana dashboards
5. **Review Documentation** - See DEPLOYMENT_GUIDE.md for details

---

## 📞 **Need Help?**

- Check logs: `docker-compose logs -f`
- Verify deployment: `.\verify-deployment.ps1`
- Review: `DEPLOYMENT_GUIDE.md`
- Check Eureka: http://localhost:8761

---

**Happy ERP management!** 💼✨

