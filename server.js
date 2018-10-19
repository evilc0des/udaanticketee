const cluster = require('cluster'),
    http = require('http'),
	numCPUs = require('os').cpus().length,
	express = require('express'),
	bodyParser = require('body-parser'),
	morgan = require('morgan'),
	cookieParser = require('cookie-parser'),
    helmet = require('helmet'),
    compression = require('compression'),
    mongoose = require('mongoose'),
	passport = require('passport'),
	session = require('express-session'),
    RedisStore = require('connect-redis')(session),

	//Configure and initialize express
    app = express(),

	// Get App Configurations
	conf = require('./config'),

	// Get port from environment and store in Express.
    port = normalizePort(process.env.PORT || conf.port);
	app.set('port', port);
	
	//Initialize a http server
    let server;


	//Passport Strategy Declaration
    require('./core/authStrategy')(passport);

    // Morgan Logging Plugin
    app.use(morgan('short'));

    // Include Security Best Practices
    app.use(helmet());

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

    // parse application/json
    app.use(bodyParser.json({ limit: '50mb' }));

    // parse cookies
	app.use(cookieParser());
	
	//Enabling gzip Compression for performance gains
	app.use(compression());

    //Static File Serving
    app.use(express.static('./public'));

    //Initialize View Engine
    app.set('views', './views');
    app.set('view engine', 'pug');
    
    // required for passport
	app.use(session({
		store: new RedisStore({
			host: 'redis-15299.c16.us-east-1-3.ec2.cloud.redislabs.com',       //where redis store is
			port: 15299,              //default redis port
			prefix: 'carter',         //prefix for sessions name is store
			pass: 'AE29pznLyYsfgZtx7vL9C1PLV7b5CQO5'
		}),
		secret: 'carterhadasecret',
		saveUninitialized : true,
		resave :true})); // session secret
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions

// routes
const base = require('./routes/index')();
const user = require('./routes/user')(passport);
const screens = require('./routes/api/screens')();
app.use('/', base);
app.use('/auth', user);
app.use('/screens', screens);

// Setting up a Node Cluster to enable concurrency
if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);
	// Fork workers.
	for (let i = 0; i < numCPUs; i += 1) {
		cluster.fork();
	}
	cluster.on('exit', (worker) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	// Workers can share any TCP connection
	// In this case it is an HTTP server
	// Start a MongoDB connection with Mongoose
	mongoose.connect(conf.dbUrl, { useCreateIndex: true, useNewUrlParser: true }).then(
		() => { 
			console.log('Connected to MongoDB');
		},(err) => { 
			console.log(`Unable to connect to MongoDB : ${err}`);
		}
	);
		
	server = http.Server(app);
	server.listen(port, '0.0.0.0');
	server.on('error', onError);
	server.on('listening', onListening);

	console.log(`Worker ${process.pid} started`);
}


/**
 *  Function to transform the port variable into suitable form
 */
function normalizePort(val) {
	const intPort = parseInt(val, 10);

	if (isNaN(intPort)) {
		// named pipe
		return val;
	}

	if (intPort >= 0) {
		// port number
		return intPort;
	}

	return false;
}	

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
	console.log(`Listening on ${bind}`);
}
