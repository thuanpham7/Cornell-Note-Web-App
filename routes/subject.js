const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subject');

router.get('/add-subject', subjectController.getAddSubject);

router.post('/add-subject', subjectController.postAddSubject);

router.get('/subject/:subName', subjectController.getSubject);

router.get('/subject/edit/:subName', subjectController.getEditSubject);

router.post('/subject/edit/:subName', subjectController.postEditSubject);

router.post('/subject/delete/:subName', subjectController.postRemoveSubject);

module.exports = router;