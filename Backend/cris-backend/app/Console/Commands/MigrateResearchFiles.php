<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateResearchFiles extends Command
{
    protected $signature = 'research:migrate-files {--dry-run : List files without moving}';

    protected $description = 'Move research PDFs from the public disk to the private research disk.';

    public function handle(): int
    {
        $public = Storage::disk('public');
        $research = Storage::disk('research');
        $dry = (bool) $this->option('dry-run');

        if (! $public->exists('research_papers')) {
            $this->info('No legacy research_papers directory on the public disk. Nothing to do.');
            return self::SUCCESS;
        }

        $files = $public->allFiles('research_papers');
        $moved = 0;
        $skipped = 0;

        foreach ($files as $path) {
            if ($research->exists($path)) {
                $this->line("skip (exists): {$path}");
                $skipped++;
                continue;
            }

            if ($dry) {
                $this->line("would move: {$path}");
                continue;
            }

            $stream = $public->readStream($path);
            if ($stream === null) {
                $this->error("failed to read: {$path}");
                continue;
            }

            $research->writeStream($path, $stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
            $public->delete($path);
            $this->line("moved: {$path}");
            $moved++;
        }

        $this->info($dry
            ? "Dry run complete. " . count($files) . " file(s) examined, {$skipped} already on private disk."
            : "Migration complete. {$moved} moved, {$skipped} skipped.");

        return self::SUCCESS;
    }
}
