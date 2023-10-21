const express=require('express');
const app=express()
require('./swagger')(app);
app.use(express.json())//middleware
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
    const p=await Product.find({})
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
app.get('/getProductById/:id',async (req,res)=>
{
    try
    {
        const {id}=req.params;
    const pro=await Product.findById(id);
    res.send(pro);
    }
    catch(e)
    {
        res.send(e);
        console.log(e);
    }
})
/**
 * @swagger
 * /updateProduct/{id}:
 *   put:
 *     summary: Create a new Product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product to retrieve
 *         schema:
 *           type: string
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
app.put('/updateProduct/:id',async (req,res)=>{
    try
    {
        const {id}=req.params;
     const pr=await Product.findByIdAndUpdate(id,req.body);
//   if(!pr)
//   res.send("cannot find the product with given id")
     //res.send(req.body);
     const updpr=await Product.findById(id);
res.send(updpr);
    }
    catch(e)
    {
        res.send(e);
        console.log(e);
    }
})
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