# Calabarzon Research Information System (CRIS) - Backend

## Overview

This is the Laravel 11 backend API for the Calabarzon Research Information System (CRIS). It provides authentication and CRUD operations for research proposals and institutions.

## Requirements

- PHP 8.2+
- Composer
- MySQL (via XAMPP)
- Laravel 11

## Setup

### 1. Install Dependencies

```bash
composer install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cris_db
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Create Database

```sql
CREATE DATABASE cris_db;
```

### 4. Run Migrations & Seed

```bash
php artisan migrate
php artisan db:seed
```

### 5. Start Server

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

## API Endpoints

### Authentication

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| POST   | `/api/auth/login`  | Login            |
| POST   | `/api/auth/logout` | Logout           |
| GET    | `/api/auth/me`     | Get current user |

### Research Proposals

| Method | Endpoint                     | Description     |
| ------ | ---------------------------- | --------------- |
| GET    | `/api/proposals`             | List proposals  |
| POST   | `/api/proposals`             | Create proposal |
| GET    | `/api/proposals/{id}`        | View proposal   |
| PUT    | `/api/proposals/{id}`        | Update proposal |
| DELETE | `/api/proposals/{id}`        | Delete proposal |
| POST   | `/api/proposals/{id}/review` | Review proposal |

### Institutions

| Method | Endpoint                 | Description        |
| ------ | ------------------------ | ------------------ |
| GET    | `/api/institutions`      | List institutions  |
| POST   | `/api/institutions`      | Create institution |
| GET    | `/api/institutions/{id}` | View institution   |
| PUT    | `/api/institutions/{id}` | Update institution |
| DELETE | `/api/institutions/{id}` | Delete institution |

## Test Users

| Role        | Email                    | Password   |
| ----------- | ------------------------ | ---------- |
| Super Admin | `superadmin@cris.gov.ph` | `password` |
| CHED        | `ched@cris.gov.ph`       | `password` |
| HEI         | `hei@edu.ph`             | `password` |

## Project Structure

```
cris-backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── InstitutionController.php
│   │   └── ResearchProposalController.php
│   └── Models/
│       ├── User.php
│       ├── Institution.php
│       └── ResearchProposal.php
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/
    └── api.php
```

## Technology Stack

- Laravel 11
- Laravel Sanctum (API Authentication)
- MySQL
- XAMPP (Development)

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
