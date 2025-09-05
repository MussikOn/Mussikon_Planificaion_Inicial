# Arquitectura MVP - Mussikon

## Stack Tecnológico MÍNIMO

### Frontend (React Native)
```
React Native 0.72+
├── Navegación: React Navigation 6
├── UI: React Native Elements
├── Estado: React Context API
├── HTTP: Axios
└── Storage: AsyncStorage
```

### Backend (Node.js + Express)
```
Node.js 18+
├── Framework: Express.js
├── Base de datos: SQLite3
├── Autenticación: JWT
├── Validación: Joi
└── CORS: cors
```

### Base de Datos (SQLite)
```
SQLite (archivo local)
├── Tabla: users
├── Tabla: requests
├── Tabla: offers
├── Tabla: user_instruments
└── Tabla: admin_actions
```

---

## Estructura de Archivos

### Frontend (React Native)
```
src/
├── components/
│   ├── common/
│   ├── forms/
│   └── lists/
├── screens/
│   ├── auth/
│   ├── leader/
│   ├── musician/
│   └── admin/
├── navigation/
│   ├── AppNavigator.js
│   ├── AuthNavigator.js
│   └── TabNavigator.js
├── context/
│   ├── AuthContext.js
│   └── AppContext.js
├── services/
│   ├── api.js
│   └── auth.js
└── utils/
    ├── constants.js
    └── helpers.js
```

### Backend (Node.js)
```
server/
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── requestController.js
│   ├── offerController.js
│   └── adminController.js
├── models/
│   ├── User.js
│   ├── Request.js
│   ├── Offer.js
│   └── UserInstrument.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── requests.js
│   ├── offers.js
│   └── admin.js
├── middleware/
│   ├── auth.js
│   ├── validation.js
│   └── errorHandler.js
├── config/
│   ├── database.js
│   └── config.js
└── utils/
    ├── email.js
    └── helpers.js
```

---

## Base de Datos MVP

### Tabla: users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('leader', 'musician', 'admin') NOT NULL,
  status ENUM('active', 'pending', 'rejected') DEFAULT 'pending',
  church_name VARCHAR(255), -- Solo para líderes
  location VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: user_instruments
```sql
CREATE TABLE user_instruments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  instrument VARCHAR(100) NOT NULL,
  years_experience INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Tabla: requests
```sql
CREATE TABLE requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leader_id INTEGER NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_date DATETIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  description TEXT,
  required_instrument VARCHAR(100) NOT NULL,
  status ENUM('active', 'closed', 'cancelled') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES users(id)
);
```

### Tabla: offers
```sql
CREATE TABLE offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL,
  musician_id INTEGER NOT NULL,
  proposed_price DECIMAL(10,2) NOT NULL,
  availability_confirmed BOOLEAN DEFAULT FALSE,
  message TEXT,
  status ENUM('pending', 'selected', 'rejected') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES requests(id),
  FOREIGN KEY (musician_id) REFERENCES users(id)
);
```

### Tabla: admin_actions
```sql
CREATE TABLE admin_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  action ENUM('approve', 'reject', 'pending') NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## API Endpoints MVP

### Autenticación
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-email
POST /api/auth/logout
```

### Usuarios
```
GET /api/users/profile
PUT /api/users/profile
GET /api/users/:id
```

### Solicitudes
```
GET /api/requests
POST /api/requests
GET /api/requests/:id
PUT /api/requests/:id
DELETE /api/requests/:id
```

### Ofertas
```
GET /api/offers
POST /api/offers
GET /api/offers/:id
PUT /api/offers/:id/select
PUT /api/offers/:id/reject
```

### Administración
```
GET /api/admin/musicians
PUT /api/admin/musicians/:id/approve
PUT /api/admin/musicians/:id/reject
GET /api/admin/stats
```

---

## Pantallas MVP

### Autenticación
```
1. LoginScreen
2. RegisterScreen
3. EmailVerificationScreen
```

### Líderes
```
1. LeaderDashboardScreen
2. CreateRequestScreen
3. RequestDetailsScreen
4. OffersListScreen
5. OfferDetailsScreen
6. ProfileScreen
```

### Músicos
```
1. MusicianDashboardScreen
2. RequestsListScreen
3. RequestDetailsScreen
4. CreateOfferScreen
5. MyOffersScreen
6. ProfileScreen
```

### Administradores
```
1. AdminDashboardScreen
2. MusiciansListScreen
3. MusicianDetailsScreen
4. ValidationScreen
5. StatsScreen
```

---

## Navegación MVP

### AppNavigator
```javascript
const AppNavigator = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }
  
  if (user.role === 'admin') {
    return <AdminNavigator />;
  }
  
  return <MainTabNavigator />;
};
```

### TabNavigator
```javascript
const MainTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={DashboardScreen} />
    <Tab.Screen name="Requests" component={RequestsScreen} />
    <Tab.Screen name="Offers" component={OffersScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);
```

---

## Estado de la Aplicación

### AuthContext
```javascript
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  register: () => {}
});
```

### AppContext
```javascript
const AppContext = createContext({
  requests: [],
  offers: [],
  loading: false,
  error: null,
  fetchRequests: () => {},
  fetchOffers: () => {}
});
```

---

## Servicios MVP

### API Service
```javascript
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.token = null;
  }
  
  setToken(token) {
    this.token = token;
  }
  
  async request(endpoint, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    return response.json();
  }
}
```

### Auth Service
```javascript
class AuthService {
  async login(email, password) {
    const response = await api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (response.success) {
      this.setToken(response.token);
      await AsyncStorage.setItem('token', response.token);
    }
    
    return response;
  }
}
```

---

## Configuración MVP

### Configuración de Base de Datos
```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mussikon.db');

db.serialize(() => {
  // Crear tablas
  db.run('CREATE TABLE users (...)');
  db.run('CREATE TABLE requests (...)');
  db.run('CREATE TABLE offers (...)');
  // ...
});
```

### Configuración de Email
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

---

## Despliegue MVP

### Desarrollo Local
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm start
```

### Producción (Futuro)
```
- Backend: Heroku o Vercel
- Base de datos: PostgreSQL (migración de SQLite)
- Frontend: Expo Go o App Store
```

---

## Seguridad MVP

### Autenticación
- JWT tokens para autenticación
- Tokens expiran en 24 horas
- Refresh tokens para renovación

### Validación
- Validación de datos en frontend y backend
- Sanitización de inputs
- Validación de roles y permisos

### CORS
- Configuración CORS para desarrollo
- Whitelist de dominios permitidos

---

## Monitoreo MVP

### Logs Básicos
```javascript
console.log('User registered:', user.email);
console.log('Request created:', request.id);
console.log('Offer made:', offer.id);
```

### Métricas Básicas
- Usuarios registrados
- Solicitudes creadas
- Ofertas realizadas
- Validaciones completadas

---

## Conclusión

La arquitectura MVP de Mussikon está diseñada para ser:

1. **Simple:** Mínima complejidad posible
2. **Rápida:** Desarrollo en 4-6 semanas
3. **Escalable:** Fácil de expandir después
4. **Mantenible:** Código limpio y organizado

Con esta arquitectura, la app puede:
- Manejar usuarios y autenticación
- Gestionar solicitudes y ofertas
- Validar músicos
- Notificar eventos importantes

**Todo con tecnología simple y probada.**

## Referencias

- [Especificaciones MVP](./01-mvp-specifications.md)
- [Funcionalidades Core](./02-core-features.md)
- [Flujos de Usuario MVP](./03-user-flows-mvp.md)
