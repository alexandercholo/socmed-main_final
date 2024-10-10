<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use App\Events\NewLike;

class LikeController extends Controller
{
    public function toggleLike(Request $request, Post $post)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        $like = $post->likes()->where('user_id', $request->user()->id)->first();
    
        if ($like) {
            $like->delete();
            $isLiked = false;
        } else {
            $like = $post->likes()->create(['user_id' => $request->user()->id]);
            $isLiked = true;

            // event(new NewLike($post, $like));
        }
    
        return response()->json([
            'likes_count' => $post->likes()->count(),
            'is_liked' => $isLiked,
        ]);
    }
    
}