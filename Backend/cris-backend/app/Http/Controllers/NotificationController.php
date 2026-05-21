<?php

namespace App\Http\Controllers;

use App\Models\SimpleNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filter = (string) $request->input('filter', 'all'); // all|unread|read
        $type = trim((string) $request->input('type', ''));

        $query = SimpleNotification::query()
            ->where('user_id', $user->id)
            ->when($filter === 'unread', fn ($q) => $q->where('is_read', false))
            ->when($filter === 'read', fn ($q) => $q->where('is_read', true))
            ->when($type !== '', fn ($q) => $q->where('type', $type))
            ->orderByDesc('created_at');

        $notifications = $query->paginate(20)->withQueryString();

        $typeOptions = SimpleNotification::query()
            ->where('user_id', $user->id)
            ->whereNotNull('type')
            ->select('type')
            ->distinct()
            ->orderBy('type')
            ->pluck('type')
            ->map(fn ($value) => ['value' => $value, 'label' => str_replace('_', ' ', (string) $value)])
            ->values();

        $unreadCount = SimpleNotification::query()
            ->where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filters' => ['filter' => $filter, 'type' => $type],
            'typeOptions' => $typeOptions,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markRead(Request $request, int $id): RedirectResponse
    {
        SimpleNotification::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update(['is_read' => true]);

        return back();
    }

    public function markUnread(Request $request, int $id): RedirectResponse
    {
        SimpleNotification::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->update(['is_read' => false]);

        return back();
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        SimpleNotification::query()
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return back()->with('success', 'Notification removed.');
    }
}
