<?php

declare(strict_types=1);

require __DIR__ . '/../../vendor/autoload.php';

$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

if (! app()->environment(['local', 'testing'])) {
    fwrite(STDERR, "This script is restricted to local/testing environments.\n");
    exit(1);
}

$client = new GuzzleHttp\Client(['base_uri' => 'http://127.0.0.1:8000']);

try {
    $response = $client->post('/api/auth/login', [
        'json' => [
            'email' => 'superadmin@cris.gov.ph',
            'password' => 'password',
        ],
    ]);

    echo 'Status: ' . $response->getStatusCode() . PHP_EOL;
    echo 'Body: ' . $response->getBody() . PHP_EOL;
} catch (GuzzleHttp\Exception\GuzzleException $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
