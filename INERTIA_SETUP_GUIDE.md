# Inertia.js Integration Complete

Your Laravel + React stack has been successfully configured to use **Inertia.js**!

## What's Been Set Up

### Backend (Laravel)

#### 1. **Dependencies Added**

- `inertiajs/inertia-laravel` - Laravel adapter
- `react`, `react-dom` - React library
- `@vitejs/plugin-react` - Vite React plugin
- `@inertiajs/react` - React adapter

**Files Updated:**

- `composer.json` - Added inertiajs/inertia-laravel
- `Backend/cris-backend/package.json` - Added React and Inertia dependencies

#### 2. **Configuration Files Created/Updated**

**New Files:**

- `app/Http/Middleware/HandleInertiaRequests.php` - Middleware to handle Inertia requests
- `resources/views/app.blade.php` - Root template for Inertia
- `resources/js/app.jsx` - Inertia app entry point
- `resources/js/Pages/Auth/Login.jsx` - Login page component
- `resources/js/Pages/Dashboard/Index.jsx` - Dashboard page component
- `resources/js/Components/Layout.jsx` - Layout component
- `app/Http/Controllers/AuthController.php` - Authentication controller (Inertia version)
- `app/Http/Controllers/DashboardController.php` - Dashboard controller

**Updated Files:**

- `bootstrap/app.php` - Added HandleInertiaRequests middleware
- `vite.config.js` - Updated to use React plugin
- `routes/web.php` - Converted to Inertia routes

### Frontend (React - Already Configured)

The frontend React app will now communicate with the backend through Inertia instead of direct API calls.

**Package Updated:**

- `Frontend/package.json` - Added `@inertiajs/react`

## Directory Structure

```
Backend/cris-backend/
├── resources/
│   ├── js/
│   │   ├── app.jsx (Entry point)
│   │   ├── bootstrap.js (Axios setup)
│   │   ├── Pages/
│   │   │   ├── Auth/
│   │   │   │   └── Login.jsx
│   │   │   └── Dashboard/
│   │   │       └── Index.jsx
│   │   └── Components/
│   │       └── Layout.jsx
│   ├── views/
│   │   └── app.blade.php (Root template)
│   └── css/
│       └── app.css
├── app/
│   ├── Http/
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php
│   │   └── Controllers/
│   │       ├── AuthController.php
│   │       └── DashboardController.php
├── routes/
│   ├── web.php (Inertia routes)
│   └── api.php (Keep API routes if needed)
```

## Next Steps

### 1. Install Dependencies

**Backend:**

```bash
cd Backend/cris-backend
npm install
composer update
```

**Frontend:**

```bash
cd Frontend
npm install
```

### 2. Run Development Servers

**Backend (in Backend/cris-backend):**

```bash
npm run dev
```

In another terminal:

```bash
php artisan serve
```

**Frontend:**
Currently, you can keep the frontend in sync with the backend, or merge them since Inertia handles the UI.

### 3. Create Database & Migrate

```bash
cd Backend/cris-backend
php artisan migrate
```

### 4. Access Your Application

- Navigate to: `http://localhost:8000`
- Login with your credentials
- You'll be redirected to the Dashboard

## How Inertia Works in Your Setup

### 1. **Request Flow**

```
User Action → Laravel Route → Controller (Inertia::render())
  → React Component → User Interface
```

### 2. **Data Flow**

- Backend passes data via `Inertia::render('Page', ['data' => $data])`
- React components receive data via props
- Forms submit to backend routes automatically

### 3. **Example: Login Flow**

**Backend Route (routes/web.php):**

```php
Route::post('/login', [AuthController::class, 'store']);
```

**Backend Controller (app/Http/Controllers/AuthController.php):**

```php
return Inertia::render('Auth/Login');
```

**React Component (resources/js/Pages/Auth/Login.jsx):**

```jsx
const { data, post, processing } = useForm({
  email: "",
  password: "",
});

post(route("login")); // Posts to backend
```

## Key Features of Your New Setup

✅ **Full Stack React** - Write UI entirely in React/JSX
✅ **Server-Side Routing** - Laravel handles all routing
✅ **Automatic CSRF Protection** - Inertia handles CSRF tokens
✅ **Shared Props** - Auth data shared automatically
✅ **Form Validation** - Errors passed from backend to frontend
✅ **Code Splitting** - Vite automatically splits pages
✅ **Hot Module Replacement** - Fast development with HMR

## Converting Existing API Routes

Your existing API routes in `routes/api.php` can coexist with Inertia routes. To convert an API endpoint to Inertia:

**Before (API):**

```php
Route::get('/proposals', [ResearchProposalController::class, 'index']);
// Returns JSON
```

**After (Inertia):**

```php
Route::get('/proposals', [ResearchProposalController::class, 'index']);
// In Controller:
return Inertia::render('Proposals/Index', [
    'proposals' => $proposals,
]);
```

## Creating New Inertia Pages

1. Create a new React component in `resources/js/Pages/`
2. Create a controller method returning `Inertia::render('PageName')`
3. Add route in `routes/web.php`

**Example:**

```jsx
// resources/js/Pages/Proposals/Index.jsx
export default function ProposalsList({ proposals }) {
  return (
    <div>
      {proposals.map((p) => (
        <div key={p.id}>{p.title}</div>
      ))}
    </div>
  );
}
```

```php
// routes/web.php
Route::get('/proposals', [ProposalController::class, 'index']);

// app/Http/Controllers/ProposalController.php
public function index() {
  return Inertia::render('Proposals/Index', [
    'proposals' => auth()->user()->proposals,
  ]);
}
```

## Troubleshooting

**Issue: Components not found**

- Ensure file paths match the `resolve` pattern in `app.jsx`
- Check file exists in `resources/js/Pages/`

**Issue: Props not passing**

- Verify `HandleInertiaRequests` middleware is registered
- Check controller returns `Inertia::render()`

**Issue: Styles not loading**

- Run `npm run build` to compile Tailwind
- Ensure `@vite` directive in `app.blade.php`

## Documentation

- **Inertia.js Docs**: https://inertiajs.com
- **Laravel Docs**: https://laravel.com/docs
- **React Docs**: https://react.dev

---

**Your CHED application is now ready for full-stack Inertia development! 🚀**
