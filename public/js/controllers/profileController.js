angular.module('socmedApp')
.controller('ProfileController', function($scope, ProfileService, PostService, CommentService, LikeService, $location, $timeout, $rootScope) {
    // Scope variables
    $scope.user = {};
    $scope.userPosts = [];
    $scope.errorMessage = '';
    $scope.successMessage = '';
    $scope.messageVisible = false;
    $scope.isModalOpen = false;
    $scope.newPost = { content: '' };
    $scope.profilePicture = null;
    $scope.posts = [];
    $scope.userProfilePicture = '';
    $scope.notificationVisible = false;
    $scope.profileDropdownVisible = false;
    $scope.notificationCount = 0;
    $scope.notifications = [];
    

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

    // Updated loadProfile function
    $scope.loadProfile = function() {
        ProfileService.getProfile()
            .then(response => {
                $scope.user = response.data.user;
                $scope.userPosts = response.data.posts.map(post => {
                    // Ensure can_edit and can_delete are set for each post
                    post.can_edit = post.user_id === $scope.user.id;
                    post.can_delete = post.user_id === $scope.user.id;
                    post.showOptions = false; // Initialize showOptions
                    return post;
                });
                $scope.userProfilePicture = $scope.user.profile_picture || '/logo/default.png';
                
                // Load comments for each post
                $scope.userPosts.forEach(post => {
                    loadCommentsForPost(post);
                });
            })
            .catch(error => {
                console.error('Error loading profile:', error);
                $scope.showMessage('Failed to load profile. Please try again.', false);
            }); 
    };

    // Load posts (updated)
    $scope.loadPosts = function() {
        PostService.getPosts()
            .then(function(response) {
                $scope.posts = response.data.map(function(post) {
                    post.likes_count = post.likes_count || 0;
                    post.is_liked = post.is_liked || false;
                    post.created_at = new Date(post.created_at);
                    post.editing = false;
                    post.showCommentBox = false;
                    post.showOptions = false;
                    post.user.profile_picture = post.user.profile_picture || '/logo/default.png';
                    
                    // Ensure comments are loaded for each post
                    loadCommentsForPost(post);
                    
                    return post;
                });
                $scope.$apply(); // Trigger a digest cycle to update the view
            })
            .catch(function(error) {
                console.error('Error loading posts:', error);
                $scope.showMessage('Failed to load posts. Please try again.', false);
            });
    };

    // New function to load comments for a specific post
    function loadCommentsForPost(post) {
        CommentService.getComments(post.id)
            .then(function(response) {
                post.comments = response.data;
                $scope.$apply(); // Trigger a digest cycle to update the view
            })
            .catch(function(error) {
                console.error('Error loading comments for post:', post.id, error);
            });
    }

    // Create post (updated)
    $scope.createPost = function() {
        PostService.createPost($scope.newPost)
            .then(function(response) {
                showMessage('Post created successfully!', true);
                $scope.newPost = {};
                $scope.loadPosts(); // Reload all posts after creating a new one
            })
            .catch(function(error) {
                console.error('Error creating post:', error);
                showMessage('Failed to create post. Please try again.', false);
            });
    };




    // Add comment (updated)
    $scope.addComment = function(post) {
        if (!post.newComment) return;
        CommentService.addComment(post.id, { content: post.newComment })
            .then(function(response) {
                post.comments = post.comments || [];
                post.comments.push(response.data);
                post.newComment = '';
                $scope.$apply(); // Trigger a digest cycle to update the view
            })
            .catch(function(error) {
                console.error('Error adding comment:', error);
                showMessage('Failed to add comment. Please try again.', false);
                $scope.$apply(); // Ensure error message is displayed
            });
    };

    // Show message function (updated)
    function showMessage(message, isSuccess) {
        $scope.successMessage = isSuccess ? message : '';
        $scope.errorMessage = !isSuccess ? message : '';
        $scope.messageVisible = true;

        $timeout(() => {
            $scope.messageVisible = false;
            $scope.$apply(); // Ensure the message is hidden after timeout
        }, 3000);
    }


    // Update profile
    $scope.updateProfile = function() {
        const formData = new FormData();
        formData.append('name', $scope.user.name);
        formData.append('email', $scope.user.email);
        formData.append('bio', $scope.user.bio);
        if ($scope.profilePicture) {
            formData.append('profile_picture', $scope.profilePicture);
        }

        ProfileService.updateProfile(formData)
            .then(response => {
                const updatedUser = response.data.user;
                $scope.user.name = updatedUser.name;
                $scope.user.email = updatedUser.email;
                $scope.user.bio = updatedUser.bio;
                if (updatedUser.profile_picture) {
                    $scope.user.profile_picture = updatedUser.profile_picture;
                    $scope.userProfilePicture = updatedUser.profile_picture;
                    
                    // Broadcast the profile picture update
                    $rootScope.$broadcast('profilePictureUpdated', {
                        userId: $scope.user.id,
                        newProfilePicture: updatedUser.profile_picture
                    });
                }
                $scope.isModalOpen = false;
                showMessage('Profile updated successfully', true);
            })
            .catch(error => showMessage('Failed to update profile. Please try again.', false));
    };

    $scope.onFileSelect = function(files) {
        $scope.profilePicture = files[0];
    };

    $scope.toggleEdit = function() {
        $scope.isModalOpen = !$scope.isModalOpen;
    };


    

    // Updated deletePost function
    $scope.deletePost = function(post) {
        if (window.confirm('Are you sure you want to delete this post?')) {
            PostService.deletePost(post.id)
                .then(function(response) {
                    console.log('Delete response:', response);
                    if (response.data && response.data.success) {
                        // Remove the post from the local array
                        var index = $scope.userPosts.findIndex(p => p.id === post.id);
                        if (index > -1) {
                            $scope.userPosts.splice(index, 1);
                        }
                        showMessage('Post deleted successfully!', true);
                    } else {
                        throw new Error('Delete operation did not return success');
                    }
                })
                .catch(function(error) {
                    console.error('Error deleting post:', error);
                    showMessage('Failed to delete post. Please try again.', false);
                });
        }
    };


    
    // Toggle comment box
    $scope.toggleCommentBox = function(post) {
        post.showCommentBox = !post.showCommentBox;
    };

    

    // Delete comment
    $scope.deleteComment = function(post, comment) {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            CommentService.deleteComment(comment.id)
                .then(function() {
                    var index = post.comments.indexOf(comment);
                    post.comments.splice(index, 1);
                    showMessage('Comment deleted successfully!', true);
                })
                .catch(function(error) {
                    console.error('Error deleting comment:', error);
                    showMessage('Failed to delete comment. Please try again.', false);
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
                showMessage('Failed to toggle like. Please try again.', false);
            });
    };

    // Updated togglePostOptions function
    $scope.togglePostOptions = function(post, event) {
        event.stopPropagation(); // Prevent event from bubbling up
        post.showOptions = !post.showOptions;
        
        // Close options for other posts
        $scope.userPosts.forEach(function(p) {
            if (p !== post) {
                p.showOptions = false;
            }
        });
    };

    // New function to check if current user owns the post
    $scope.isCurrentUserPost = function(post) {
        return post.user_id === $scope.user.id;
    };

    // Toggle editing mode
    $scope.editPost = function(post) {
        post.editing = !post.editing;
    };




    // Update post (updated)
    $scope.updatePost = function(post) {
        PostService.updatePost(post.id, post)
            .then(function(response) {
                var index = $scope.posts.findIndex(p => p.id === post.id);
                $scope.posts[index] = Object.assign({}, $scope.posts[index], response.data);
                post.editing = false;
                showMessage('Post updated successfully!', true);
                $scope.$apply(); // Ensure the view is updated
            })
            .catch(function(error) {
                console.error('Error updating post:', error);
                showMessage('Failed to update post. You may not have permission to edit this post.', false);
            });
    };

    

    // Load profile and posts on init
    function init() {
        $scope.loadPosts();
        $scope.loadProfile();
    }
    
    init();
});