const http = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');

const BOOKS_TABLE = process.env.BOOKS_TABLE;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send('Hello World!')
});

// Get Book by ID endpoint
app.get('/book/:bookUuid', function (req, res) {
  const params = {
    TableName: BOOKS_TABLE,
    Key: {
      uuid: req.params.bookUuid,
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Could not get book' });
    }
    if (result.Item) {
      const { uuid, name, releaseDate, authorName } = result.Item;
      res.json({ uuid, name, releaseDate, authorName });
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  });
});

// Get all Books endpoint
app.get('/books', function (req, res) {
  const params = {
    TableName: BOOKS_TABLE,
  }

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Could not get books' });
    }
    if (result.Items && result.Items.length !== 0) {
      res.json({ books: result.Items });
    } else {
      res.status(404).json({ error: "Books not found" });
    }
  });
});

// Create Book endpoint
app.post('/book/add', function (req, res) {
  const { uuid, name, releaseDate, authorName } = req.body;
  if (typeof uuid !== 'string') {
    res.status(400).json({ error: '"uuid" must be a string' });
  } else if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' });
  } else if (!Number.isInteger(Number(releaseDate))) {
    res.status(400).json({ error: '"releaseDate" must be a integer' });
  } else if (typeof authorName !== 'string') {
    res.status(400).json({ error: '"authorName" must be a string' });
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

  dynamoDb.put(params, (error) => {
    if (error) {
      res.status(400).json({ error: 'Could not create book' });
    }
    res.json({ uuid, name, releaseDate: Number(releaseDate), authorName });
  });
});

// Delete Book by ID endpoint
app.post('/book/:bookUuid/delete', function (req, res) {
  const params = {
    TableName: BOOKS_TABLE,
    Key: {
      uuid: req.params.bookUuid,
    },
  }

  dynamoDb.delete(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Could not delete book' });
    }
    if (result) {
      res.status(204).json({});
    } else {
      res.status(404).json({ error: "Book not deleted" });
    }
  });
});

// Update Book by ID endpoint
app.post('/book/:bookUuid/update', function (req, res) {
  const { name, releaseDate, authorName } = req.body;
  console.log(name, releaseDate, authorName);
  if (typeof name !== 'string') {
    res.status(400).json({ error: '"name" must be a string' });
  } else if (!Number.isInteger(Number(releaseDate))) {
    res.status(400).json({ error: '"releaseDate" must be a integer' });
  } else if (typeof authorName !== 'string') {
    res.status(400).json({ error: '"authorName" must be a string' });
  }

  const params = {
    TableName: BOOKS_TABLE,
    Key: {
      uuid: req.params.bookUuid,
    },
    UpdateExpression: "set #nm = :name, releaseDate = :releaseDate, authorName = :authorName",
    ExpressionAttributeValues: {
      ":name": name,
      ":releaseDate": Number(releaseDate),
      ":authorName": authorName,
    },
    ExpressionAttributeNames: {
      "#nm": "name"
    },
    ReturnValues: "ALL_NEW"
  };

  dynamoDb.update(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: 'Could not update book' });
    } else {
      const { name, releaseDate, authorName } = result.Attributes;
      res.json({ uuid: req.params.bookUuid, name, releaseDate, authorName });
    }
  });
});

module.exports.handler = http(app);