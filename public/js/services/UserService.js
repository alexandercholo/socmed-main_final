angular.module('socmedApp')
    .service('UserService', function($http) {
        this.getCurrentUser = function() {
            return $http.get('/api/user');
        };
    });