<?php

namespace App\Services;

use App\Models\SimpleNotification;

class SimpleNotificationService
{
    public static function notify(?int $userId, string $message, ?string $url = null): void
    {
        if (! $userId || trim($message) === '') {
            return;
        }

        SimpleNotification::query()->create([
            'user_id' => $userId,
            'message' => $message,
            'link_url' => $url,
            'is_read' => false,
        ]);
    }
}
