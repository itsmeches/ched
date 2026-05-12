<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        $user = Auth::user();

        if ($user && $user->role === User::ROLE_PENDING) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'Your account is pending Super Admin approval.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    // This method is called before attempting authentication to check if the user has exceeded the allowed number of login attempts.
    // If the user has exceeded the limit, it triggers a Lockout event and throws a ValidationException with a message indicating how long they need to wait before trying again.
    // If the user has not exceeded the limit, the method simply returns and allows the authentication process to proceed.
    // The throttleKey method generates a unique key for rate limiting based on the user's email and IP address. This key is used to track login attempts for that specific user and IP combination.
    // The ensureIsNotRateLimited method checks if the user has made too many login attempts by using the RateLimiter facade. If the user has exceeded the limit, it triggers a Lockout event and calculates how long they need to wait before trying again. It then throws a ValidationException with a message that includes the number of seconds and minutes they need to wait.
    
    // reduce to 20 but keep it 5 in production
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 20)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
