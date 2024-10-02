<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_post()
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/api/posts', [
            'content' => 'Test post content'
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'content', 'user_id', 'created_at']);
    }

    public function test_can_get_posts()
    {
        $user = User::factory()->create();
        Post::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->getJson('/api/posts');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_can_update_own_post()
    {
        $user = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->putJson("/api/posts/{$post->id}", [
            'content' => 'Updated content'
        ]);

        $response->assertStatus(200)
            ->assertJson(['content' => 'Updated content']);
    }

    public function test_cannot_update_others_post()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $post = Post::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($user)->putJson("/api/posts/{$post->id}", [
            'content' => 'Updated content'
        ]);

        $response->assertStatus(403);
    }
}