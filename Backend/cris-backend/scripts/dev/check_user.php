<?php

declare(strict_types=1);

require __DIR__ . '/../../vendor/autoload.php';

$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

if (! app()->environment(['local', 'testing'])) {
    fwrite(STDERR, "This script is restricted to local/testing environments.\n");
    exit(1);
}

$user = App\\Models\\User::where('email', 'superadmin@cris.gov.ph')->first();

echo "User found: ";
print_r($user ? $user->toArray() : 'NULL');

echo "\nPassword check: ";
if ($user) {
    echo password_verify('password', $user->password) ? 'TRUE' : 'FALSE';
} else {
    echo 'NO USER';
}
