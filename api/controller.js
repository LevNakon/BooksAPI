const { validationResult } = require('express-validator/check');
const AWS = require('aws-sdk');

const BOOKS_TABLE = process.env.BOOKS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.getBooks = async (req, res) => {
     try {

          const params = {
               TableName: BOOKS_TABLE,
          };

          const result = await dynamoDb.scan(params).promise();
          if (result.Items && result.Items.length !== 0) {
               res.json({ books: result.Items });
          } else {
               res.status(404).json({ error: "Books not found" });
          }

     } catch (error) {
          res.status(400).json({ error: 'Could not get books' });
     }
};

exports.getBook = async (req, res) => {
     try {

          const params = {
               TableName: BOOKS_TABLE,
               Key: {
                    uuid: req.params.bookUuid,
               },
          };

          const result = await dynamoDb.get(params).promise();
          if (result.Item) {
               const { uuid, name, releaseDate, authorName } = result.Item;
               res.json({ uuid, name, releaseDate, authorName });
          } else {
               res.status(404).json({ error: "Book not found" });
          }

     } catch (error) {
          res.status(400).json({ error: 'Could not get book' });
     }
};

exports.createBook = async (req, res) => {
     const { uuid, name, releaseDate, authorName } = req.body;
     const errors = validationResult(req);
     try {

          if (!errors.isEmpty()) {
               res.status(400).json({ error: errors });
          }

          const params = {
               TableName: BOOKS_TABLE,
               Item: {
                    uuid,
                    name,
                    releaseDate: Number(releaseDate),
                    authorName
               },
          };

          const result = await dynamoDb.put(params).promise();
          if (result) {
               res.json({ uuid, name, releaseDate: Number(releaseDate), authorName });
          } else {
               res.status(400).json({ error: 'Could not create book' });
          }

     } catch (error) {
          res.status(400).json({ error: 'Could not create book' });
     }
};

exports.deleteBook = async (req, res) => {
     try {

          const params = {
               TableName: BOOKS_TABLE,
               Key: {
                    uuid: req.params.bookUuid,
               },
          };

          const result = await dynamoDb.delete(params).promise();
          if (result) {
               res.status(204).json({});
          } else {
               res.status(400).json({ error: 'Could not delete book' });
          }

     } catch (error) {
          res.status(400).json({ error: 'Could not delete book' });
     }
};

exports.updateBook = async (req, res) => {
     const errors = validationResult(req);
     try {

          if (!errors.isEmpty()) {
               res.status(400).json({ error: errors });
          }

          const params = {
               TableName: BOOKS_TABLE,
               Key: {
                    uuid: req.params.bookUuid,
               },
               UpdateExpression: "set #nm = :name, releaseDate = :releaseDate, authorName = :authorName",
               ExpressionAttributeValues: {
                    ":name": req.body.name,
                    ":releaseDate": Number(req.body.releaseDate),
                    ":authorName": req.body.authorName,
               },
               ExpressionAttributeNames: {
                    "#nm": "name"
               },
               ReturnValues: "ALL_NEW"
          };

          const result = await dynamoDb.update(params).promise();
          if (result && result.Attributes) {
               const { name, releaseDate, authorName } = result.Attributes;
               res.json({ uuid: req.params.bookUuid, name, releaseDate, authorName });
          } else {
               res.status(400).json({ error: 'Could not update book' });
          }

     } catch (error) {
          res.status(400).json({ error: 'Could not update book' });
     }
};