# EasyOps ERP Frontend

Modern React 19 frontend application for EasyOps ERP system.

## 🚀 Features

- ⚡ **React 19** - Latest React features
- 🎨 **Material-UI** - Beautiful, responsive UI components
- 🔐 **Authentication** - Complete auth flow with JWT
- 📱 **Responsive Design** - Works on all devices
- 🎯 **TypeScript** - Type-safe code
- ⚡ **Vite** - Lightning-fast development
- 🔄 **Auto Refresh** - Token refresh on expiry
- 📊 **Dashboard** - Real-time statistics
- 👥 **User Management** - Full CRUD operations
- 🛡️ **RBAC** - Role-based access control UI

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- Backend services running on port 8081

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8081
VITE_APP_NAME=EasyOps ERP
VITE_APP_VERSION=1.0.0
```

## 📁 Project Structure

```
src/
├── components/         # Reusable components
│   ├── Layout/        # Layout components
│   └── ProtectedRoute.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── pages/             # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── Users.tsx
├── services/          # API services
│   ├── api.ts
│   ├── authService.ts
│   ├── userService.ts
│   └── rbacService.ts
├── types/             # TypeScript types
│   └── index.ts
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## 🔐 Default Credentials

```
Username: admin
Password: Admin123!
```

## 🎯 Available Routes

- `/login` - Login page
- `/dashboard` - Dashboard (protected)
- `/users` - User management (protected)
- `/roles` - Role management (protected)
- `/permissions` - Permission management (protected)

## 🚀 Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 📦 Building for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker

```bash
# Build Docker image
docker build -f Dockerfile.dev -t easyops-frontend .

# Run container
docker run -p 3000:3000 easyops-frontend
```

## 🔗 API Integration

The frontend connects to the backend API gateway at `http://localhost:8081`.

All API requests are automatically:
- ✅ Authenticated with JWT tokens
- ✅ Refreshed when tokens expire
- ✅ Redirected to login on 401 errors

## 📱 Screenshots

(Add screenshots here)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

For issues and questions, please open an issue on GitHub.

