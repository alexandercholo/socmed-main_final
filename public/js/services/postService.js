angular.module('socmedApp')
    .service('PostService', function($http) {
        this.getPosts = function() {
            return $http.get('/api/posts');
        };

        this.createPost = function(post) {
            return $http.post('/api/posts', post);
        };

        this.updatePost = function(postId, post) {
            return $http.put('/api/posts/' + postId, post);
        };

        this.deletePost = function(postId) {
            return $http.delete('/api/posts/' + postId);
        };
    });