<?php

namespace App\Listeners;

use App\Events\NewComment;
use App\Models\Notification;

class CreateNewCommentNotification
{
    public function handle(NewComment $event)
    {
        Notification::create([
            'user_id' => $event->post->user_id,  // Notify the post's owner
            'post_id' => $event->post->id,       // ID of the post that was commented on
            'type' => 'new_comment',
        ]);
    }
}
