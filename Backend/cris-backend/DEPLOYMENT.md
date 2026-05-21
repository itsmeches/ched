# CRIS Deployment Checklist

Target: Ubuntu 22.04 LTS, PHP 8.2+, MySQL 8, Nginx, Supervisor.

## 1. Server prep

- [ ] PHP 8.2+ with extensions: `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `gd`, `mbstring`, `mysql`, `openssl`, `pdo`, `tokenizer`, `xml`, `zip`, `intl`.
- [ ] Composer 2.x, Node 18+, npm.
- [ ] MySQL 8 with a dedicated DB user (no root). UTF8MB4 collation.
- [ ] Nginx + TLS (Let's Encrypt). HTTP/2 enabled. HSTS once stable.

## 2. Clone & install

```bash
git clone <repo> /var/www/cris && cd /var/www/cris/Backend/cris-backend
composer install --no-dev --optimize-autoloader
npm ci && npm run build
cp .env.production.example .env
php artisan key:generate
```

## 3. Configure `.env`

- [ ] Set `APP_URL` to the real HTTPS host.
- [ ] Set DB credentials.
- [ ] Set `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` to the real host.
- [ ] Confirm `APP_DEBUG=false`, `SESSION_ENCRYPT=true`, `SESSION_SECURE_COOKIE=true`.
- [ ] Set real SMTP (`MAIL_*`).
- [ ] Never commit the live `.env`.

## 4. Database

```bash
php artisan migrate --force
php artisan db:seed --force   # only the seeders meant for prod
```

## 5. Storage

- [ ] `php artisan storage:link` (links `public/storage` → `storage/app/public`).
- [ ] **Do NOT** symlink `storage/app/private`. Research PDFs live there and are served only through the controller after policy check.
- [ ] If migrating off the legacy public disk: `php artisan research:migrate-files --dry-run`, review, then run without `--dry-run`.
- [ ] `chown -R www-data:www-data storage bootstrap/cache && chmod -R ug+rwX storage bootstrap/cache`.

## 6. Cache & autoload

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

Re-run after every deploy.

## 7. Queue worker (Supervisor)

- [ ] Install `supervisor`.
- [ ] Copy `deployment/supervisor/cris-worker.conf` to `/etc/supervisor/conf.d/`.
- [ ] `supervisorctl reread && supervisorctl update && supervisorctl start cris-worker:*`.

### Failed-job runbook

Mail/notification jobs use `tries=3` with backoff. After exhausting retries they land in `failed_jobs` (table created by the standard jobs migration).

- Inspect: `php artisan queue:failed`
- Retry one: `php artisan queue:retry <uuid>`
- Retry all: `php artisan queue:retry all`
- Discard: `php artisan queue:flush`

A sudden spike in `failed_jobs` usually means SMTP credentials expired or the mail provider is rate-limiting. Worth alerting on.

## 8. Scheduler (cron)

Add to `www-data`'s crontab:

```
* * * * * cd /var/www/cris/Backend/cris-backend && php artisan schedule:run >> /dev/null 2>&1
```

## 9. Nginx

- [ ] Document root: `/var/www/cris/Backend/cris-backend/public`.
- [ ] Pass to PHP-FPM, send all to `index.php`.
- [ ] Force HTTPS, enable HSTS once verified.
- [ ] Increase `client_max_body_size` to match PDF upload limit (e.g. `25M`).

## 10. Post-deploy smoke test

- [ ] `php artisan about` shows `env=production`, `debug=false`.
- [ ] Login throttling triggers after 5 failed attempts.
- [ ] Research PDF download works for an authorized user; returns 403 for an unauthorized one.
- [ ] Queue jobs are draining (`supervisorctl tail cris-worker stdout`).
- [ ] Scheduled tasks run (check `storage/logs/laravel.log`).
- [ ] Mail sends through SMTP (test password reset).

## 11. Routine ops

- Deploys: `git pull && composer install --no-dev -o && npm ci && npm run build && php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache && supervisorctl restart cris-worker:*`
- Backups: nightly `mysqldump` + `storage/app/private` snapshot.
- Logs: rotate `storage/logs/laravel.log` (already daily via `LOG_STACK=daily`).
