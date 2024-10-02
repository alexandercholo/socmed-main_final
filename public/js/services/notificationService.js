angular.module('socialMediaApp')
    .factory('NotificationService', function($http) {
        return {
            getNotifications: function() {
                return $http.get('/api/notifications');
            },
            markAsRead: function(id) {
                return $http.put('/api/notifications/' + id + '/read');
            },
            deleteNotification: function(id) {
                return $http.delete('/api/notifications/' + id);
            }
        };
    });
