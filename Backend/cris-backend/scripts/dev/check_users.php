<?php

declare(strict_types=1);

require __DIR__ . '/../../vendor/autoload.php';

$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

if (! app()->environment(['local', 'testing'])) {
    fwrite(STDERR, "This script is restricted to local/testing environments.\n");
    exit(1);
}

$users = App\\Models\\User::select('id', 'name', 'email', 'role')->get();

echo json_encode($users, JSON_PRETTY_PRINT) . PHP_EOL;
