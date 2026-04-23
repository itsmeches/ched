<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResearchProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isHEI();
    }

    public function rules(): array
    {
        return [
            'title'           => ['required', 'string', 'max:255'],
            'authors'         => ['required', 'string', 'max:500'],
            'author_email'    => ['nullable', 'email', 'max:255'],
            'author_phone'    => ['nullable', 'string', 'max:50'],
            'co_authors'      => ['nullable', 'string', 'max:500'],
            'co_author_emails' => ['nullable', 'string', 'max:1000'],
            'co_author_phones' => ['nullable', 'string', 'max:500'],
            'abstract'   => ['required', 'string'],
            'keywords'   => ['nullable', 'string', 'max:500'],
            'category'   => ['required', 'string', 'max:100'],
            'school'     => ['required', 'string', 'max:255'],
            'year'       => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'pdf_file'   => ['required', 'file', 'mimes:pdf', 'max:10240'], // 10 MB
        ];
    }
}
