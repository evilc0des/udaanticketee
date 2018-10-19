var express = require('express'),
	router = express.Router(),
	path = require('path')

module.exports=function(){

	router.get('/', function(req, res, next) {
		if(req.isAuthenticated())
			res.sendFile(path.resolve(`${__dirname}/../public`, 'app.html'));
		else
			res.render('login');
	});
	


	return router;
}