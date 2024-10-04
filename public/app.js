angular.module('socmedApp', ['ngRoute'])
    .config(function($routeProvider, $httpProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/login'
            })
            .when('/login', {
                templateUrl: 'templates/login.html',
                controller: 'LoginController'
            })
            .when('/register', {
                templateUrl: 'templates/register.html',
                controller: 'RegisterController'
            })
            .when('/posts', {
                templateUrl: 'templates/posts.html',
                controller: 'PostController'
            })
            .when('/profile', {
                templateUrl: 'templates/profile.html',
                controller: 'ProfileController'
            })
            .when('/messages', {
                templateUrl: 'templates/messages.html',
                controller: 'messagesController'
            })
            .otherwise({
                redirectTo: '/login'
            });

        // Configure XSRF
        $httpProvider.defaults.xsrfCookieName = 'XSRF-TOKEN';
        $httpProvider.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

        // Add authentication interceptor
        $httpProvider.interceptors.push('AuthInterceptor');
    });