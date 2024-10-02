angular.module('socialMediaApp')
    .controller('NotificationController', function($scope, NotificationService, $pusher) {
        $scope.notifications = [];
        $scope.unreadCount = 0; // Count for unread notifications

        // Load notifications on initialization
        $scope.loadNotifications = function() {
            NotificationService.getNotifications()
                .then(function(response) {
                    $scope.notifications = response.data;
                    $scope.unreadCount = $scope.notifications.filter(n => !n.is_read).length; // Update unread count
                })
                .catch(function(error) {
                    console.error('Error loading notifications:', error); // Handle errors
                });
        };

        // Mark notification as read
        $scope.markAsRead = function(notification) {
            NotificationService.markAsRead(notification.id)
                .then(function() {
                    notification.is_read = true;
                    $scope.unreadCount--; // Decrement unread count
                })
                .catch(function(error) {
                    console.error('Error marking notification as read:', error); // Handle errors
                });
        };

        // Delete notification
        $scope.deleteNotification = function(notification) {
            NotificationService.deleteNotification(notification.id)
                .then(function() {
                    var index = $scope.notifications.indexOf(notification);
                    if (index !== -1) {
                        $scope.notifications.splice(index, 1);
                    }
                })
                .catch(function(error) {
                    console.error('Error deleting notification:', error); // Handle errors
                });
        };

        // Initialize Pusher
        var pusher = $pusher(new Pusher('8a5955dbdf2f0cd9eeb5', {
            cluster: 'ap1'
        }));

        var channel = pusher.subscribe('private-user.' + userId);

        // Bind to new notification event
        channel.bind('new-notification', function(data) {
            $scope.notifications.unshift(data.notification);
            if (!data.notification.is_read) {
                $scope.unreadCount++; // Increment unread count for new notifications
            }
            $scope.$apply(); // Update the view
        });

        // Load notifications initially
        $scope.loadNotifications();

        // Cleanup on controller destruction (if necessary)
        $scope.$on('$destroy', function() {
            pusher.unsubscribe('private-user.' + userId); // Unsubscribe to avoid memory leaks
        });
    });
