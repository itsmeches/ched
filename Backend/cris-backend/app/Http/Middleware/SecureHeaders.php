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
        $scriptSrc = $isLocal
            ? "'self' 'unsafe-inline' 'unsafe-eval'{$viteOrigins}"
            : "'self' 'nonce-{$nonce}'";
        $styleSrc = $isLocal
            ? "'self' 'unsafe-inline' https://fonts.bunny.net{$viteOrigins}"
            : "'self' 'nonce-{$nonce}' https://fonts.bunny.net";
        $connectSrc = "'self'" . ($isLocal ? $viteOrigins . $viteConnect : '');

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->remove('X-Powered-By');

        // Strict CSP baseline without unsafe-inline; nonce enables framework-managed inline tags.
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'self'; script-src {$scriptSrc}; style-src {$styleSrc}; style-src-attr 'unsafe-inline'; font-src 'self' https://fonts.bunny.net data:; img-src 'self' data: blob:; connect-src {$connectSrc}; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
        );

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        if ($response->isRedirection()) {
            $response->setContent('');
            $response->headers->set('Content-Length', '0');
        }

        return $response;
    }
}
