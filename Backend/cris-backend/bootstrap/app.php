<?php

use Illuminate\Http\Request;
use App\Http\Middleware\LogApiRequests;
use App\Http\Middleware\SecureHeaders;
use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Inertia\Inertia;
use Illuminate\Support\Facades\Vite;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);

        $middleware->web(append: [
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->web(replace: [
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class => VerifyCsrfToken::class,
            ValidateCsrfToken::class => VerifyCsrfToken::class,
        ]);

        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        $middleware->api(append: [
            LogApiRequests::class,
        ]);

        $middleware->web(append: [
            SecureHeaders::class,
        ]);

        $middleware->api(append: [
            SecureHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request, \Throwable $exception) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (ValidationException $exception, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            return response()->json([
                'message' => 'The provided data is invalid.',
                'status' => $exception->status,
                'errors' => $exception->errors(),
            ], $exception->status);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            return response()->json([
                'message' => 'Authentication is required to access this resource.',
                'status' => 401,
            ], 401);
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            return response()->json([
                'message' => $exception->getMessage() ?: 'You do not have permission to perform this action.',
                'status' => 403,
            ], 403);
        });

        $exceptions->render(function (ThrottleRequestsException $exception, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            return response()->json([
                'message' => 'Too many attempts. Please try again later.',
                'status' => 429,
            ], 429, $exception->getHeaders());
        });

        $exceptions->render(function (NotFoundHttpException $exception, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            return response()->json([
                'message' => 'The requested resource was not found.',
                'status' => 404,
            ], 404);
        });

        $exceptions->render(function (\Throwable $exception, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            $status = $exception instanceof HttpExceptionInterface
                ? $exception->getStatusCode()
                : 500;

            if ($status < 400 || $status > 599) {
                $status = 500;
            }

            return response()->json([
                'message' => $status === 500
                    ? 'An unexpected server error occurred.'
                    : ($exception->getMessage() ?: 'Request failed.'),
                'status' => $status,
            ], $status);
        });

        $exceptions->respond(function (SymfonyResponse $response, \Throwable $exception, Request $request) {
            $applySecurityHeaders = function (SymfonyResponse $targetResponse) use ($request): SymfonyResponse {
                $targetResponse->headers->set('X-Frame-Options', 'SAMEORIGIN');
                $targetResponse->headers->set('X-Content-Type-Options', 'nosniff');
                $targetResponse->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
                $targetResponse->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
                $targetResponse->headers->remove('X-Powered-By');

                Vite::useCspNonce();
                $nonce = Vite::cspNonce();
                $isLocal = app()->environment('local');
                $viteOrigins = " http://127.0.0.1:5173 http://localhost:5173";
                $viteConnect = " ws://127.0.0.1:5173 ws://localhost:5173";
                $localStyleUnsafeInline = $isLocal ? " 'unsafe-inline'" : '';

                $scriptSrc = "'self' 'nonce-{$nonce}'" . ($isLocal ? $viteOrigins : '');
                $styleSrc = "'self' 'nonce-{$nonce}' https://fonts.bunny.net{$localStyleUnsafeInline}" . ($isLocal ? $viteOrigins : '');
                $connectSrc = "'self'" . ($isLocal ? $viteOrigins . $viteConnect : '');
                $targetResponse->headers->set(
                    'Content-Security-Policy',
                    "default-src 'self'; script-src {$scriptSrc}; style-src {$styleSrc}; style-src-attr 'unsafe-inline'; font-src 'self' https://fonts.bunny.net data:; img-src 'self' data: blob:; connect-src {$connectSrc}; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
                );

                if ($request->isSecure()) {
                    $targetResponse->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
                }

                if ($targetResponse->isRedirection()) {
                    $targetResponse->setContent('');
                    $targetResponse->headers->set('Content-Length', '0');
                }

                return $targetResponse;
            };

            $response = $applySecurityHeaders($response);

            if ($request->is('api/*') || $request->expectsJson()) {
                return $response;
            }

            $status = $response->getStatusCode();

            if (! in_array($status, [403, 404], true)) {
                return $response;
            }

            $inertiaResponse = Inertia::render('Error', [
                'status' => $status,
            ])->toResponse($request)->setStatusCode($status);

            return $applySecurityHeaders($inertiaResponse);
        });
    })->create();
