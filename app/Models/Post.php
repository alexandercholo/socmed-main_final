<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['content'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    protected $appends = ['likes_count', 'is_liked'];

    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    public function getIsLikedAttribute()
    {
        return $this->likes()->where('user_id', auth()->id())->exists();
    }
}