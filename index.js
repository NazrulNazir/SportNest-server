const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

dotenv.config();

const app = express();
const port = process.env.PORT;

// middleware
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const db = client.db('SportNest');
        const SportNestCollection = db.collection('AllFacilities');
        const featuredFacilities = db.collection('FeatureFacilities');
        const facilityCollection = db.collection('facilities');
        const BookingCollection = db.collection('bookings');

        // 🔐 JWKS
        const JWKS = createRemoteJWKSet(
            new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
        );

        // 🔐 middleware
        const verifyToken = async (req, res, next) => {

            const authHeader = req?.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const token = authHeader.split(" ")[1];

            if (!token) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            try {
                const { payload } = await jwtVerify(token, JWKS);
                req.user = payload; // optional
                next();
            } catch (error) {
                return res.status(403).json({ message: 'Forbidden' });
            }
        };

        // ================= ROUTES =================

        app.get('/FeaturedFacilities', async (req, res) => {
            const facilities = await featuredFacilities.find().toArray();
            res.send(facilities);
        });

        app.get('/destinations', async (req, res) => {
            const result = await SportNestCollection.find().toArray();
            res.send(result);
        });

        app.post('/allfacilities', async (req, res) => {
            const facilities = req.body;
            const result = await facilityCollection.insertOne(facilities);
            res.send(result);
        });

        app.get('/allfacilities', async (req, res) => {

            const search = req.query.search || '';
            const sport = req.query.sport || '';

            let query = {};

            if (search) {
                query.name = {
                    $regex: search,
                    $options: 'i'
                };
            }

            if (sport) {
                query.Facility_Type = {
                    $in: [sport]
                };
            }

            const result = await facilityCollection.find(query).toArray();
            res.send(result);
        });

        // details
        app.get('/allfacilities/:id', verifyToken, async (req, res) => {
            const id = req.params.id;

            const result = await facilityCollection.findOne({
                _id: new ObjectId(id)
            });

            res.send(result);
        });

        // booking
        app.post('/booking', async (req, res) => {
            const bookingData = req.body;
            const result = await BookingCollection.insertOne(bookingData);
            res.send(result);
        });

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

        // delete booking
        app.delete('/booking/:id', async (req, res) => {
            const { id } = req.params;

            const result = await BookingCollection.deleteOne({
                _id: new ObjectId(id)
            });

            res.send(result);
        });

        // delete facility
        app.delete('/manageFacilities/:id', async (req, res) => {
            const { id } = req.params;

            const result = await facilityCollection.deleteOne({
                _id: new ObjectId(id)
            });

            res.send(result);
        });

        // update
        app.patch('/allfacilities/:id', async (req, res) => {
            const { id } = req.params;
            const modifyBooking = req.body;

            const result = await facilityCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: modifyBooking }
            );

            res.send(result);
        });

        console.log("MongoDB connected successfully");

    } catch (error) {
        console.log(error);
    }
}

run().catch(console.dir);

// root
app.get('/', (req, res) => {
    res.send('This is SportNest Website');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});