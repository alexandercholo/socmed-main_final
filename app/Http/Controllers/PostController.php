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
        $currentUser = Auth::user();
        $currentUserProfilePicture = $this->getProfilePictureUrl($currentUser->profile_picture);

        $posts = Post::with(['user', 'comments.user', 'likes'])
            ->withCount('likes')
            ->latest()
            ->get()
            ->map(function ($post) use ($currentUser) {
                $post->is_liked = $post->likes->contains('user_id', $currentUser->id);
                $post->can_edit = $post->user_id === $currentUser->id;
                $post->can_delete = $post->user_id === $currentUser->id; 
                $post->user->profile_picture = $this->getProfilePictureUrl($post->user->profile_picture);
                $post->comments->each(function ($comment) {
                    $comment->user->profile_picture = $this->getProfilePictureUrl($comment->user->profile_picture);
                });
                return $post;
            });

        return response()->json([
            'posts' => $posts,
            'currentUser' => [
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'profile_picture' => $currentUserProfilePicture,
            ],
        ]);
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

        $post->can_edit = true;
        $post->can_delete = true;
        $post->is_liked = false;
        $post->user->profile_picture = $this->getProfilePictureUrl($post->user->profile_picture);
        
        // event(new NewPost($post));

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