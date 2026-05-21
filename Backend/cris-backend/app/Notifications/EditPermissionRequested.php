<?php

namespace App\Notifications;

use App\Models\EditPermissionRequest;
use App\Models\ResearchProposal;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EditPermissionRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly ResearchProposal $proposal,
        private readonly EditPermissionRequest $editRequest,
        private readonly User $requester,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject("Edit Permission Request: {$this->proposal->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line("{$this->requester->name} has requested permission to edit a submission you reviewed.")
            ->line("Title: {$this->proposal->title}");

        if (! empty($this->editRequest->reason)) {
            $mail->line("Reason: {$this->editRequest->reason}");
        }

        return $mail
            ->action('Review Request', route('research.show', $this->proposal->id))
            ->line('Please log in to CRIS to approve or deny this request.');
    }
}
