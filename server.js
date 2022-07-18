//create express server
import express from 'express';
import cors from 'cors';
import { addAccount, getAccounts } from './src/accounts.js';
import { addTransaction } from './src/transactions.js';
import { addCategory, getCategories } from './src/categories.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use(express.urlencoded({ extended: false }));
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// read accounts
app.get('/accounts', (req, res) => {
  const accounts = getAccounts();
  res.status(200).json(accounts);
});

// add new account
app.post('/accounts', (req, res) => {
  console.log(req.body);
  if (!req.body.newAccount) {
    res.send('Invalid data');
  }
  const newAccount = addAccount(req.body.newAccount);
  res.status(201).json(newAccount);
});

//get all transactions
app.get('/transactions', (req, res) => {
  const transactions = getAllTransactions();
  res.status(200).json(transactions);
});

// add new transaction
app.post('/transaction', (req, res) => {
  if (!req.body.newTransaction) {
    res.status(400).send('Invalid data');
  }
  const newTransactions = addTransaction(req.body.newTransaction);
  res.status(201).json(newTransactions);
  // console.log('new transaction', newTransaction);
});

// read categories
app.get('/categories', (req, res) => {
  const categories = getCategories();
  res.status(200).json(categories);
});

// add new category
app.post('/categories', (req, res) => {
  if (!req.body.newCategory) {
    res.status(400).send('Invalid data');
  }
  const newCategory = addCategory(req.body.newCategory);
  console.log('body', req.body);
  res.status(201).json(newCategory);
});
