const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
    secret: 'worsebox_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');

app.use('/', authRoutes);
app.use('/', postRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Worsebox running at http://localhost:${PORT}`);
});