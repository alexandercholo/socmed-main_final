<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Post;
use App\Models\Comment;

class NewComment implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $post;
    public $comment;

    public function __construct(Post $post, Comment $comment)
    {
        $this->post = $post;
        $this->comment = $comment; // The new comment made on the post
    }

    public function broadcastOn()
    {
        // Broadcasting the comment to the post's owner
        return new PrivateChannel('user.' . $this->post->user_id);
    }
}
