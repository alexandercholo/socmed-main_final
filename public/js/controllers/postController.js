angular.module('socmedApp')
    .controller('PostController', function($scope, PostService, CommentService, LikeService, $location, $timeout, $rootScope) {
        $scope.posts = [];
        $scope.newPost = {};
        $scope.successMessage = '';
        $scope.errorMessage = '';
        $scope.messageVisible = false;
        $scope.profilePicture = null;
        $scope.userProfilePicture = '';
        $scope.notificationVisible = false;
        $scope.profileDropdownVisible = false;
        $scope.isModalOpen = false;



        $scope.currentUser = {};

        // Update the loadProfile function
        $scope.loadProfile = function() {
            ProfileService.getProfile()
                .then(response => {
                    $scope.currentUser = response.data.user;
                    $scope.userProfilePicture = $scope.currentUser.profile_picture || '/logo/default.png';
                })
                .catch(error => $scope.showMessage('Failed to load profile. Please try again.', false));
        };

        // Update the init function
        function init() {
            $scope.loadPosts();
            $scope.loadProfile();
        }

        // Toggle notification dropdown
        $scope.toggleNotification = function() {
            $scope.notificationVisible = !$scope.notificationVisible;
            $scope.profileDropdownVisible = false;
        };

        // Toggle profile dropdown
        $scope.toggleProfileDropdown = function() {
            $scope.profileDropdownVisible = !$scope.profileDropdownVisible;
            $scope.notificationVisible = false;
        };

        // Navigate to posts
        $scope.goToPosts = function() {
            $location.path('/posts');
            $scope.loadPosts();
        };

        // Logout function
        $scope.logout = function() {
            console.log("Logging out...");
            // Implement logout logic here
        };

        // Close dropdowns when clicking outside
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

        // Load user profile and posts
    $scope.loadProfile = function() {
        ProfileService.getProfile()
            .then(response => {
                $scope.user = response.data.user;
                $scope.userPosts = response.data.posts;
                $scope.userProfilePicture = $scope.user.profile_picture || '/logo/default.png';
            })
            .catch(error => showMessage('Failed to load profile. Please try again.', false));
    };

        // Listen for profile picture updates
        $rootScope.$on('profilePictureUpdated', function(event, data) {
            // Update the profile picture in all posts by the user
            $scope.posts.forEach(function(post) {
                if (post.user.id === data.userId) {
                    post.user.profile_picture = data.newProfilePicture;
                }
            });
            
            // If the updated profile belongs to the current user, update the header profile picture
            if ($scope.user && $scope.user.id === data.userId) {
                $scope.userProfilePicture = data.newProfilePicture;
            }
        });

        // Show message function
        $scope.showMessage = function(message, isSuccess) {
            $scope.successMessage = isSuccess ? message : '';
            $scope.errorMessage = !isSuccess ? message : '';
            $scope.messageVisible = true;

            $timeout(function() {
                $scope.messageVisible = false;
            }, 3000);
        };

        // Load posts and current user info
        $scope.loadPosts = function() {
            PostService.getPosts()
                .then(function(response) {
                    $scope.posts = response.data.posts.map(function(post) {
                        post.likes_count = post.likes_count || 0;
                        post.is_liked = post.is_liked || false;
                        post.created_at = new Date(post.created_at);
                        post.editing = false; 
                        post.showCommentBox = false;
                        return post;
                    });
                    $scope.currentUser = response.data.currentUser;
                })
                .catch(function(error) {
                    console.error('Error loading posts:', error);
                    $scope.showMessage('Failed to load posts. Please try again.', false);
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
                    $scope.newPost = {};
                    $scope.showMessage('Post created successfully!', true);
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
                    post.editing = false;
                    $scope.showMessage('Post updated successfully!', true);
                })
                .catch(function(error) {
                    console.error('Error updating post:', error);
                    $scope.showMessage('Failed to update post. You may not have permission to edit this post.', false);
                });
        };

        // Delete post
        $scope.deletePost = function(post) {
            if (window.confirm('Are you sure you want to delete this post?')) {
                PostService.deletePost(post.id)
                    .then(function() {
                        var index = $scope.posts.indexOf(post);
                        if (index > -1) {
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

        // Toggle comment box
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
                    response.data.user = {
                        name: $scope.currentUser.name,
                        profile_picture: $scope.currentUser.profile_picture
                    };
                    post.comments.push(response.data);
                    post.newComment = '';
                })
                .catch(function(error) {
                    console.error('Error adding comment:', error);
                    $scope.showMessage('Failed to add comment. Please try again.', false);
                });
        };

        // Delete comment
        $scope.deleteComment = function(post, comment) {
            if (window.confirm('Are you sure you want to delete this comment?')) {
                CommentService.deleteComment(comment.id)
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

        // Initialize controller
        function init() {
            $scope.loadPosts();
            // You might want to load the current user's profile picture here
            // if it's available through a user service or similar
        }

        // Call init function
        init();
    });