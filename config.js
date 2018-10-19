function Config() {
  this.port = '9090';
  this.hostname = 'udaanticketee.herokuapp.com';
  const dbuser = {
    name: 'udaanroot',
    pass: 'udaan001'
  }
  
  this.dbUrl = `mongodb://${dbuser.name}:${dbuser.pass}@ds131973.mlab.com:31973/udaan`;

  this.auth = {
  	'facebookAuth' : {
        'clientID': '167809944151321', // App ID
        'clientSecret': '6a8d09ad07ca953be9381f9cea36aee0', // your App Secret
        'callbackURL': `https://${this.hostname}/auth/facebook/callback`,
        'profileURL': 'https://graph.facebook.com/v2.11/me?fields=first_name,last_name,email',
        'profileFields': ['id', 'email', 'name'] // For requesting permissions from Facebook API
    },

    'twitterAuth' : {
        'consumerKey': 'hvukSLuOWPQBgVEkG5gAuUnrK',
        'consumerSecret': 'HjswoYpktiqk98anyHSuacqW3YtLyWlFV2KGOhooggopHQz9WI',
        'callbackURL': `http://${this.hostname}/auth/twitter/callback`
    }
  }
}

module.exports = new Config();