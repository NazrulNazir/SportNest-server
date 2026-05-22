import express from 'express';
import dotenv from 'dotenv';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';
dotenv.config();
const app = express();
import cors from 'cors';
import { createRemoteJWKSet, jwtVerify } from 'jose';

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
        // await client.connect();

        const db = client.db('SportNest');
        const SportNestCollection = db.collection('AllFacilities');
        const featuredFacilities = db.collection('FeatureFacilities');
        const facilityCollection = db.collection('facilities');
        const BookingCollection = db.collection('bookings');

        const JWKS = createRemoteJWKSet(
            new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
        )

        const verifyToken = async (req, res, next) => {
            const authHeader = req?.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({ message: 'Unauthorized' })
            }
            const token = authHeader.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: 'Unauthorized' })
            }
            
            try {
                const { payload } = await jwtVerify(token, JWKS);
                next()
            }catch(error){
                return res.status(403).json({message: 'Forbidden'});
            }
            

        }


        app.get('/FeaturedFacilities', async (req, res) => {
            const facilities = await featuredFacilities.find().toArray();
            res.send(facilities);
        })

        app.get('/destinations', async (req, res) => {
            const result = await SportNestCollection.find().toArray();
            res.send(result);
        })

        app.post('/allfacilities', async (req, res) => {
            const facilities = req.body;

            const result = await facilityCollection.insertOne(facilities);
            res.send(result);

        });

        app.get('/allfacilities', async (req, res) => {

            const search = req.query.search || '';
            const sport = req.query.sport || '';

            let query = {};

            // SEARCH
            if (search) {
                query.name = {
                    $regex: search,
                    $options: 'i'
                };
            }

            // FILTER
            if (sport) {
                query.Facility_Type = {
                    $in: [sport]
                };
            }

            const result = await facilityCollection.find(query).toArray();
            res.send(result);
        });

        // app.get('/allfacilities', async (req, res) => {
        //     const result = await facilityCollection.find().toArray();
        //     res.send(result);
        // })

        // details page
        app.get('/allfacilities/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await facilityCollection.findOne(query);
            res.send(result);
        })


        // Booking..
        app.post('/booking', async (req, res) => {
            const bookingData = req.body;
            const result = await BookingCollection.insertOne(bookingData);
            res.send(result);
        })

        app.get('/booking/:id', verifyToken, async (req, res) => {
            const { id } = req.params;
            const result = await BookingCollection.find({ userId: id }).toArray();
            res.send(result);
        });

        // manage facilities
        app.get('/manageFacilities/:email', verifyToken, async (req, res) => {

            const { email } = req.params;

            const result = await facilityCollection.find({ email }).toArray();
            res.send(result);
        });

        // Cancel Booking
        app.delete('/booking/:id', async (req, res) => {
            const { id } = req.params;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await BookingCollection.deleteOne(query);
            res.send(result);
        });
        app.delete('/manageFacilities/:id', async (req, res) => {
            const { id } = req.params;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await facilityCollection.deleteOne(query);
            res.send(result);
        });

        //Edit 
        app.patch('/allfacilities/:id', async (req, res) => {
            const { id } = req.params;
            const query = {
                _id: new ObjectId(id)
            }
            const modifyBooking = req.body;
            const updateBooking = {
                $set: modifyBooking
            }
            const result = await facilityCollection.updateOne(query, updateBooking);
            res.send(result)
        })

        // await client.db("admin").command({ ping: 1 });
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