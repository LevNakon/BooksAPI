const express = require('express');
const { body } = require('express-validator/check');

const controller = require('./controller');

const router = express.Router();

/**
 * GET /books
 */
router.get('/books', controller.getBooks);

/**
 * GET /book/:bookUuid
 */
router.get('/book/:bookUuid', controller.getBook);

/**
 * POST /book/add
 */
router.post('/book/add', [
     body('uuid')
          .trim()
          .not()
          .isEmpty(),
     body('name')
          .trim()
          .not()
          .isEmpty(),
     body('releaseDate')
          .trim()
          .not()
          .isEmpty()
          .isInt(),
     body('authorName')
          .trim()
          .not()
          .isEmpty()
], controller.createBook);

/**
 * POST /book/:bookUuid/delete
 */
router.post('/book/:bookUuid/delete', controller.deleteBook);

/**
* POST /book/:bookUuid/delete
*/
router.post('/book/:bookUuid/update', [
     body('name')
          .trim()
          .not()
          .isEmpty(),
     body('releaseDate')
          .trim()
          .not()
          .isEmpty()
          .isInt(),
     body('authorName')
          .trim()
          .not()
          .isEmpty()
], controller.updateBook);

module.exports = router;