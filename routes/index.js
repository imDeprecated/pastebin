var express = require('express');
var shortid = require('shortid');
var lang = require('language-classifier');
var mongoUtils = require('../util/mongoUtil');
var randomUtils = require('../util/randomUtil');

var router = express.Router();

/* GET submit page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'pastebin' });
});

/* GET raw view page. */
router.get('/r/*', function(req, res, next) {
    const id = req.url.split('/')[2];

    mongoUtils.getDb().collection('paste').find({ _id: id }).limit(1).next(function (err, doc) {
        if (err) throw err;
        res.header('content-type', 'text/json');
        res.send(doc.paste);
    });
});

/* GET view page. */
router.get('/*', function(req, res, next) {
    const id = req.url.split('/')[1];

    mongoUtils.getDb().collection('paste').find({ _id: id }).limit(1).next(function (err, doc) {
        if (err) throw err;
        const viewData = Object.assign({}, doc, { title: 'pastebin' });
        res.render('viewpaste', viewData);
    });
});

/* POST paste. */
router.post('/', function(req, res) {
  var paste = {
    _id: shortid.generate(),
    humanId: randomUtils.generateIdentifier(),
    date: new Date(),
    language: lang(req.body.paste),
    paste: req.body.paste
  };

  mongoUtils.getDb().collection('paste').insertOne(paste, function (err, res) {
    if (err) throw err;
  });
  return res.redirect('/' + paste._id + '/' + paste.humanId);
});

module.exports = router;
