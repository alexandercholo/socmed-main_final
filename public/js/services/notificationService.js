// public/js/services/notificationService.js
angular.module('socmedApp')
    .service('NotificationService', ['$http', function($http) {
        this.getNotifications = function() {
            return $http.get('/api/notifications'); // Fetch notifications
        };

        this.markAsRead = function(id) {
            return $http.put(`/api/notifications/${id}/read`); // Mark notification as read
        };

        this.deleteNotification = function(id) {
            return $http.delete(`/api/notifications/${id}`); // Delete notification
        };
    }]);
