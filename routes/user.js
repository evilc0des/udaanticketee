const express = require('express'),
		router = express.Router(),
		User = require('../model/user');

module.exports=function(passport){

	// process the signup form
    router.post('/signup', (req, res, next) => {
    	passport.authenticate('local-signup', (err, user, info) => {
	    	if (err) { return next(err); }
	    	if (!user) { 
	    		if(info.message === 'email-exist')
	    			res.json({s: 'f', d: 'email-exist'});
	    	}
	    	else
	    	{
	    		res.json({s: 'p', d: 'done'});
	    	}
    	})(req, res, next);
    });

    //local login route
    router.post('/login', (req, res, next) => {
		passport.authenticate('local-login', function(err, user, info) {
	    	if (err) { return next(err); }
	    	if (!user) { return res.json({s: 'f', d: info.message}); }
	    	if (req.body.remember) {
	          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
	        } else {
	          req.session.cookie.expires = false; // Cookie expires at end of session
	        }
		    req.logIn(user, function(err) {
		    	if (err) { return next(err); }
		    	if(!user.onboarded)
		    		//return res.redirect('/onboarding');  COMMENTED FOR TESTING PURPOSES.BYPASSING ONBOARDING.
                    res.json({s: 'p', r: 'onboarding'});
		    	else
					res.json({s: 'p', r: 'manager'});
			});
		})(req, res, next);
	});

	//email confirm route
	router.get('/confirmEmail', (req, res, next) => {
		const vercode = req.query.v;
		const email = req.query.em;
		console.log(vercode, email);
		User.findOne({email: email}, (err, user) => {
			if(err)
				throw err;
			if(user)
			{
				if(user.local.verCode === vercode)
				{
					user.local.isVerified = true;
					user.save((err) => {
						if(err)
							throw err;
						res.render('login', {title: 'Login', confirm: true, email: email});
					});
					
				}
			}
				
		});
	});

    //FACEBOOK ROUTES
	// route for facebook authentication and login
    router.get('/facebook', passport.authenticate('facebook', { 
      scope : ['public_profile', 'email']
    }));

    // handle the callback after facebook has authenticated the user
    router.get('/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect : '/'
    }));

    //TWITTER ROUTES
    // route for twitter authentication and login
    router.get('/twitter', passport.authenticate('twitter', { 
      scope : ['public_profile', 'email']
    }));

    // handle the callback after twitter has authenticated the user
    router.get('/twitter/callback', passport.authenticate('twitter', {
        successRedirect : '/',
        failureRedirect : '/'
    }));

	router.get('/logout', (req, res, next) => {
		if(req.isAuthenticated())
			req.logout();
		res.redirect('/');
	});


	return router;
}