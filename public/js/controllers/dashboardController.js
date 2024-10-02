angular.module('socmedApp')
    .controller('DashboardController', function($scope, $location, AuthService, PostService) {
        $scope.currentUser = AuthService.getCurrentUser();
        $scope.userMenuOpen = false;
        $scope.posts = [];

        if (!$scope.currentUser) {
            $location.path('/login');
            return;
        }

        $scope.toggleUserMenu = function() {
            $scope.userMenuOpen = !$scope.userMenuOpen;
        };

        $scope.logout = function() {
            AuthService.logout();
            $location.path('/login');
        };

        PostService.getPosts().then(function(response) {
            $scope.posts = response.data;
            console.log('Fetched posts:', $scope.posts); // Check if posts are fetched correctly
        }).catch(function(error) {
            console.error('Error fetching posts:', error);
        });
    });
