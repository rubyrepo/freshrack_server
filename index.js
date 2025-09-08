const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
require('dotenv').config(); 

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.by8ms6m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create MongoDB client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    
    // Database and Collections
    const database = client.db("freshRackDB");
    // Add your collections here
    
    console.log("Successfully connected to MongoDB!");

    // Your routes will go here
    app.get('/', (req, res) => {
      res.send('freshrack server is running');
    });

    // Start the server
    app.listen(port, () => {
      console.log(`freshrack server running on port: ${port}`);
    });

  } catch (error) {
    console.error("Database connection error:", error);
  }
}
run().catch(console.dir);