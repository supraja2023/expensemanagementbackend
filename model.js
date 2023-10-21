const mongoose = require('mongoose');

// Define the Subcontrol Schema
const subcontrolSchema = new mongoose.Schema({
  refno: {
    type: String,
    required: true,
    unique:true
  },
  rational: {
    type: String,
    required: true
  },
  rationalrating: {
    type: String,
    required: true 
  },
  evidence: {
    type: String,
    required: true,
  },
 
});

// Define the Control Schema
const controlSchema = new mongoose.Schema({
  control: {
    type: String,
    required: true,
  },
 
  subcontrols: [subcontrolSchema], // An array of subcontrols embedded within the control
  // Add other control properties as needed
});

// Define the Standard Schema
const standardSchema = new mongoose.Schema({
  standard: {
    type: String,
    required: true,
  },
 
  controls: [controlSchema], // An array of controls embedded within the standard
  // Add other standard properties as needed
});

// Create models for each schema
const Subcontrol = mongoose.model('Subcontrol', subcontrolSchema);
const Control = mongoose.model('Control', controlSchema);
const Standard = mongoose.model('Standard', standardSchema);

// Export the models
module.exports = { Subcontrol, Control, Standard };
