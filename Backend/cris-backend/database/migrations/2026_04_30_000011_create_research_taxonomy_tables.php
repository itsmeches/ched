<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('research_categories', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30);
            $table->string('value', 100)->unique();
            $table->string('label', 150);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('disciplines', function (Blueprint $table) {
            $table->id();
            $table->string('code', 2)->unique();
            $table->string('name', 200);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::table('research_categories')->insert([
            ['type' => 'data_type', 'value' => 'quantitative', 'label' => 'Quantitative', 'sort_order' => 10, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'data_type', 'value' => 'qualitative', 'label' => 'Qualitative', 'sort_order' => 20, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'data_type', 'value' => 'mixed_methods', 'label' => 'Mixed Methods', 'sort_order' => 30, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'purpose', 'value' => 'basic', 'label' => 'Basic', 'sort_order' => 40, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'purpose', 'value' => 'applied', 'label' => 'Applied', 'sort_order' => 50, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'purpose', 'value' => 'exploratory', 'label' => 'Exploratory', 'sort_order' => 60, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'purpose', 'value' => 'descriptive', 'label' => 'Descriptive', 'sort_order' => 70, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'purpose', 'value' => 'correlational', 'label' => 'Correlational', 'sort_order' => 80, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'method', 'value' => 'experimental', 'label' => 'Experimental', 'sort_order' => 90, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'method', 'value' => 'observational', 'label' => 'Observational', 'sort_order' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'method', 'value' => 'case_study', 'label' => 'Case Study', 'sort_order' => 110, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'method', 'value' => 'longitudinal', 'label' => 'Longitudinal', 'sort_order' => 120, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('disciplines')->insert([
            ['code' => '14', 'name' => 'Education Science and Teacher Training', 'sort_order' => 10, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '18', 'name' => 'Fine and Applied Arts', 'sort_order' => 20, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '22', 'name' => 'Humanities', 'sort_order' => 30, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '26', 'name' => 'Religion and Theology', 'sort_order' => 40, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '30', 'name' => 'Social and Behavioral Sciences', 'sort_order' => 50, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '34', 'name' => 'Business Administration and Related', 'sort_order' => 60, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '38', 'name' => 'Law and Jurisprudence', 'sort_order' => 70, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '42', 'name' => 'Natural Science', 'sort_order' => 80, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '46', 'name' => 'Mathematics', 'sort_order' => 90, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '47', 'name' => 'IT-Related Disciplines', 'sort_order' => 100, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '50', 'name' => 'Medical and Allied', 'sort_order' => 110, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '52', 'name' => 'Trade, Craft and Industrial', 'sort_order' => 120, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '54', 'name' => 'Engineering and Tech', 'sort_order' => 130, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '58', 'name' => 'Architectural and Town Planning', 'sort_order' => 140, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '62', 'name' => 'Agriculture, Forestry, Fisheries', 'sort_order' => 150, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '66', 'name' => 'Home Economics', 'sort_order' => 160, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '78', 'name' => 'Service Trades', 'sort_order' => 170, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '84', 'name' => 'Mass Communication and Documentation', 'sort_order' => 180, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '89', 'name' => 'Other Disciplines', 'sort_order' => 190, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '00', 'name' => 'General', 'sort_order' => 200, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['code' => '90', 'name' => 'Maritime', 'sort_order' => 210, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('disciplines');
        Schema::dropIfExists('research_categories');
    }
};
