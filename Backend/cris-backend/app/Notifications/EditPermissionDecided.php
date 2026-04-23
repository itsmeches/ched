<?php

namespace App\Notifications;

use App\Models\EditPermissionRequest;
use App\Models\ResearchProposal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EditPermissionDecided extends Notification
{
    use Queueable;

    public function __construct(
        private readonly ResearchProposal $proposal,
        private readonly EditPermissionRequest $editRequest,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $status  = strtoupper($this->editRequest->status);
        $message = $this->editRequest->isApproved()
            ? 'Your edit permission request has been approved. You may now edit your submission.'
            : 'Your edit permission request has been denied.';

        return (new MailMessage)
            ->subject("Edit Permission {$status}: {$this->proposal->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line($message)
            ->line("Title: {$this->proposal->title}")
            ->action('View Proposal', route('research.show', $this->proposal->id))
            ->line('Log in to CRIS to view the full details.');
    }
}
