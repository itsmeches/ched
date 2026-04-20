<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\HandleCors as Middleware;
use Illuminate\Http\Request;

class HandleCors extends Middleware
{
    protected $crossOriginAllowOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
    
    protected $crossOriginAllowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
    
    protected $crossOriginAllowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'];

    protected function origins(): array
    {
        return $this->crossOriginAllowOrigins;
    }
}