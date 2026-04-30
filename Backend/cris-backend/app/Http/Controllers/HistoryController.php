<?php

namespace App\Http\Controllers;

use App\Models\ResearchProposalHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    /** @var array<int, string> */
    private const EXPORT_COLUMNS_DEFAULT = [
        'id',
        'performed_at',
        'action',
        'actor_name',
        'actor_role',
        'proposal_id',
        'proposal_title',
        'old_values',
        'new_values',
    ];

    /** @var array<string, string> */
    private const EXPORT_COLUMN_LABELS = [
        'id' => 'ID',
        'performed_at' => 'Performed At',
        'action' => 'Action',
        'actor_name' => 'Actor Name',
        'actor_role' => 'Actor Role',
        'proposal_id' => 'Proposal ID',
        'proposal_title' => 'Proposal Title',
        'old_values' => 'Old Values',
        'new_values' => 'New Values',
    ];

    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = ResearchProposalHistory::query()
            ->with([
                'proposal:id,title',
                'actor:id,name,role',
            ])
            ->orderByDesc('performed_at');

        $this->applyRoleScope($query, $user);
        $filters = $this->applyFilters($query, $request);

        $statsBaseQuery = clone $query;
        $actionCounts = (clone $statsBaseQuery)
            ->selectRaw('action, COUNT(*) as aggregate')
            ->groupBy('action')
            ->pluck('aggregate', 'action');

        $stats = [
            'total'    => (clone $statsBaseQuery)->count(),
            'created'  => (int) ($actionCounts['created'] ?? 0),
            'updated'  => (int) ($actionCounts['updated'] ?? 0),
            'approved' => (int) ($actionCounts['approved'] ?? 0),
            'rejected' => (int) ($actionCounts['rejected'] ?? 0),
            'deleted'  => (int) ($actionCounts['deleted'] ?? 0),
        ];

        $history = $query->paginate(20)->withQueryString();

        return Inertia::render('History/Index', [
            'history' => $history,
            'filters' => $filters,
            'role'    => $user->role,
            'stats'   => $stats,
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        abort_unless($request->user()?->isSuperAdmin(), 403);

        $query = ResearchProposalHistory::query()
            ->with([
                'proposal:id,title',
                'actor:id,name,role',
            ])
            ->orderByDesc('performed_at');

        $this->applyRoleScope($query, $request->user());
        $this->applyFilters($query, $request);
        $columns = $this->resolveExportColumns($request);

        $fileName = 'history-audit-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($query, $columns) {
            $handle = fopen('php://output', 'w');

            $headers = array_map(
                fn (string $column) => self::EXPORT_COLUMN_LABELS[$column],
                $columns,
            );

            fputcsv($handle, $headers);

            $query->chunkById(300, function ($rows) use ($handle, $columns) {
                foreach ($rows as $row) {
                    $mapped = [
                        'id' => $row->id,
                        'performed_at' => optional($row->performed_at)->format('Y-m-d H:i:s'),
                        'action' => $row->action,
                        'actor_name' => $row->actor?->name,
                        'actor_role' => $row->actor?->role,
                        'proposal_id' => $row->proposal?->id,
                        'proposal_title' => $row->proposal?->title,
                        'old_values' => $row->old_values ? json_encode($row->old_values, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
                        'new_values' => $row->new_values ? json_encode($row->new_values, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
                    ];

                    $csvRow = [];

                    foreach ($columns as $column) {
                        $csvRow[] = $mapped[$column] ?? null;
                    }

                    fputcsv($handle, $csvRow);
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function applyRoleScope($query, $user): void
    {
        if ($user->role === User::ROLE_STUDENT) {
            // Student: only activity on the student's own submissions.
            $query->whereHas('proposal', fn ($q) => $q->where('submitted_by', $user->id));
            return;
        }

        if ($user->role === User::ROLE_FACULTY) {
            // Faculty: own actions plus activity on submissions from assigned students.
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('proposal.submitter', fn ($inner) => $inner->where('faculty_id', $user->id));
            });
            return;
        }

        if ($user->role === User::ROLE_HEI) {
            // HEI: activity on proposals within this HEI hierarchy.
            $query->whereHas('proposal.submitter', fn ($inner) => $inner
                ->where(function ($submitter) use ($user) {
                    $submitter->where('role', User::ROLE_FACULTY)
                        ->where('hei_id', $user->id);
                })->orWhere(function ($submitter) use ($user) {
                    $submitter->where('role', User::ROLE_STUDENT)
                        ->whereHas('faculty', fn ($faculty) => $faculty->where('hei_id', $user->id));
                })
            );
            return;
        }

        if ($user->role === User::ROLE_CHED) {
            // CHED: own actions plus actions on papers they reviewed.
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhereHas('proposal', fn ($inner) => $inner->where('reviewed_by', $user->id));
            });
            return;
        }

        // super_admin: no restriction
    }

    /**
     * @return array<int, string>
     */
    private function resolveExportColumns(Request $request): array
    {
        $requested = $request->input('columns', []);

        if (! is_array($requested)) {
            return self::EXPORT_COLUMNS_DEFAULT;
        }

        $allowed = array_keys(self::EXPORT_COLUMN_LABELS);
        $filtered = array_values(array_filter(
            $requested,
            static fn ($value) => is_string($value) && in_array($value, $allowed, true),
        ));

        if ($filtered === []) {
            return self::EXPORT_COLUMNS_DEFAULT;
        }

        return array_values(array_unique($filtered));
    }

    /**
     * @return array{search:string,action:string,range:string,from:?string,to:?string}
     */
    private function applyFilters($query, Request $request): array
    {
        $search = trim((string) $request->input('search', ''));
        if ($search !== '') {
            $query->whereHas('proposal', fn ($q) => $q->where('title', 'like', "%{$search}%"));
        }

        $action = trim((string) $request->input('action', ''));
        if ($action !== '') {
            $query->where('action', $action);
        }

        $range = trim((string) $request->input('range', ''));
        $from = $request->input('from');
        $to = $request->input('to');

        if ($range === 'today') {
            $query->whereBetween('performed_at', [
                now()->startOfDay(),
                now()->endOfDay(),
            ]);

            $from = now()->toDateString();
            $to = now()->toDateString();
        } elseif ($range === '7d') {
            $query->whereBetween('performed_at', [
                now()->subDays(6)->startOfDay(),
                now()->endOfDay(),
            ]);

            $from = now()->subDays(6)->toDateString();
            $to = now()->toDateString();
        } elseif ($range === '30d') {
            $query->whereBetween('performed_at', [
                now()->subDays(29)->startOfDay(),
                now()->endOfDay(),
            ]);

            $from = now()->subDays(29)->toDateString();
            $to = now()->toDateString();
        } elseif ($range === 'custom' && $from && $to) {
            try {
                $fromDate = Carbon::parse((string) $from)->startOfDay();
                $toDate = Carbon::parse((string) $to)->endOfDay();

                if ($fromDate->lte($toDate)) {
                    $query->whereBetween('performed_at', [$fromDate, $toDate]);
                    $from = $fromDate->toDateString();
                    $to = $toDate->toDateString();
                } else {
                    $from = null;
                    $to = null;
                }
            } catch (\Throwable $e) {
                $from = null;
                $to = null;
            }
        } else {
            $range = '';
            $from = null;
            $to = null;
        }

        return [
            'search' => $search,
            'action' => $action,
            'range'  => $range,
            'from'   => $from,
            'to'     => $to,
        ];
    }
}
