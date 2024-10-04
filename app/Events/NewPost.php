<?php

namespace App\Events;

use App\Models\Post;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;

class NewPost implements ShouldBroadcast
{
    use SerializesModels;

    public $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function broadcastOn()
    {
        return new Channel('notification-channel');
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->post->id,
            'content' => $this->post->content,
            'user' => $this->post->user, // Include user details if necessary
        ];
    }
}

