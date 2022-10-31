const express = require('express');
const routerA = require('./routes/userRoutes');
const routerB = require('./routes/bookRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log('server listening on port 3000');
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/users', routerA);
app.use('/api/books', routerB);

app.get('/', (req, res) => {
	res.status(200).json({
		'api end points' : {
			register : '/api/users/register',
			login    : '/api/users/login'
		}
	});
});

app.get('', (req, res, next) => {
	res.status(404).json({ message: '404 not found' });
});
