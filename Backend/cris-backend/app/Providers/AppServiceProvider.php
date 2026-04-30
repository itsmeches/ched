<?php

namespace App\Providers;

use App\Models\Institution;
use App\Models\ResearchProposal;
use App\Models\User;
use App\Policies\InstitutionPolicy;
use App\Policies\ResearchProposalPolicy;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(ResearchProposal::class, ResearchProposalPolicy::class);
        Gate::policy(Institution::class, InstitutionPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        RateLimiter::for('api-login', function (Request $request) {
            $email = (string) $request->input('email', 'guest');

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });

        Vite::prefetch(concurrency: 3);
    }
}
