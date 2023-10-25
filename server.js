const express=require('express');
const app=express()
const cors=require('cors')
//require('./swagger')(app);
app.use(cors())
app.use(express.json())//middleware
// app.use(cors)
const mongoose=require('mongoose')
const {Standard}=require('./model')
//mongoose.connect("mongodb://localhost:27017").then((e)=>console.log("mongodb connected ")).catch((e)=>console.log("unable to connect"))
app.listen(3000,()=>console.log("server is running"))
app.get('/',(req,res)=>res.send("welcome to india"))
mongoose.connect("mongodb://127.0.0.1:27017/inotebook").then((e)=>console.log("mongodb connected ")).catch((e)=>console.log(e))

/**
 * @swagger
 * /addProduct:
 *   post:
 *     summary: Create a new Product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Bad Request
 */
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
app.delete('/deletesubcontrols/:subcontrolId', async (req, res) => {
  const { subcontrolId } = req.params;

  try {
    // Find the subcontrol by its ID and remove it from the database
    const result = await Standard.updateOne(
      { 'controls.subcontrols._id': subcontrolId },
      { $pull: { 'controls.$[].subcontrols': { _id: subcontrolId } } }
    );

    if (result.nModified > 0) {
      res.json({ message: 'Subcontrol deleted successfully' });
    } else {
      res.status(404).json({ message: 'Subcontrol not found' });
    }
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
app.delete('/deleteProduct/:id',async (req,res)=>
{
try
{
const {id}=req.params;
const p=await Product.findByIdAndDelete(id);
res.send(p);
}
catch(e)
{
    console.log(e);

}
})
