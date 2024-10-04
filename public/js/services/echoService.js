// public/js/services/echo.service.js
app.service('EchoService', ['$http', function ($http) {
    let Echo = require('laravel-echo');
    window.Pusher = require('pusher-js');
  
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: 'your-pusher-app-key',
      cluster: 'your-pusher-cluster',
      forceTLS: true
    });
  
    this.listenToNotifications = function (channelName, eventName, callback) {
      this.echo.channel(channelName).listen(eventName, callback);
    };
  }]);
  