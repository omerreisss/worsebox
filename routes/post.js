const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/worsebox.db');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    db.all('SELECT * FROM posts ORDER BY created_at DESC', [], (err, posts) => {
        res.render('index', { posts });
    });
});

router.get('/new', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('newpost');
});

router.post('/new', upload.single('image'), (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;
    db.run('INSERT INTO posts (title, content, image, author_id, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [title, content, image, req.session.userId], (err) => {
            res.redirect('/');
        });
});

router.get('/post/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, post) => {
        db.all('SELECT * FROM comments WHERE post_id = ?', [id], (err, comments) => {
            res.render('post', { post, comments });
        });
    });
});

router.post('/post/:id/comment', upload.single('image'), (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    const id = req.params.id;
    const { content } = req.body;
    const image = req.file ? req.file.filename : null;
    db.run('INSERT INTO comments (post_id, content, image, author_id, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
        [id, content, image, req.session.userId], (err) => {
            res.redirect('/post/' + id);
        });
});

module.exports = router;