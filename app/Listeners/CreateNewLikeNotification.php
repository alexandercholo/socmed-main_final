<?php

namespace App\Listeners;

use App\Events\NewLike;
use App\Models\Notification;

class CreateNewLikeNotification
{
    public function handle(NewLike $event)
    {
        Notification::create([
            'user_id' => $event->post->user_id, // Notify the post's owner
            'post_id' => $event->post->id,      // ID of the post that was liked
            'type' => 'new_like',
        ]);
    }
}
