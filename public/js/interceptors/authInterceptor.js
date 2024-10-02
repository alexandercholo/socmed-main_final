angular.module('socmedApp')
    .factory('AuthInterceptor', function($q, AuthService) {
        return {
            request: function(config) {
                const token = AuthService.getToken();
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            responseError: function(rejection) {
                // Handle unauthorized errors or others
                return $q.reject(rejection);
            }
        };
    });
