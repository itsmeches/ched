<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResearchProposalRequest extends FormRequest
{
    private const PHONE_PATTERN = '/^\d{11}$/';
    private const PHONE_LIST_PATTERN = '/^\d{11}(?:\s*,\s*\d{11})*$/';

    public function authorize(): bool
    {
        return $this->user()->isStudent();
    }

    public function rules(): array
    {
        return [
            'title'           => ['required', 'string', 'max:255', 'regex:/\\S/'],
            'authors'         => ['required', 'string', 'max:500'],
            'author_email'    => ['nullable', 'email', 'max:255'],
            'author_phone'    => ['nullable', 'string', 'size:11', 'regex:' . self::PHONE_PATTERN],
            'co_authors'      => ['nullable', 'string', 'max:500'],
            'co_author_emails' => ['nullable', 'string', 'max:1000'],
            'co_author_phones' => ['nullable', 'string', 'max:500', 'regex:' . self::PHONE_LIST_PATTERN],
            'abstract'   => ['required', 'string'],
            'keywords'   => ['nullable', 'string', 'max:500'],
            'category'   => ['required', 'string', 'max:100'],
            'school'     => ['required', 'string', 'max:255'],
            'year'       => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'pdf_file'   => ['required', 'file', 'mimes:pdf', 'max:10240'], // 10 MB
        ];
    }

    public function messages(): array
    {
        return [
            'title.regex' => 'Title cannot be empty or whitespace only.',
            'author_phone.regex' => 'Author phone must be exactly 11 digits.',
            'author_phone.size' => 'Author phone must be exactly 11 digits.',
            'co_author_phones.regex' => 'Each co-author phone must be exactly 11 digits.',
        ];
    }
}
