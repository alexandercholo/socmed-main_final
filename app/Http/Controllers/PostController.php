<?php


namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\NewPost;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index()
    {
        return Post::with(['user', 'comments.user', 'likes'])
            ->withCount('likes')
            ->latest()
            ->get()
            ->map(function ($post) {
                $post->is_liked = $post->likes->contains('user_id', auth()->id());
                $post->can_edit = $post->user_id === auth()->id();
                $post->can_delete = $post->user_id === auth()->id(); 
                $post->user->profile_picture = $this->getProfilePictureUrl($post->user->profile_picture);
                $post->comments->each(function ($comment) {
                    $comment->user->profile_picture = $this->getProfilePictureUrl($comment->user->profile_picture);
                });
                return $post;
            });
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $post = $request->user()->posts()->create($validated);

        // Load the post with its relations and add necessary flags
        $post = Post::with('user')
            ->withCount('likes')
            ->findOrFail($post->id);

        $post->can_edit = true; // The creator can always edit their new post
        $post->can_delete = true; // The creator can also delete their new post
        $post->is_liked = false; // A new post is not liked by default
        
        event(new NewPost($post));

        return $post;
    }

    public function show(Post $post)
    {
        return $post->load('user');
    }

    public function update(Request $request, Post $post)
    {
        if (Auth::id() !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $post->update($validated);

        return $post;
    }

    public function destroy(Post $post)
    {
        $this->authorize('delete', $post);
        $post->delete();
        return response()->noContent();
    }

    private function getProfilePictureUrl($profilePicture)
    {
        if (!$profilePicture) {
            return asset('logo/default.png');
        }

        // Construct the full path within the storage directory
        $fullPath = 'profile_pictures/' . basename($profilePicture);

        // Check if the file exists in the public disk
        if (Storage::disk('public')->exists($fullPath)) {
            return Storage::url($fullPath);
        }

        // If the file doesn't exist, return the default image
        return asset('logo/default.png');
    }
}
