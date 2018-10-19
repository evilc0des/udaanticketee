
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const User = require('../model/user');
const crypt = require('../utils/crypto')
const configAuth = require('../config').auth;
const configHost = require('../config').hostname;

module.exports = function(passport) {
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});

	//Local Signup Strategy
	passport.use('local-signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
        session:true,
		passReqToCallback : true
	}, (req, email, password, done) => {
		process.nextTick(() => {
			User.findOne({email: email}, function(err, user){
				if(err)
					return done(err);
				if(user) {
					return done(null, false, { message: 'email-exist' });
				} else {
					let newUser = new User();
					newUser.email = email;
					newUser.signUpDate = Date.now();
					newUser.local.password = newUser.generateHash(password);
					newUser.local.verCode = crypt.generateId(32);
					newUser.save((err) => {
						if(err)
							throw err;
						
						console.log(configHost);
						return done(null, newUser);

					});
				}
			});
		});
	}));

	//Local Login Strategy
	passport.use('local-login', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
        session:true,
		passReqToCallback : true
	}, (req, email, password, done) => {
		process.nextTick(() => {
			User.findOne({email: email}, (err, user) => {
				if(err)
					return done(err);
				if(!user) {
					return done(null, false, { message: 'no-user' });
				} 
				console.log(password);
				if(!user.validPassword(password))
				{
					return done(null, false, { message: 'wrong-password' }); 
				}
				user.lastTimeLogin = Date.now();
				user.save((err) => {
					if(err)
						throw err;
					return done(null, user);
				});	
			});
		});
	}));

	//Facebook Login Strategy
	passport.use(new FacebookStrategy({
		// pull in our app id and secret from our config
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL
	}, (token, refreshToken, profile, done) => {

		process.nextTick(() => {
			console.log(profile);
			
					User.findOne({ 'facebook.id' : profile.id }, (err, user) => {
						if (err)
		                    return done(err);

		                // if the user is found, then log them in
		                if (user) {
		                    return done(null, user); // user found, return that user
		                } else {
		                	let newUser = new User();
							newUser.facebook.id    = profile.id; // set the users facebook id                   
		                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
		                    newUser.name = profile.displayName;
		                    //newUser.email = profile.emails[0].value;
		                    newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
		                    //newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
							newUser.save((err) => {
								if(err)
									throw err;
								return done(null, newUser);
							});
		                }
					});	
				
			});
		}));

	//Twitter Login Strategy
	passport.use(new TwitterStrategy({
		// pull in our app id and secret from our config
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret: configAuth.twitterAuth.consumerSecret,
        callbackURL: configAuth.twitterAuth.callbackURL
	}, (token, refreshToken, profile, done) => {

		process.nextTick(() => {
			
			User.findOne({ 'twitter.id' : profile.id }, (err, user) => {
				if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                	let newUser = new User();
					newUser.twitter.id          = profile.id;
                    newUser.twitter.token       = token;
                    newUser.twitter.username    = profile.username;
                    newUser.twitter.displayName = profile.displayName;
					newUser.save((err) => {
						if(err)
							throw err;
						return done(null, newUser);
					});
                }
			});	
				
			
		});

	}));


}