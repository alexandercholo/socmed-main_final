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

      // Load posts
    $scope.loadPosts = function() {
        PostService.getPosts()
            .then(function(response) {
                $scope.posts = response.data.map(function(post) {
                    post.likes_count = post.likes_count || 0;
                    post.is_liked = post.is_liked || false;
                    post.created_at = new Date(post.created_at);
                    post.editing = false; 
                    post.showCommentBox = false;
                    post.showOptions = false; // Add this line
                    post.user.profile_picture = post.user.profile_picture || '/logo/default.png';
                    
                    // Ensure comments are loaded for each post
                    loadCommentsForPost(post);
                    
                    return post;
                });
            })
            .catch(function(error) {
                console.error('Error loading posts:', error);
                showMessage('Failed to load posts. Please try again.', false);
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

    // Create post
    $scope.createPost = function() {
        PostService.createPost($scope.newPost)
            .then(function(response) {
                var newPost = response.data;
                newPost.editing = false;
                newPost.likes_count = newPost.likes_count || 0;
                newPost.is_liked = newPost.is_liked || false;
                newPost.comments = [];
                $scope.posts.unshift(newPost);
                $scope.newPost = {};
                showMessage('Post created successfully!', true);
                $scope.$apply(); // Trigger a digest cycle to update the view
            })
            .catch(function(error) {
                console.error('Error creating post:', error);
                showMessage('Failed to create post. Please try again.', false);
            });
    };

    // Add comment
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
            });
    };   

    // Show message function
    function showMessage(message, isSuccess) {
        $scope.successMessage = isSuccess ? message : '';
        $scope.errorMessage = !isSuccess ? message : '';
        $scope.messageVisible = true;

        $timeout(() => {
            $scope.messageVisible = false;
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

    // Create post
    $scope.createPost = function() {
        PostService.createPost($scope.newPost)
            .then(function(response) {
                var newPost = response.data;
                newPost.editing = false;
                newPost.likes_count = newPost.likes_count || 0;
                newPost.is_liked = newPost.is_liked || false;
                newPost.comments = [];
                $scope.posts.unshift(newPost);
                $scope.newPost = {};
                showMessage('Post created successfully!', true);
            })
            .catch(function(error) {
                console.error('Error creating post:', error);
                showMessage('Failed to create post. Please try again.', false);
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
                showMessage('Post updated successfully!', true);
            })
            .catch(function(error) {
                console.error('Error updating post:', error);
                showMessage('Failed to update post. You may not have permission to edit this post.', false);
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
                    showMessage('Post deleted successfully!', true);
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

    // Add comment
    $scope.addComment = function(post) {
        if (!post.newComment) return;
        CommentService.addComment(post.id, { content: post.newComment })
            .then(function(response) {
                post.comments = post.comments || [];
                post.comments.push(response.data);
                post.newComment = '';
            })
            .catch(function(error) {
                console.error('Error adding comment:', error);
                showMessage('Failed to add comment. Please try again.', false);
            });
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

    // Toggle post options
    $scope.togglePostOptions = function(post, event) {
        event.stopPropagation(); // Prevent event from bubbling up
        post.showOptions = !post.showOptions;
        
        // Close options for other posts
        $scope.posts.forEach(function(p) {
            if (p !== post) {
                p.showOptions = false;
            }
        });
    };

    // Close all post options when clicking outside
    $scope.closeAllPostOptions = function() {
        $scope.posts.forEach(function(post) {
            post.showOptions = false;
        });
    };  

    // Load profile and posts on init
    $scope.loadProfile();
    $scope.loadPosts();
});