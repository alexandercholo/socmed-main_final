angular.module('socmedApp')
    .service('CommentService', function($http) {
        this.addComment = function(postId, commentData) {
            return $http.post('/api/posts/' + postId + '/comments', commentData);
        };

        this.deleteComment = function(commentId) {
            return $http.delete('/api/comments/' + commentId);
        };
    });
