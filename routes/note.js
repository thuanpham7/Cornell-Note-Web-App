const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note');

router.get('/subject/:subName/note', noteController.getNote);

router.post('/subject/:subName/note', noteController.postNote);

router.get('/subject/:subName/:noteName', noteController.editNote);

router.post('/subject/:subName/:noteName', noteController.postEditNote);

router.post('/add-highlight', noteController.addHighlights);

router.post('/remove-highlight', noteController.removeHighlights);

router.post('/add-notes', noteController.addNotes);

router.post('/remove-note', noteController.removeNotes);

router.post('/add-summary', noteController.addSummary);

router.post('/remove-summary', noteController.removeSummary);

router.post('/subject/:subName/:noteName/remove', noteController.postRemoveNote);

module.exports = router;