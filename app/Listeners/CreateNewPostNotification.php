<?php

namespace App\Listeners;

use App\Events\NewPost;
use App\Models\Notification;

class CreateNewPostNotification
{
    public function handle(NewPost $event)
    {
        Notification::create([
            'user_id' => $event->post->user_id,
            'post_id' => $event->post->id,
            'type' => 'new_post',
        ]);
    }
}