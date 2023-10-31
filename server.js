const express =  require('express');
const app = express()
const cors=require('cors')
const bodyParser=require('body-parser')
app.use(cors())
app.use(express.json())//middleware
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json({extended:true}))
const DB_URI="mongodb+srv://gvss2017:$Supra5ja@rhym.wiibmyw.mongodb.net/"
const mongoose=require('mongoose')
const {Standard}=require('./model')
const PORT=process.env.PORT||8000;
app.listen(PORT,()=>console.log(`server is running on ${PORT}`))
app.get('/',(req,res)=>res.send("welcome to india"))
mongoose.connect(DB_URI).then((e)=>console.log("mongodb connected ")).catch((e)=>console.log(e))

// login page code
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
})
const User = mongoose.model('User', UserSchema);



const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.send({ message: 'Registered successfully' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ userId: user.id }, 'SECRET_KEY', { expiresIn: '1h' });
  res.send({ token });
});









// table data content 


app.post('/addProduct',async (req,res)=>{
try {
    const { standard, controls } = req.body;

    let standardDocument = await Standard.findOne({ standard: standard });

    if (!standardDocument) {
      // If the standard doesn't exist, create a new standard
      standardDocument = new Standard({ standard: standard, controls: [] });
    }

    // Iterate through the controls array in the request
    for (const controlData of controls) {
      const { control, subcontrols } = controlData;

      // Check if the control with the same name exists in the standard's controls
      let existingControl = standardDocument.controls.find((c) => c.control === control);

      if (!existingControl) {
        // If the control doesn't exist, create a new control
        existingControl = {
          control: control,
          subcontrols: subcontrols.map((subcontrolData) => ({
            refno: subcontrolData.refno,
            rational: subcontrolData.rational,
            rationalrating: subcontrolData.rationalrating,
            evidence: subcontrolData.evidence,
          })),
        };
        standardDocument.controls.push(existingControl);
      }

      // Iterate through the subcontrols array in the request
      for (const subcontrolData of subcontrols) {
        const { refno, rational, rationalrating, evidence } = subcontrolData;

        // Create a new subcontrol
        const newSubcontrol = {
          refno,
          rational,
          rationalrating,
          evidence,
        };

        // Add the new subcontrol to the control's subcontrols array
        existingControl.subcontrols.push(newSubcontrol);
      }
    }

    // Save the standard document, which includes the updated controls and subcontrols
    await standardDocument.save();

    res.status(201).json(standardDocument);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
app.delete('/deleteSubcontrol/:subcontrolId', async (req, res) => {
  try {
    const { subcontrolId } = req.params;

    // Find the standard and control containing the subcontrol to delete
    const standard = await Standard.findOne({ 'controls.subcontrols._id': subcontrolId });
    if (!standard) {
      return res.status(404).json({ message: 'No subcontrols found for the specified ID' });
    }

    const control = standard.controls.find((c) => c.subcontrols.some((sc) => sc._id == subcontrolId));

  
    if (!control) {
      return res.status(404).json({ message: 'No subcontrols found for the specified ID' });
    }

    // Remove the subcontrol with the specified ID
    control.subcontrols = control.subcontrols.filter((subcontrol) => subcontrol._id != subcontrolId);
    
    // Save the updated standard
    await standard.save();

    res.json({ message: 'Subcontrol deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(error);
  }
});
/**
 * @swagger
 * /getAllProducts:
 *   get:
 *     summary: Get all Products
 *     tags:
 *       - Products
 *     responses:
 *       '200':
 *         description: OK
 */
app.get('/getAllProducts',async(req,res)=>
{
    try
    {
    const p=await Standard.find({})
    res.send(p);
    }
    catch(e)
    {
        res.send(e);
        console.log(e);
    }
})
/**
 * @swagger
 * /getProductById/{id}:
 *   get:
 *     summary: Get Product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Element not found
 */
app.get('/getControlsByStandard/:standard', async (req, res) => {
  try {
    const { standard } = req.params;

    // Use Mongoose .find() to fetch records based on 'standard'
    const records = await Standard.find({ standard });

    if (records.length === 0) {
      return res.status(404).json({ message: 'No records found for the specified standard' });
    }

    res.json(records);
  } catch (e) {
    res.status(500).json({ message: 'Internal server error' });
    console.log(e);
  }
});
app.put('/updateByStandard/:standard', async (req, res) => {
  try {
    const { standard } = req.params;
    const updatedData = req.body; // Updated data

    // Update the data that matches the 'standard'
    const result = await Standard.updateMany({ standard }, updatedData);

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'No documents found for the specified standard' });
    }

    res.json({ message: 'Data updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(error);
  }
});
// Import required libraries and setup your app

app.put('/updateSubcontrol/:subcontrolId', async (req, res) => {
  try {
    const { subcontrolId } = req.params;
    const updatedSubcontrolData = req.body; // Updated subcontrol data

    // Find the subcontrol by ID and update it
    const result = await Standard.updateOne(
      { 'controls.subcontrols._id': subcontrolId },
      { $set: { 'controls.$[].subcontrols.$[elem]': updatedSubcontrolData } },
      {
        arrayFilters: [{ 'elem._id': subcontrolId }],
      }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: 'No subcontrols found for the specified ID' });
    }

    res.json({ message: 'Subcontrol updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(error);
  }
});


/**
 * @swagger
 * /deleteproduct/{id}:
 *   delete:
 *     summary: Delete the Product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the element to delete
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Element not found
 */


app.get('/standards', async (req, res) => {
  try {
    const standards = await Standard.find({}, 'standard'); // Retrieve all standards and only select the 'standard' field
    const standardNames = standards.map(standard => standard.standard);
    res.json(standardNames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch standards' });
  }
});
