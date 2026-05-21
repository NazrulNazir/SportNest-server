import express from 'express';
import dotenv from 'dotenv';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
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
        const facilityCollection = db.collection('facilities');
        const BookingCollection = db.collection('bookings');


        app.get('/FeaturedFacilities', async (req, res)=> {
            const facilities = await featuredFacilities.find().toArray();
            res.send(facilities);
        })

        app.get('/destinations', async (req, res)=> {
            const result = await SportNestCollection.find().toArray();
            res.send(result);
        })

        app.post('/allfacilities', async (req, res) => {
            const facilities = req.body;
            
            const result = await facilityCollection.insertOne(facilities);
            res.send(result);

        });

        app.get('/allfacilities', async (req, res)=> {
            const result = await facilityCollection.find().toArray();
            res.send(result);
        })

        app.get('/allfacilities/:id', async (req, res)=> {
            console.log(req.params.id);
            const id = req.params.id;
            const query = {
                _id : new ObjectId(id)
            }
            const result = await facilityCollection.findOne(query);
            res.send(result);
        })


        // Booking..
        app.post('/booking', async (req, res)=> {
            const bookingData = req.body;
            const result = await BookingCollection.insertOne(bookingData);
            res.send(result);
        })

        app.get('/booking/:id', async (req, res)=> {
            const {id} = req.params;
            console.log('amar id..',id);
            const result = await BookingCollection.find({userId : id}).toArray();
            res.send(result);            
        });


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