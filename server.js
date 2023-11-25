const express =  require('express');
const app = express()
const cors=require('cors')
const bodyParser=require('body-parser')
app.use(cors())
app.use(express.json())//middleware
const path = require('path'); 
const multer=require('multer');
const DB_URI="mongodb://localhost:27017/fileDB"
const mongoose=require('mongoose')
// const {Expense}=require('./model');
const PORT = process.env.PORT || 8000;

mongoose.connect(DB_URI)
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now(); // Get the current timestamp
    const originalName = path.parse(file.originalname).name; // Extract the original filename without extension
    const newFilename = `${originalName}-${timestamp}${path.extname(file.originalname)}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage });

// Define schema for files
const fileSchema = new mongoose.Schema({
  filePath: String,
});

const File = mongoose.model('File', fileSchema);

// API endpoint for uploading files
// app.post('/upload-files', upload.array('files', 10), async (req, res) => {
//   try {
//     // Save each file to MongoDB and get the file paths
//     const filePaths = req.files.map(file => ({ filePath: `/uploads/${file.filename}` }));

//     // Save file paths to MongoDB
//     const savedFiles = await File.insertMany(filePaths);

//     res.status(201).json({ message: 'Files uploaded successfully', files: savedFiles });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

    
  const expenseSchema = new mongoose.Schema({
    
      eid: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true 
    },
    amount: {
      type: Number,
      required: true,
    },
     date: {
      type: Date,
      required: true,
    },
    receipt: {
     type: String
    },
    status:
    {
      type: String,
      default: 'unsaved'
    }
 
  
  });
  
  
  const Expense = mongoose.model('Expense', expenseSchema);
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.post('/upload-expenses', upload.array('receipts', 100), async (req, res) => {
    try {
      const expenseData = JSON.parse(req.body.expenses);
      const action = req.body.action; // New field to determine the action
  
      // Save each resume file to MongoDB and get the URLs
      const receiptPaths = req.files.map(file => `uploads/${file.filename}`);
  
      // Save student details to MongoDB
      const expenses = expenseData.map((expense, index) => ({
        eid: expense.eid,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        receipt: receiptPaths[index],
      }));
  
      const savedExpenses = await Expense.insertMany(expenses);
  
      if (action === 'save') {
        // Update the status of expenses to 'saved'
        await Expense.updateMany({ _id: { $in: savedExpenses.map(expense => expense._id) } }, { $set: { status: 'saved' } });
      } else if (action === 'submit') {
        // Update the status of expenses to 'submitted for approval'
        await Expense.updateMany({ _id: { $in: savedExpenses.map(expense => expense._id) } }, { $set: { status: 'submitted for approval' } });
      }
  
      res.status(201).json({ message: 'Expenses uploaded successfully', students: savedExpenses });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/fetch-saved-expenses', async (req, res) => {
    try {
      const savedExpenses = await Expense.find({ status: 'saved' });
      res.status(200).json(savedExpenses);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
 














