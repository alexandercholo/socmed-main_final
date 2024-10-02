
angular.module('socmedApp')
    .controller('PostController', function($scope, PostService, CommentService, LikeService, $location, $timeout) {
        $scope.posts = [];
        $scope.newPost = {};
        $scope.successMessage = '';
        $scope.errorMessage = '';
        $scope.messageVisible = false;
        $scope.userProfilePicture = '';
        $scope.notificationVisible = false;
            $scope.profileDropdownVisible = false; // Track profile dropdown visibility
            $scope.isModalOpen = false;

        // Toggle notification dropdown
    $scope.toggleNotification = function() {
        $scope.notificationVisible = !$scope.notificationVisible;
        $scope.profileDropdownVisible = false; // Hide profile dropdown if notifications are opened
    };

    // Toggle profile dropdown
    $scope.toggleProfileDropdown = function() {
        $scope.profileDropdownVisible = !$scope.profileDropdownVisible;
        $scope.notificationVisible = false; // Hide notifications if profile dropdown is opened
    };

    // Example function to navigate to posts
    $scope.goToPosts = function() {
        // Logic to navigate to posts (implementation depends on your routing)
        console.log("Navigating to posts...");
    };

    // Function to handle logout
    $scope.logout = function() {
        // Logic to log the user out (implement according to your auth logic)
        console.log("Logging out...");
        // Redirect or perform logout action here
    };

    // Optional: Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const target = event.target;
        const profileDropdown = document.querySelector('.notification-dropdown');
        if (profileDropdown && !profileDropdown.contains(target) && !target.closest('.relative')) {
            $scope.$apply(function() {
                $scope.profileDropdownVisible = false;
                $scope.notificationVisible = false;
            });
        }
    });

        // Variable to manage notification dropdown visibility
        $scope.notificationVisible = false;
            
        // Function to toggle the notification dropdown visibility
        $scope.toggleNotification = function() {
            $scope.notificationVisible = !$scope.notificationVisible;
        };

        // Display the alert message and automatically hide it after 5 seconds
        $scope.showMessage = function(message, isSuccess) {
            $scope.successMessage = isSuccess ? message : '';
            $scope.errorMessage = !isSuccess ? message : '';
            $scope.messageVisible = true;

            // Automatically hide the message after 5 seconds
            $timeout(function() {
                $scope.messageVisible = false;
            }, 3000);
        };

        $scope.goToPosts = function() {
            $location.path('/posts');
            $scope.loadPosts(); // Reload posts when navigating to the page
        };

        $scope.loadPosts = function() {
            PostService.getPosts()
                .then(function(response) {
                    $scope.posts = response.data.map(function(post) {
                        post.likes_count = post.likes_count || 0;
                        post.is_liked = post.is_liked || false;
                        post.created_at = new Date(post.created_at);
                        post.editing = false; 
                        post.showCommentBox = false;
                        post.user.profile_picture = post.user.profile_picture || '/logo/default.png';
                        return post;
                    });
                })
                .catch(function(error) {
                    console.error('Error loading posts:', error);
                    showMessage('Failed to load posts. Please try again.', false);
                });
        };   


        // Create post
        $scope.createPost = function() {
            PostService.createPost($scope.newPost)
                .then(function(response) {
                    var newPost = response.data;
                    newPost.editing = false;
                    newPost.likes_count = newPost.likes_count || 0;
                    newPost.is_liked = newPost.is_liked || false;
                    $scope.posts.unshift(newPost);
                    $scope.newPost = {}; // Reset input
                    $scope.showMessage('Post created successfully!', true); // Show success message
                })
                .catch(function(error) {
                    console.error('Error creating post:', error);
                    $scope.showMessage('Failed to create post. Please try again.', false);
                });
        };

        // Toggle editing mode
        $scope.editPost = function(post) {
            post.editing = !post.editing;
        };

        // Update post
        $scope.updatePost = function(post) {
            PostService.updatePost(post.id, post)
                .then(function(response) {
                    var index = $scope.posts.findIndex(p => p.id === post.id);
                    $scope.posts[index] = Object.assign({}, $scope.posts[index], response.data);
                    post.editing = false; // Exit editing mode after saving
                    $scope.showMessage('Post updated successfully!', true);
                })
                .catch(function(error) {
                    console.error('Error updating post:', error);
                    $scope.showMessage('Failed to update post. You may not have permission to edit this post.', false);
                });
        };
// Delete post
$scope.deletePost = function(post) {
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this post?')) {
        PostService.deletePost(post.id)
            .then(function() {
                var index = $scope.posts.indexOf(post);
                if (index > -1) { // Ensure the post exists in the array
                    $scope.posts.splice(index, 1);
                }
                $scope.showMessage('Post deleted successfully!', true);
            })
            .catch(function(error) {
                console.error('Error deleting post:', error);
                $scope.showMessage('Failed to delete post. Please try again.', false);
            });
    }
};


        // Toggle the comment box visibility
        $scope.toggleCommentBox = function(post) {
            post.showCommentBox = !post.showCommentBox;
        };

        // Add comment
        $scope.addComment = function(post) {
            if (!post.newComment) return;
            CommentService.addComment(post.id, { content: post.newComment })
                .then(function(response) {
                    if (!post.comments) {
                        post.comments = [];
                    }
                    post.comments.push(response.data);
                    post.newComment = '';
                })
                .catch(function(error) {
                    console.error('Error adding comment:', error);
                    $scope.showMessage('Failed to add comment. Please try again.', false);
                });
        };

        // Delete comment with confirmation
$scope.deleteComment = function(post, comment) {
    if (window.confirm('Are you sure you want to delete this comment?')) {
        PostService.deleteComment(comment.id)
            .then(function() {
                var index = post.comments.indexOf(comment);
                post.comments.splice(index, 1);
                $scope.showMessage('Comment deleted successfully!', true);
            })
            .catch(function(error) {
                console.error('Error deleting comment:', error);
                $scope.showMessage('Failed to delete comment. Please try again.', false);
            });
    }
};

        // Toggle like
        $scope.toggleLike = function(post) {
            LikeService.toggleLike(post.id)
                .then(function(response) {
                    post.likes_count = response.data.likes_count;
                    post.is_liked = response.data.is_liked;
                })
                .catch(function(error) {
                    console.error('Error toggling like:', error);
                    $scope.showMessage('Failed to toggle like. Please try again.', false);
                });
        };

        // Load posts on init
        $scope.loadPosts();
    });
