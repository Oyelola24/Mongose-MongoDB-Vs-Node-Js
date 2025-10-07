# Mongoose & MongoDB Checkpoint

This project implements the guided Mongoose tasks: schema/model creation, create/save documents, queries, updates, deletions, and a chained query. All code files include simple comments for learning and grading purposes.

Prerequisites
- Node.js (v14+ recommended)
- A MongoDB Atlas URI

Setup
1. Copy `.env.example` to `.env` and set your `MONGO_URI` value (keep the quotes and no spaces around `=`):

   MONGO_URI="your_mongo_connection_string"

2. Install dependencies (from project root):

```powershell
npm install
```

Run

```powershell
npm start
```

What the code does
- Connects to MongoDB using MONGO_URI from `.env`.
- Defines a `Person` schema and model with fields: `name`, `age`, `favoriteFoods`.
- Demonstrates:
  - Creating and saving a single document (using callback style)
  - Creating many documents with `Model.create()`
  - Finding by name with `Model.find()`
  - Finding one by favorite food with `Model.findOne()`
  - Finding by `_id` with `Model.findById()`
  - Classic update (find -> edit -> save)
  - Using `findOneAndUpdate()` to set age to 20
  - Removing a document by id with `findByIdAndRemove()`
  - Deleting many documents with `deleteMany()` (note: `remove()` is deprecated)
  - Chaining queries (find, sort, limit, select, exec)

Files
- `src/personModel.js` - Mongoose schema and model (with comments)
- `src/peopleData.js` - Example array of people for seeding
- `src/index.js` - Runner that performs all the tasks and logs outputs

Notes
- This project purposely uses a mix of callback and promise styles to match the instructions.
- `.env` is ignored by git; don't commit your private connection string.

Compatibility notes (important)
- The code strictly follows the checkpoint tasks (create/save, createMany, find, findOne, findById, find-edit-save, findOneAndUpdate, findByIdAndRemove, delete many, and chained queries).
- Two small compatibility adjustments are necessary because of the Mongoose version used in this project (v7):
  1) Mongoose v7 removed the ability to pass a callback directly to `document.save()`; the code therefore calls `save()` as a promise and then invokes the provided Node-style `done(err, data)` callback inside the `.then/.catch` handlers. This preserves the requested callback-style behavior at the function level while remaining compatible with Mongoose v7.
  2) `Model.remove()` is deprecated and not recommended. The implementation uses `Model.deleteMany()` to delete multiple documents (it returns an operation result with `deletedCount`, which is what tests expect). The `removeManyPeople` function still calls the `done(null, result)` callback with the operation outcome.

If you require exact literal usage of deprecated APIs (for example `document.save(fn)` or `Model.remove()`), I can change the project to use an older Mongoose version that still supports those signatures — tell me and I'll downgrade `mongoose` to a compatible version and update the code accordingly.


