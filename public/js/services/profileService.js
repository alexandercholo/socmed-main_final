angular.module('socmedApp')
    .service('ProfileService', function($http) {
        var baseUrl = '/api'; // Adjust this based on your API URL

        this.getProfile = function() {
            return $http.get(baseUrl + '/profile', {
                cache: false
            }).then(function(response) {
                // Transform the data if necessary
                response.data.posts = response.data.posts.map(function(post) {
                    post.showOptions = false; // Initialize showOptions
                    return post;
                });
                return response;
            });
        };

        this.deletePost = function(postId) {
            return $http.delete(baseUrl + '/posts/' + postId);
        };

        this.updateProfile = function(profileData) {
            return $http.post(baseUrl + '/profile', profileData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };
    });