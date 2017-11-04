var User = require('../models/user');
var moment = require('moment-timezone');

exports.get = function(res){
  var path = res.req._parsedOriginalUrl.path;
  var user = res.locals.authed_user;
  var navData = {};

  if (!res.locals.authed_user){
    navData.authStatus = {label: 'Sign In / Sign Up', target: '/auth/signin'};
  }
  else {
    navData.authStatus = {label: 'Signed in as '+user.firstName+' '+user.familyName, target: '/manage-auth/details'};
    navData.live = {label: 'Live Recording', target: '/sessions/live'};
    navData.management = {label: 'Session Management', target: '/sessions'};
    navData.analytics = {label: 'Analytics', target: '/sessions/analytics'};
  }

  return navData;
}