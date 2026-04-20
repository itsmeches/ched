<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$client = new GuzzleHttp\Client(['base_uri' => 'http://127.0.0.1:8000']);

try {
    $response = $client->post('/api/auth/login', [
        'json' => [
            'email' => 'superadmin@cris.gov.ph',
            'password' => 'password'
        ]
    ]);
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Body: " . $response->getBody() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    if ($e->hasResponse()) {
        echo "Response: " . $e->getResponse()->getBody() . "\n";
    }
}