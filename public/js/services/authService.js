angular.module('socmedApp')
    .service('AuthService', function($window) {
        this.setToken = function(token) {
            $window.localStorage.setItem('token', token);
        };

        this.getToken = function() {
            return $window.localStorage.getItem('token');
        };

        this.removeToken = function() {
            $window.localStorage.removeItem('token');
        };

        this.isAuthenticated = function() {
            return !!this.getToken();
        };

        this.logout = function() {
            this.removeToken();
            return Promise.resolve(); // Return a resolved promise for consistency
        };
    })
    .factory('AuthInterceptor', function(AuthService, $q, $window) {
        return {
            request: function(config) {
                const token = AuthService.getToken();
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            responseError: function(response) {
                if (response.status === 401) {
                    AuthService.removeToken();
                    $window.location.href = '#!/login';
                }
                return $q.reject(response);
            }
        };
    });