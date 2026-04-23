<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('keywords', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('keyword_research_proposal', function (Blueprint $table) {
            $table->foreignId('keyword_id')->constrained('keywords')->cascadeOnDelete();
            $table->foreignId('research_proposal_id')->constrained('research_proposals')->cascadeOnDelete();
            $table->primary(['keyword_id', 'research_proposal_id']);
        });

        DB::table('research_proposals')
            ->select(['id', 'keywords'])
            ->whereNotNull('keywords')
            ->orderBy('id')
            ->chunkById(100, function ($rows): void {
                foreach ($rows as $row) {
                    $parsedKeywords = $this->parseKeywords($row->keywords);

                    if ($parsedKeywords === []) {
                        continue;
                    }

                    $keywordIds = [];

                    foreach ($parsedKeywords as $keywordName) {
                        $keywordId = DB::table('keywords')->where('name', $keywordName)->value('id');

                        if (! $keywordId) {
                            $keywordId = DB::table('keywords')->insertGetId([
                                'name' => $keywordName,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }

                        $keywordIds[] = $keywordId;
                    }

                    $pivotRows = array_map(
                        fn ($keywordId) => [
                            'keyword_id' => $keywordId,
                            'research_proposal_id' => $row->id,
                        ],
                        array_unique($keywordIds),
                    );

                    DB::table('keyword_research_proposal')->insertOrIgnore($pivotRows);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('keyword_research_proposal');
        Schema::dropIfExists('keywords');
    }

    private function parseKeywords(?string $keywords): array
    {
        if (! $keywords) {
            return [];
        }

        $items = array_filter(array_map(
            static fn (string $value) => trim($value),
            explode(',', $keywords),
        ));

        $normalized = [];

        foreach ($items as $item) {
            $key = strtolower($item);

            if (! isset($normalized[$key])) {
                $normalized[$key] = $item;
            }
        }

        return array_values($normalized);
    }
};
