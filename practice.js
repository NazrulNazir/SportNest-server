const express = require('express');
const app = express();
const cors = require('cors');
const { ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// midleware
app.use(express.json());
app.use(cors());

const client = 'This is client';

const run = ()=> {

    try{
        const db = client.db('PracticeProject');
        const ProductCollections = db.collection('products');

        //get

        app.get('/products', async(req, res)=> {
            const products = await ProductCollections.find().toArray();
            res.send(products);
        })

        //details page

        app.get('/products/:id', async (req, res)=> {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }

            const user = await ProductCollections.findOne(query);
            res.send(user);
        })

        // post ==> create 
        app.post('/users', async (req, res)=> {
            const product = req.body;
            const results = await ProductCollections.insertOne(product);
            res.send(results);
        });

        // edit 

        app.patch('/products/:id', async (req, res)=> {
            const id = req.params.id;
            const filter = {
                _id : new ObjectId(id)
            }

            const modifyProduct = req.body;
            const updateProduct = {
                $set: {
                    name: updateProduct.name,
                    email: updateProduct.email
                }
            }
            const resuls = await ProductCollections.updateOne(filter, updateProduct);
            res.send(resuls)
        })

        // delete 

        app.delete('/products/:id', async(req, res)=> {
            const id = req.params.id;
            const query = {
                _id = new ObjectId(id)
            }
            const result = await ProductCollections.deleteOne(query);
            res.send(result)
        })




    }finally{
        await client.close()
    }
    
}
run().catch(console.dir);


app.get('/', (req, res)=> {
    res.send('This is home page')
})

app.listen(port, ()=>{
    console.log(port)
})