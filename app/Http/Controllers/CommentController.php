<?php

namespace App\Http\Controllers;

use App\Events\NewComment;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);
    
        $comment = $post->comments()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        // event(new NewComment($post, $comment));
    
        return $comment->load('user');
    }

    public function destroy(Comment $comment)
    {
        \Log::info('Destroy method called for comment: ' . $comment->id);
        
        try {
            $this->authorize('delete', $comment);
            \Log::info('Authorization passed for deleting comment: ' . $comment->id);
            
            $comment->delete();
            \Log::info('Comment deleted successfully: ' . $comment->id);
            
            return response()->json(['message' => 'Comment deleted successfully'], 200);
        } catch (\Exception $e) {
            \Log::error('Error deleting comment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete comment'], 500);
        }
    }
}