angular.module('socmedApp')
    .service('ProfileService', function($http) {
        var baseUrl = '/api'; // Adjust this based on your API URL

        this.getProfile = function() {
            return $http.get(baseUrl + '/profile', {
                cache: false
            });
        };

        this.updateProfile = function(profileData) {
            return $http.post(baseUrl + '/profile', profileData, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            });
        };
    });
