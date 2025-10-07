// index.js
// Runner script that connects to MongoDB and performs the requested Mongoose operations.

// Load environment variables from .env
require('dotenv').config();
const mongoose = require('mongoose');
const Person = require('./personModel');
const peopleData = require('./peopleData');

// The code supports two modes:
// 1) Use MONGO_URI from .env to connect to an external MongoDB Atlas instance.
// 2) If MONGO_URI is not set, start an in-memory MongoDB server (mongodb-memory-server)
//    so the project can be run without external credentials (useful for testing/demos).

const MONGO_URI = process.env.MONGO_URI;

async function start() {
  let mongoUri = MONGO_URI;
  let mongod = null;

  if (!mongoUri) {
    // Lazy-load mongodb-memory-server only when needed
    console.log('MONGO_URI not set. Starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
  }

  // Use the options requested in the instructions
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
      console.log('Successfully connected to MongoDB');
      try {
        await runAllTasks();
        console.log('All tasks completed.');
      } catch (err) {
        console.error('Error running tasks:', err);
      } finally {
        // Close mongoose connection
        await mongoose.connection.close();
        // Stop in-memory server if used
        if (mongod) await mongod.stop();
        console.log('Connection closed.');
      }
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
}

start();

// Small helper to promisify callback-based functions in this file
function cbToPromise(fn) {
  return new Promise((resolve, reject) => {
    try {
      fn((err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// 1) Create and Save a Record of a Model (using callback style as requested)
function createAndSavePerson(done) {
  // Create a document instance using the Person constructor
  const person = new Person({ name: 'Charlie', age: 40, favoriteFoods: ['sandwich'] });

  // Save using promise-style (Mongoose v7 no longer accepts callbacks on save)
  person.save()
    .then(data => done(null, data))
    .catch(err => done(err));
}

// 2) Create Many Records with model.create()
function createManyPeople(arrayOfPeople, done) {
  // Use promise-style create
  Person.create(arrayOfPeople)
    .then(people => done(null, people))
    .catch(err => done(err));
}

// 3) Use model.find() to Search Your Database
function findPeopleByName(personName, done) {
  Person.find({ name: personName })
    .then(persons => done(null, persons))
    .catch(err => done(err));
}

// 4) Use model.findOne() to Return a Single Matching Document
function findOneByFood(food, done) {
  // Search inside the favoriteFoods array
  Person.findOne({ favoriteFoods: food })
    .then(person => done(null, person))
    .catch(err => done(err));
}

// 5) Use model.findById() to Search Your Database By _id
function findPersonById(personId, done) {
  Person.findById(personId)
    .then(person => done(null, person))
    .catch(err => done(err));
}

// 6) Perform Classic Updates by Running Find, Edit, then Save
function findEditThenSave(personId, done) {
  // Find the person by id
  Person.findById(personId)
    .then(person => {
      if (!person) return done(new Error('Person not found'));
      // Add "hamburger" to favoriteFoods
      person.favoriteFoods.push('hamburger');
      // Save the updated document (promise)
      return person.save();
    })
    .then(updatedPerson => done(null, updatedPerson))
    .catch(err => done(err));
}

// 7) Perform New Updates on a Document Using model.findOneAndUpdate()
function findAndUpdate(personName, done) {
  // Find by name and set age to 20. Return the updated document with { new: true }
  Person.findOneAndUpdate({ name: personName }, { age: 20 }, { new: true })
    .then(updatedDoc => done(null, updatedDoc))
    .catch(err => done(err));
}

// 8) Delete One Document Using model.findByIdAndRemove
function removeById(personId, done) {
  Person.findByIdAndRemove(personId)
    .then(removedDoc => done(null, removedDoc))
    .catch(err => done(err));
}

// 9) MongoDB and Mongoose - Delete Many Documents with model.remove()
function removeManyPeople(done) {
  // The instruction asked to use Model.remove(), but it's deprecated.
  // We use deleteMany() which provides the same effect.
  Person.deleteMany({ name: 'Mary' })
    .then(result => done(null, result))
    .catch(err => done(err));
}

// 10) Chain Search Query Helpers to Narrow Search Results
function queryChain(done) {
  Person.find({ favoriteFoods: 'burritos' })
    .sort({ name: 1 }) // sort by name ascending
    .limit(2) // limit to 2 results
    .select('-age') // hide the age field
    .exec()
    .then(data => done(null, data))
    .catch(err => done(err));
}

// Run all tasks in sequence and log outputs
async function runAllTasks() {
  console.log('\n---- Running Mongoose tasks ----\n');

  // 1) createAndSavePerson (callback style)
  const savedPerson = await cbToPromise(createAndSavePerson);
  console.log('1) createAndSavePerson result ->', savedPerson);

  // 2) createManyPeople
  const many = await cbToPromise(done => createManyPeople(peopleData, done));
  console.log('2) createManyPeople result -> created', many.length, 'people');

  // 3) findPeopleByName: look for 'Mary'
  const foundMary = await cbToPromise(done => findPeopleByName('Mary', done));
  console.log('3) findPeopleByName("Mary") ->', foundMary);

  // 4) findOneByFood: find someone who likes 'burritos'
  const oneWithBurritos = await cbToPromise(done => findOneByFood('burritos', done));
  console.log('4) findOneByFood("burritos") ->', oneWithBurritos);

  // 5) findPersonById: use the id of the person we just saved in step 1
  const foundById = await cbToPromise(done => findPersonById(savedPerson._id, done));
  console.log('5) findPersonById ->', foundById);

  // 6) findEditThenSave: add hamburger to the saved person's favoriteFoods
  const edited = await cbToPromise(done => findEditThenSave(savedPerson._id, done));
  console.log('6) findEditThenSave ->', edited);

  // 7) findAndUpdate: set age to 20 for 'John'
  const updated = await cbToPromise(done => findAndUpdate('John', done));
  console.log('7) findAndUpdate("John") ->', updated);

  // 8) removeById: remove one of the created people (take first of many)
  const removed = await cbToPromise(done => removeById(many[0]._id, done));
  console.log('8) removeById ->', removed);

  // 9) removeManyPeople: remove all 'Mary'
  const removeManyResult = await cbToPromise(removeManyPeople);
  console.log('9) removeManyPeople (name: Mary) ->', removeManyResult);

  // 10) queryChain: people who like burritos, sorted, limited to 2, hide age
  const chainResult = await cbToPromise(queryChain);
  console.log('10) queryChain ->', chainResult);

  console.log('\n---- Tasks finished ----\n');
}
