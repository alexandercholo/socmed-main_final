angular.module('socmedApp')
    .controller('MainController', function($scope, $location, $http, AuthService) {
        $scope.userName = ''; // Initialize the userName variable

        // Fetch user details
        $http.get('/api/user', {
            headers: {
                'Authorization': 'Bearer ' + AuthService.getToken()
            }
        }).then(function(response) {
            $scope.userName = response.data.name; // Assuming the user's name is in the 'name' field
        }).catch(function(error) {
            console.error('Error fetching user data:', error);
        });
        
        $scope.logout = function() {
            $http.post('/api/logout', {}, {
                headers: {
                    'Authorization': 'Bearer ' + AuthService.getToken()
                }
            }).then(function() {
                AuthService.logout();
                $location.path('/login');
            }).catch(function(error) {
                console.error('Logout failed', error);
                // Optionally, still logout on the client-side even if the server request fails
                AuthService.logout();
                $location.path('/login');
            });
        };
    });