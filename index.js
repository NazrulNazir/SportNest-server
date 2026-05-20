import express from 'express';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
dotenv.config();
const app = express();
import cors from 'cors';

const port = process.env.PORT;

// midleware
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;

// mongodb+srv://<db_username>:<db_password>@cluster0.byynxmz.mongodb.net/?appName=Cluster0

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
        await client.connect();

        const db = client.db('SportNest');
        const SportNestCollection = db.collection('AllFacilities');
        const featuredFacilities = db.collection('FeatureFacilities');


        app.get('/FeaturedFacilities', async (req, res)=> {
            const facilities = await featuredFacilities.find().toArray();
            res.send(facilities);
        })

        app.get('/destinations', async (req, res)=> {
            const result = await SportNestCollection.find().toArray();
            res.send(result);
        })

        app.post('/destinations', async (req, res) => {
            const destinations = req.body;
            console.log('post data found..', destinations);
            
            const results = await SportNestCollection.insertOne(AllFacilities);
            res.send(results)

        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('This is SportNest Website')
})



app.listen(port, () => {
    console.log(`Server running port is ${port}`)
})