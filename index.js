const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 3500


// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eo2hmpk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();


        const carToysCollection = client.db("carstoysDB").collection("carstoy");

        app.get("/carToys", async (req, res) => {
            const cursor = carToysCollection.find();
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get("/carToys/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await carToysCollection.findOne(query)
            res.send(result);
        })

        app.get("/myToys", async (req, res) => {
            let query = {};
            if (req.query?.email) {
              query = { seller_email: req.query.email };
            }
            const result = await carToysCollection
              .find(query)
              .sort({ price: 1 })
              .toArray();
            const sortedResult = result.map((toy) => ({
              ...toy,
              price: parseFloat(toy.price),
            }));
            sortedResult.sort((a, b) => a.price - b.price);
            res.send(sortedResult);
          });


        app.get("/update/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carToysCollection.findOne(query);
            res.send(result)
        })


        app.post("/carToys", async (req, res) => {
            const toys = req.body;
            const result = await carToysCollection.insertOne(toys)
            res.send(result)
        })


        app.put("/update/:id", async (req, res) => {
            const id = req.params.id;
            const updateToy = req.body;
            const filter = { _id: new ObjectId(id) };
            const option = { upsert: true };
            const toy = {
                $set: {
                    name: updateToy.name,
                    picture: updateToy.picture,
                    price: updateToy.price,
                    quantity: updateToy.quantity,
                    description: updateToy.description
                }
            }
            const result = await carToysCollection.updateOne(filter, toy, option);
            res.send(result)
        })

        app.delete("/myToys/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carToysCollection.deleteOne(query);
            res.send(result)
        })

    


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Toy Car Wonderland Server is running!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})