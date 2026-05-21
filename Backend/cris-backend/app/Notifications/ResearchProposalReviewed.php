<?php

namespace App\Notifications;

use App\Models\ResearchProposal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResearchProposalReviewed extends Notification
{
    use Queueable;

    public function __construct(private readonly ResearchProposal $proposal) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $status = strtoupper((string) $this->proposal->status);
        $message = $this->proposal->status === ResearchProposal::STATUS_APPROVED
            ? 'Your research paper has been approved and is now available in CRIS.'
            : 'Your research paper was reviewed and requires your attention.';

        $mail = (new MailMessage)
            ->subject("Research Proposal {$status}: {$this->proposal->title}")
            ->greeting("Hello {$notifiable->name},")
            ->line($message)
            ->line("Title: {$this->proposal->title}")
            ->line("Status: {$status}");

        if (! empty($this->proposal->comments)) {
            $mail->line('Reviewer comments:')
                ->line($this->proposal->comments);
        }

        return $mail
            ->action('Open Proposal', route('research.show', $this->proposal->id))
            ->line('You can sign in to CRIS to view the full record and next steps.');
    }
}
