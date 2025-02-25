const express = require('express');
 const app = express();
const bp = require('body-parser');
app.use(bp.json());

app.use(bp.urlencoded({extended: false}));
const cors = require('cors');
const path = require('path');
app.use(cors());
const multer = require('multer');

app.set("view engine", "ejs");
app.use(express.json());


//console.log(app);
var Mongodb = require('mongodb')

const MongoClient = require('mongodb').MongoClient

const uri = "mongodb+srv://restaurant_user:Sanna19396@cluster0.sr3zl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//stridedgetech:SOh3TbY%24x8ypJPxmt1%26OfL@83.223.113.92:27017/?authSource=mydb&authMechanism=SCRAM-SHA-1
// admin// stridedgetech
//SOh3TbY$x8ypJPxmt1&OfL
if(uri){
    console.log('connected to db')
}else{
    console.log('not connected to db')
}


    // const mongoose = require('mongoose');
    // mongoose.connect('mongodb://0.0.0.0:27017/')
    // var db = mongoose.connection;
    // db.on('error',()=>console.log('Eroor in connecting database'))
    // db.once('open',()=>console.log('connected to database'))
// Create a new client and connect to MongoDB
 const client = new MongoClient(uri);





const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');


const fs = require('fs');

// const res_users = require('../client/src/model/User');

// const res_menu = require('../client/src/model/Menu');

// const res_order = require('../client/src/model/userOrder');

// const res_table = require('../client/src/model/Table');

// const res_bill = require('../client/src/model/Bill');

 const database = client.db("mydb");
   

app.get('/api/signup', async(req,res)=>{
    try{
        const result = await database.collection('res_users').find({}).toArray();
        res.send({status:"ok", data:result})
    }catch(err){
        console.log(err);
    }
})



app.post('/api/signup', async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    var data = {
   username:username,
   password:password
};
     try{
        const user = await database.collection('res_users').findOne({username:username})
        if(user){
            res.status(422).json({ message: "Username already exists" })
        }else{
            // const result = new res_users({
            //     username:username,
            //     password:password
            // })
            // res.status(200).json({ message: "Signup Successfully"})
            // await result.save()
            // res.send(result)

        database.collection('res_users').insertOne(data);
          console.log('inserted')
           res.status(200).json({ message: "Signup Successfully"})
          
 		}
    }catch(err){
        console.log(err);
    }
})

app.get('/api/login', async(req,res)=>{
    try{
        const result = await database.collection('res_users').find({}).toArray();
        res.send({status:"ok", data:result})
    }catch(err){
        console.log(err);
    }
})

app.post("/api/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
   //console.log(username)
    try {
        const user = await database.collection('res_users').findOne({username:username})
        if (user.username === "admin@gmail.com" && user.password === password) {
            res.status(201).json({ message: "Login Successfully", auth: true})
        } else if(user.password == password){
            const token = jwt.sign({_id:user._id},"secrate");
            const decodetoken = jwt.decode(token);
            const userId = decodetoken._id;
            //console.log(userId);
            res.status(201).json({ message: "Login Successfully", auth: false, userId: userId})
        }else {
            res.status(422).json({ error: "Login failed" })
        }

    } catch (err) {
        console.log(err);
    }

})
app.use('/images', express.static(path.join(__dirname, 'images')));
 const { v4: uuidv4 } = require('uuid');


//  const storage = multer.memoryStorage({
//     destination: (req,file,cb)=>{
//         cb(null, 'images')
//     },
//     filename:(req,file,cb)=>{
//         cb(null, file.originalname);
//     }
// });

//const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if(allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    }else(
        cb(null, false)
    )
}

const storage = multer.memoryStorage(); // Keep images in memory
const upload = multer({ storage });



app.get('/api/menu', async(req,res)=>{
    try{
        const result = await database.collection('res_menu').find({}).toArray();
        
        
        const updatedMenuItems = result.map(item => ({
        ...item,
        file: `/images/${item.file}` // Add the '/images/' prefix
    }));
res.send({status:"ok", data:updatedMenuItems})
    
    
    }catch(err){
        console.log(err);
    }
})



app.post('/api/menu',upload.single('file'), async(req, res, next) =>{
    const cat_name = req.body.cat_name;
    const price = req.body.price;
    const Categories = req.body.Categories;
    const file = req.file ? req.file.buffer.toString('base64') : null; // Handle undefined file
    const priceWithGST = req.body.priceWithGST;

    const newItem = {
        cat_name,
        price,
        Categories,
        file,
         priceWithGST,
    }

    database.collection('res_menu').insertOne(newItem);
   // console.log('inserted')
     res.status(200).json({ message: "data successfully inserted",newItem:{newItem}})
    
});

