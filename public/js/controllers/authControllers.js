angular.module('socmedApp')
    .controller('LoginController', function($scope, $http, $location, AuthService) {
        $scope.login = function() {
            console.log('Attempting to log in with:', $scope.user); // Log the user object
            $http.post('/api/login', $scope.user)
                .then(function(response) {
                    AuthService.setToken(response.data.token);
                    $location.path('/posts');
                }, function(error) {
                    console.error('Login failed', error);
                    $scope.errorMessage = 'Login failed: ' + (error.data.message || 'Please try again.');
                });
        };
    })
    .controller('RegisterController', function($scope, $http, $location, AuthService) {
        $scope.user = {};
        $scope.register = function() {
            console.log('Attempting to register with:', $scope.user);
            $http.post('/api/register', $scope.user)
                .then(function(response) {
                    console.log('Registration successful:', response.data);
                    AuthService.setToken(response.data.token);
                    $location.path('/posts');
                }, function(error) {
                    console.error('Registration failed', error);
                    $scope.errorMessage = 'Registration failed: ' + (error.data.message || 'Please try again.');
                });
        };
    });