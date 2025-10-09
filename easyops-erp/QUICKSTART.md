# 🚀 Quick Start - EasyOps ERP Complete System

## ⚡ 5-Minute Setup

### **Step 1: Start Backend Services**

```bash
cd easyops-erp

# Start all backend infrastructure
docker-compose up -d postgres mongodb redis eureka api-gateway auth-service rbac-service user-management

# Wait 30 seconds for services to initialize
```

### **Step 2: Start Frontend**

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

### **Step 3: Access the Application**

Open your browser and go to:
```
http://localhost:3000
```

### **Step 4: Login**

```
Username: admin
Password: Admin123!
```

**That's it!** 🎉 You're now using EasyOps ERP!

---

## 📋 What You Can Do

### ✅ **Available Features:**

1. **Dashboard**
   - View system statistics
   - See total users, active/inactive counts
   - System information display

2. **User Management**
   - View all users in a table
   - Search users by name, email, or username
   - Create new users
   - Activate/deactivate users
   - Delete users
   - Pagination support

3. **Navigation**
   - Responsive sidebar
   - Mobile-friendly menu
   - User profile dropdown
   - Quick logout

---

## 🎯 Quick Actions

### **Create a New User**

1. Click "**Users**" in the sidebar
2. Click "**Add User**" button
3. Fill in the form:
   - Username (required)
   - Email (required)
   - Password (required)
   - First Name (optional)
   - Last Name (optional)
4. Click "**Create**"

### **Search Users**

1. Go to Users page
2. Type in the search box
3. Press Enter or click Search
4. Results update automatically

### **Activate/Deactivate User**

1. Go to Users page
2. Click the status chip (Active/Inactive)
3. User status toggles instantly

---

## 🔧 Service URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Running |
| API Gateway | http://localhost:8081 | ✅ Running |
| Eureka | http://localhost:8761 | ✅ Running |
| Auth Service | http://localhost:8083 | ✅ Running |
| RBAC Service | http://localhost:8084 | ✅ Running |
| User Management | http://localhost:8082 | ✅ Running |

---

## 🐛 Troubleshooting

### **Frontend Won't Start**

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### **Can't Login**

1. Check backend is running:
   ```bash
   curl http://localhost:8083/api/auth/health
   ```

2. Check database:
   ```bash
   docker-compose ps postgres
   ```

3. Reset admin password:
   - See database initialization script

### **Port Already in Use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
```

---

## 🎨 Explore the UI

### **Login Page**
- Beautiful gradient purple design
- Username/email input
- Password with show/hide toggle
- Demo credentials displayed

### **Dashboard**
- Welcome message with your name
- 4 statistic cards
- System information panel
- Quick actions panel

### **Users Page**
- Data table with all users
- Search bar at top
- Add User button
- Status chips (clickable)
- Edit and Delete icons
- Pagination at bottom

---

## 📊 Test the APIs

### **Test Authentication**

```bash
# Login
curl -X POST http://localhost:8083/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin","password":"Admin123!"}'

# Save the token from response and use it:
export TOKEN="<your-access-token>"

# Validate token
curl -X GET http://localhost:8083/api/auth/validate \
  -H "Authorization: Bearer $TOKEN"
```

### **Test User Management**

```bash
# Get all users
curl http://localhost:8082/api/users

# Get user stats
curl http://localhost:8082/api/users/stats
```

### **Test RBAC**

```bash
# Get all roles
curl http://localhost:8084/api/rbac/roles

# Get all permissions
curl http://localhost:8084/api/rbac/permissions
```

---

## 🎓 Learn More

- **Frontend Guide**: See `FRONTEND_GUIDE.md`
- **Backend Guide**: See `PHASE_0.2_IMPLEMENTATION.md`
- **Testing Guide**: See `TESTING_GUIDE.md`
- **Complete Docs**: See `COMPLETE_IMPLEMENTATION.md`

---

## 🛑 Stop Services

### **Stop Frontend**
```bash
# Press Ctrl+C in the terminal running npm run dev
```

### **Stop Backend**
```bash
cd easyops-erp
docker-compose down
```

### **Stop Everything and Clean Up**
```bash
docker-compose down -v  # Also removes volumes
```

---

## 📱 Mobile View

The application is fully responsive!

1. Open http://localhost:3000 on your phone
2. Or use browser DevTools:
   - Press F12
   - Click device toggle icon
   - Select a mobile device
3. Sidebar becomes a hamburger menu
4. All features work on mobile

---

## 🎉 What's Next?

### **Explore:**
1. Create 5-10 test users
2. Try searching users
3. Activate/deactivate users
4. Check the dashboard stats update
5. Try logging out and back in
6. Test on mobile view

### **Develop:**
1. Add role management page
2. Add permission management page
3. Customize the theme colors
4. Add your company logo
5. Implement user edit feature

---

## 💡 Pro Tips

1. **Use Chrome DevTools** - Network tab to see API calls
2. **Check Redux DevTools** - (if implemented) for state
3. **Use React DevTools** - To inspect components
4. **Monitor Logs** - `docker-compose logs -f <service>`
5. **Test Eureka** - http://localhost:8761 to see all services

---

## 🆘 Need Help?

1. Check the error message in browser console (F12)
2. Check backend logs: `docker-compose logs -f`
3. Verify all services are up: `docker-compose ps`
4. Review documentation files
5. Check API responses in Network tab

---

## ✅ Checklist

Before you start:
- [ ] Docker is installed and running
- [ ] Node.js 20+ is installed
- [ ] Ports 3000, 8081-8085, 5432, 27017, 6379 are free
- [ ] You're in the `easyops-erp` directory

After starting:
- [ ] All Docker containers are running
- [ ] Frontend is running on port 3000
- [ ] You can access http://localhost:3000
- [ ] You can login with admin/Admin123!
- [ ] Dashboard shows statistics
- [ ] Users page shows the admin user

---

## 🎊 Success!

If you see the dashboard with statistics, **congratulations!** 

Your complete EasyOps ERP system is running with:
- ✅ 6 Backend microservices
- ✅ React 19 frontend
- ✅ PostgreSQL database
- ✅ MongoDB database
- ✅ Redis caching
- ✅ Service discovery
- ✅ API Gateway
- ✅ Full authentication

**Enjoy exploring your new ERP system!** 🚀

---

**Questions? Check the detailed guides in the project root.**

