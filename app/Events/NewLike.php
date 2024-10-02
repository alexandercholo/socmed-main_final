<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Post;
use App\Models\Like; // Import the Like model

class NewLike implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $post;
    public $like;

    public function __construct(Post $post, ?Like $like)
    {
        $this->post = $post;
        $this->like = $like; // The actual Like model instance
    }

    public function broadcastOn()
    {
        // Broadcasting the like to the post's owner
        return new PrivateChannel('user.' . $this->post->user_id);
    }
}
