<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecureHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        Vite::useCspNonce();

        /** @var Response $response */
        $response = $next($request);

        $nonce = Vite::cspNonce();
        $isLocal = app()->environment('local');
        $viteOrigins = " http://127.0.0.1:5173 http://localhost:5173";
        $viteConnect = " ws://127.0.0.1:5173 ws://localhost:5173";
        // Dev mode allows unsafe-inline/eval for Vite HMR and dev speed.
        // Production uses strict nonce-based CSP (no unsafe-*) for security.
        // Vite does NOT need 'unsafe-eval' (it uses ES modules with source maps).
        // Keep 'unsafe-inline' for dev so Vite HMR injection works, but production uses nonce.
        $scriptSrc = $isLocal
            ? "'self' 'unsafe-inline'{$viteOrigins}"
            : "'self' 'nonce-{$nonce}'";
        $styleSrc = $isLocal
            ? "'self' 'unsafe-inline' https://fonts.bunny.net{$viteOrigins}"
            : "'self' 'nonce-{$nonce}' https://fonts.bunny.net";
        $connectSrc = "'self'" . ($isLocal ? $viteOrigins . $viteConnect : '');
        $upgradeInsecure = $isLocal ? '' : '; upgrade-insecure-requests';

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        // Strict CSP baseline: nonce-based in production, dev allows unsafe-* for Vite HMR.
        // style-src-attr 'unsafe-inline' is required for Ant Design component inline styles.
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; script-src {$scriptSrc}; style-src {$styleSrc}; style-src-attr 'unsafe-inline'; font-src 'self' https://fonts.bunny.net data:; img-src 'self' data: blob:; connect-src {$connectSrc}; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'{$upgradeInsecure}"
        );

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
