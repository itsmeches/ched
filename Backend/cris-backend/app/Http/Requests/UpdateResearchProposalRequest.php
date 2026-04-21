<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResearchProposalRequest extends FormRequest
{
    public function authorize(): bool
    {
        $proposal = $this->route('proposal');
        return $proposal
            && $proposal->submitted_by === $this->user()->id
            && $proposal->isEditable();
    }

    public function rules(): array
    {
        return [
            'title'      => ['required', 'string', 'max:255'],
            'authors'    => ['required', 'string', 'max:500'],
            'co_authors' => ['nullable', 'string', 'max:500'],
            'abstract'   => ['required', 'string'],
            'keywords'   => ['nullable', 'string', 'max:500'],
            'category'   => ['required', 'string', 'max:100'],
            'school'     => ['required', 'string', 'max:255'],
            'year'       => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            'pdf_file'   => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }
}
