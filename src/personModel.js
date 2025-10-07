// personModel.js
// Defines the Mongoose schema and model for Person

const mongoose = require('mongoose');

// Create a schema for Person using basic Mongoose schema types
const personSchema = new mongoose.Schema({
  name: { type: String, required: true }, // name is required
  age: { type: Number }, // age is a number
  favoriteFoods: { type: [String], default: [] } // array of strings
});

// Create and export the model
module.exports = mongoose.model('Person', personSchema);