app.put("/api/menu/:editId", upload.single("file"), async (req, res) => {
    try {
        const id = req.params.editId;
        const updateFields = { ...req.body };

        // If a file was uploaded, add it to updateFields
        if (req.file) {
            updateFields.file = req.file?.filename; // Store the filename in DB
        }

        const updatedata = { $set: updateFields };

        // Perform the update operation
        const result = await database.collection("res_menu").updateOne(
            { _id: new Mongodb.ObjectId(id) },
            updatedata
        );

        // Check if the update was successful
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Item not found!" });
        }

        // Fetch updated item and send response
        const updatedItem = await database.collection("res_menu").findOne({ _id: new Mongodb.ObjectId(id) });

        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

  app.delete("/api/menu/:index",async(req,res)=>{
    try {
        const id = req.params.index;  // Get the id from the URL parameter
        //console.log(id)
        // Find and delete the item by its _id in the collection
        const result = await database.collection('res_menu').deleteOne(
          { '_id': new Mongodb.ObjectId(id) }
        );
        
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Item deleted successfully" });
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
})

app.get('/api/categories', async(req,res)=>{
    try{
        const result = await database.collection('res_cat').find({}).toArray();
        res.send({status:"ok", data:result})
    
    }catch(err){
        console.log(err);
    }
})



app.post('/api/categories',upload.single('file'),async(req, res, next) =>{
    // console.log(req.file.destination)
    const cat_name = req.body.cat_name;
    const file = req.file.buffer.toString('base64');
     //console.log(file)

    const newItem = {
        cat_name,
         file
    }

    database.collection('res_cat').insertOne(newItem);
   // console.log('inserted')
     res.status(200).json({ message: "data successfully inserted",newItem:{newItem}})
});

app.put("/api/categories/:editId", upload.single("file"), async (req, res) => {
    try {
        const id = req.params.editId;
        const updateFields = { ...req.body };

        // If a file was uploaded, add it to updateFields
        if (req.file) {
            updateFields.file = req.file?.filename; // Store the filename in DB
        }

        const updatedata = { $set: updateFields };

        // Perform the update operation
        const result = await database.collection("res_cat").updateOne(
            { _id: new Mongodb.ObjectId(id) },
            updatedata
        );

        // Check if the update was successful
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Item not found!" });
        }

        // Fetch updated item and send response
        const updatedItem = await database.collection("res_cat").findOne({ _id: new Mongodb.ObjectId(id) });

        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
  });

  app.delete('/api/categories/:index',async(req,res)=>{
    try {
        const id = req.params.index;  // Get the id from the URL parameter
        //console.log(id)
        // Find and delete the item by its _id in the collection
        const result = await database.collection('res_cat').deleteOne(
          { '_id': new Mongodb.ObjectId(id) }
        );
        
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Item deleted successfully" });
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
})

app.get('/api/table', async(req,res)=>{
    try{
        const data = await database.collection('res_table').find({}).toArray();
        res.send({status:"ok", data:data})
    }catch(err){
        console.log(err);
    }
})

app.post('/api/table', async(req,res)=>{
    // const {tableno} = req.body;
    const data = {
        addtable:req.body.addtable,
        status:req.body.status,
        createdat:new Date()
    }
try{
    database.collection('res_table').insertOne(data);
     res.status(200).json({ message: "table booked"})
}catch(err){
    console.log(err)
}
})


app.put("/api/table/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updateFields = { ...req.body }; // Spread req.body directly

        const updatedata = { $set: updateFields };

        // Perform the update operation
        const result = await database.collection("res_table").updateOne(
            { _id: new Mongodb.ObjectId(id) },
            updatedata
        );

        // Check if the update was successful
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Item not found!" });
        }

        // Fetch updated item and send response
        const updatedItem = await database.collection("res_table").findOne({ _id: new Mongodb.ObjectId(id) });

        res.status(200).json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});



app.delete('/api/table/:index',async(req,res)=>{
    try {
        const id = req.params.index;  // Get the id from the URL parameter
        //console.log(id)
        // Find and delete the item by its _id in the collection
        const result = await database.collection('res_table').deleteOne(
          { '_id': new Mongodb.ObjectId(id) }
        );
        
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Item deleted successfully" });
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
})

app.get("/api/order", async(req,res)=>{
    try{
        const data = await database.collection('res_ordered').find({}).toArray();
        res.send(data);
    }catch(err){
        console.log(err);
    }
});

app.get("/api/ordered", async(req,res)=>{
    try{
        const data = await database.collection('res_ordered').find({}).toArray();
        res.send(data);
    }catch(err){
        console.log(err);
    }
});

app.get("/api/ordered/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Ensure the ID is in ObjectId format
    const objectId = new Mongodb.ObjectId(id);
console.log(objectId)
    const order = await database.collection("res_ordered").findOne({ _id: objectId });

    //console.log(order); // Log the result to debug

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "order not found" });
    }
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ordered', async(req,res)=>{
     const { orderItems } = req.body;
     // Ensure orderItems is an array of objects
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'Invalid order data' });
    }
    try{
       const result = await database.collection('res_ordered').insertOne({
     orderItems,
    });
        res.status(200).json({ message: 'Order placed successfully', orderId: result });
    }catch(err){
        console.log(err);
    }
})


