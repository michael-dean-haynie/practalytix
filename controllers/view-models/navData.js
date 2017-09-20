var User = require('../../models/user');
var moment = require('moment-timezone');


exports.get = function(res){
  var user = res.locals.authed_user;
  var navData = [];
  navData.push({label: 'Dashboard', target: '/dash'});

  if (!res.locals.authed_user){ 
    navData.push({label: 'Sign In', target: '/auth/signin'});
    navData.push({label: 'Sign Up', target: '/auth/signup'});
  } else { 
    navData.push({label: new String('Signed in as '+user.firstName+' '+user.familyName+' ('+user.timezone+' '+moment().tz(user.timezone).format('Z')+')'), target: '#'});
    navData.push({label: 'Sign Out', target: '/auth/signout'});
  }

  navData.push({label: 'Manage Sessions', target: '/sessions'});
  return navData;
}