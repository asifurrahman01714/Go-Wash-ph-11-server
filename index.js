const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

console.log(process.env.DB_NAME);
console.log(process.env.DB_USER);
console.log(process.env.DB_PASS);
const app = express()

app.use(express.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0oc6t.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
   
    const bookCollection = client.db(`${process.env.DB_NAME}`).collection("book");
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("review");
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("service");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
    console.log('database connected successfully');


    // Book services...

    app.post('/Book', (req, res) => {
        
        const name = req.body.name;
        const service = req.body.service;
        const description = req.body.description;
        const email = req.body.email;
        
        console.log(name, service,description, email);
        
        bookCollection.insertOne({ name, service,description, email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })


    app.get('/bookingList', (req, res) => {
        bookCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    // Review and see review list..

    app.post('/addAReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const from = req.body.from;
        const quote = req.body.quote;
        const email = req.body.email;
        
        console.log(name, from, quote, email, file);
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        reviewCollection.insertOne({ name, from, quote, email, image})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })


    

    app.get('/reviewList', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })



    // Add Services...
    app.post('/addAService', (req, res) => {
        const name = req.body.name;
        const service1 = req.body.service1;
        const service2 = req.body.service2;
        const service3 = req.body.service3;
        
        console.log(name, service1, service2, service3);
        serviceCollection.insertOne({ name, service1, service2, service3})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/serviceList', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/book/:id',(req, res) =>{
        serviceCollection.find({_id : ObjectID(req.params.id)})
        .toArray((err, documents) =>{
            res.send(documents);
        })
    } )


    // Add A admin...
    app.post('/addAAdmin', (req, res) => {
        
        const name = req.body.name;
        const email = req.body.email;
        console.log(name, email);
       
        adminCollection.insertOne({ name, email })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })



    app.get('/admins', (req, res) => {
        adminCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        console.log(req.body);
       
        adminCollection.find({ email:email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })


});


app.listen(process.env.PORT || port)