app.put('/api/ordered/:id', async (req, res) => {
    const id = req.params.id;
    const updatedata = {
        $set:req.body  // Only update the status field
    };

    try {
        const result = await database.collection('res_ordered').updateOne(
           { '_id' : new Mongodb.ObjectId(id) }, updatedata
            
        );


        res.status(200).json({ message: "Order updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.delete('/api/ordered/:index',async(req,res)=>{
    try {
        const id = req.params.index;  // Get the id from the URL parameter
        //console.log(id)
        // Find and delete the item by its _id in the collection
        const result = await database.collection('res_ordered').deleteOne(
          { '_id': new Mongodb.ObjectId(id) }
        );
       // console.log(result)
        
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "Item deleted successfully" });
        } else {
          res.status(404).json({ message: "Item not found" });
        }
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
})


app.get("/api/invoice", async (req,res) => {
     try{
        const data = await database.collection('invoices').find({}).toArray();
        res.send(data);
    }catch(err){
        console.log(err);
    }
})

app.post("/api/invoice", async (req, res) => {
  try {
    const { tableNo, orders, totalAmount,tokenNo } = req.body;
    
    if (!tableNo || !orders || orders.length === 0) {
      return res.status(400).json({ message: "Invalid invoice data" });
    }

    const invoice = {
      tableNo,
      tokenNo,
      orders,
      totalAmount,
      createdAt: new Date()
    };

    const result = await database.collection("invoices").insertOne(invoice);

    res.status(201).json({ message: "Invoice saved successfully", invoiceId: result.insertedId });
  } catch (error) {
    console.error("Error saving invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/invoice/:tableNo", async (req, res) => {
  try {
    const tableNo = isNaN(req.params.tableNo) ? req.params.tableNo : parseInt(req.params.tableNo, 10);
    const invoice = await database.collection("invoices").findOne({ tableNo });

    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ message: "Invoice not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/invoice/:tableNo", async (req, res) => {
  try {
    const tableNo = isNaN(req.params.tableNo) ? req.params.tableNo : parseInt(req.params.tableNo, 10);
    const updateData = req.body;

    const result = await database.collection("invoices").updateOne({ tableNo }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({ message: "Invoice updated successfully", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const cheerio = require('cheerio');
const axios = require('axios');


app.get('/gst-rates', async (req, res) => {
    try {
      const response = await axios.get('https://cbic-gst.gov.in/gst-goods-services-rates.html');
  
      const $ = cheerio.load(response.data);
      const data = [];
  
      $('table tr').each((index, element) => {
        const description = $(element).find('td').eq(2).text();
        if (description.includes('(ii) Supply of ‘restaurant service’ other than at ‘specified premises’')) {
          const row = {
            description: $(element).find('td').eq(2).text(),
            cgstRate: $(element).find('td').eq(3).text(),
            sgstRate: $(element).find('td').eq(4).text(),
            igstRate: $(element).find('td').eq(5).text(),
            condition: $(element).find('td').eq(6).text(),
          };
          data.push(row);
        }
      });
  
      res.json(data);
    } catch (error) {
      console.error('Error details:', error);
      console.error('Error stack:', error.stack); // Log the full error stack
      res.status(500).send('Error fetching data');
    }
  });
  
app.listen(5000, () => {
    console.log(`Server running at 5000`);
  });


  module.exports = app;