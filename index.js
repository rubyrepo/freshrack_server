const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.by8ms6m.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('freshRackDB');
    const foodCollection = db.collection('foods');
    const notesCollection = db.collection('notes');

    app.get('/', (req, res) => res.send('Freshrack server is running'));

    // Add Food
    app.post('/api/foods', async (req, res) => {
      try {
        const food = req.body;
        food.addedDate = new Date().toISOString();
        const result = await foodCollection.insertOne(food);
        res.status(201).json({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // Enhanced GET: All foods with search + category filter
    app.get('/api/foods', async (req, res) => {
      try {
        const { search, category } = req.query;
        let query = {};

        if (search) {
          query.$or = [
            { foodTitle: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ];
        }

        if (category && category !== 'All') {
          query.category = category;
        }

        const foods = await foodCollection.find(query).toArray();
        res.json(foods);
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // GET foods by user email
    app.get('/api/foods/user/:email', async (req, res) => {
      try {
        const userEmail = req.params.email;
        const foods = await foodCollection.find({ userEmail }).toArray();
        res.json(foods);
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // GET single food by id
    app.get('/api/foods/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const food = await foodCollection.findOne({ _id: new ObjectId(id) });
        if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
        res.json(food);
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // Update food
    app.put('/api/foods/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedFood = req.body;
        const result = await foodCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedFood }
        );
        if (result.matchedCount === 0)
          return res.status(404).json({ success: false, message: 'Food not found' });
        res.json({ success: true, modifiedCount: result.modifiedCount });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // Delete food
    app.delete('/api/foods/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await foodCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0)
          return res.status(404).json({ success: false, message: 'Food not found' });
        res.json({ success: true, deletedCount: result.deletedCount });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // Notes for food
    app.get('/api/foods/:id/notes', async (req, res) => {
      try {
        const foodId = req.params.id;
        const notes = await notesCollection.find({ foodId }).toArray();
        res.json(notes);
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    app.post('/api/foods/:id/notes', async (req, res) => {
      try {
        const foodId = req.params.id;
        const note = req.body;
        note.foodId = foodId;
        note.addedDate = new Date().toISOString();
        const result = await notesCollection.insertOne(note);
        res.status(201).json({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    app.listen(port, () => console.log(`Freshrack server running on port ${port}`));
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

run().catch(console.dir);
