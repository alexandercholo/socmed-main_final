// public/js/controllers/notificationsController.js
angular.module('socmedApp')
    .controller('NotificationsController', ['$scope', 'NotificationService', function($scope, NotificationService) {
        const vm = this; // Using `vm` for better practice

        vm.notifications = []; // Array to hold notifications
        $scope.notificationVisible = false; // To control dropdown visibility

        // Function to fetch notifications from the backend
        vm.fetchNotifications = function() {
            NotificationService.getNotifications()
                .then(function(response) {
                    vm.notifications = response.data; // Assuming the response is an array of notifications
                })
                .catch(function(error) {
                    console.error('Error fetching notifications:', error);
                });
        };

        // Function to mark a notification as read
        vm.markAsRead = function(notification) {
            NotificationService.markAsRead(notification.id)
                .then(function(response) {
                    notification.is_read = true; // Update the notification status in the UI
                })
                .catch(function(error) {
                    console.error('Error marking notification as read:', error);
                });
        };

        // Function to delete a notification
        vm.deleteNotification = function(notification) {
            NotificationService.deleteNotification(notification.id)
                .then(function(response) {
                    const index = vm.notifications.indexOf(notification);
                    if (index > -1) {
                        vm.notifications.splice(index, 1); // Remove notification from the UI
                    }
                })
                .catch(function(error) {
                    console.error('Error deleting notification:', error);
                });
        };

        // Toggle notification dropdown visibility
        $scope.toggleNotification = function() {
            $scope.notificationVisible = !$scope.notificationVisible;
        };

        // Initial load of notifications
        vm.fetchNotifications();
    }]);
