require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("mydb");
    const users = db.collection("users");

    // Test route
    app.get("/", (req, res) => {
      res.send("API is running...");
    });

    // CREATE
    app.post("/users", async (req, res) => {
      try {
        const result = await users.insertOne(req.body);
        res.status(201).json(result);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // READ ALL
    app.get("/users", async (req, res) => {
      try {
        const data = await users.find().toArray();
        res.json(data);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // READ ONE
    app.get("/users/:id", async (req, res) => {
      try {
        const user = await users.findOne({
          _id: new ObjectId(req.params.id),
        });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
      } catch (err) {
        res.status(400).json({ error: "Invalid ID format" });
      }
    });

    // UPDATE (PATCH)
    app.patch("/users/:id", async (req, res) => {
      try {
        const result = await users.findOneAndUpdate(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body },
          { returnDocument: "after" },
        );

        if (!result.value) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(result.value);
      } catch (err) {
        res.status(400).json({ error: "Invalid ID format" });
      }
    });

    // DELETE
    app.delete("/users/:id", async (req, res) => {
      try {
        const result = await users.deleteOne({
          _id: new ObjectId(req.params.id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
      } catch (err) {
        res.status(400).json({ error: "Invalid ID format" });
      }
    });

    // Start server
    app.listen(process.env.PORT || 3000, () => {
      console.log("Server started");
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

startServer();
