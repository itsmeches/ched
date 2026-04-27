<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * Do not emit a JS-readable XSRF-TOKEN cookie.
     * CSRF is transported via X-CSRF-TOKEN and synchronized from Inertia props.
     */
    protected $addHttpCookie = false;
}
