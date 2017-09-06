var User = require('../../models/user');


exports.get = function(res){
  var navData = [];
  navData.push({label: 'Dashboard', target: '/dash'});

  if (!res.locals.authed_user){ 
    navData.push({label: 'Sign In', target: '/auth/signin'});
    navData.push({label: 'Sign Up', target: '/auth/signup'});
  } else { 
    navData.push({label: 'Sign Out', target: '/auth/signout'});
  }

  navData.push({label: 'Manage Sessions', target: '/sessions'});
  return navData;
}