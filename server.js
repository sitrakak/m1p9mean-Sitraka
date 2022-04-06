// Use Express
var express = require("express");
// Use body-parser
var bodyParser = require("body-parser");
// Use MongoDB
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
// The database variable
var database;
// The products collection
var PRODUCTS_COLLECTION = "products";

// Create new instance of the express server
var app = express();

// Define the JSON parser as a default way 
// to consume and produce data through the 
// exposed APIs
app.use(bodyParser.json());

// Create link to Angular build directory
// The ng build command will save the result
// under the dist folder.
var distDir = __dirname + "/dist/node-express-angular/";
app.use(express.static(distDir));

// Local database URI.
const LOCAL_DATABASE = "mongodb+srv://sisi:Sitraka1@cluster0.1phmo.mongodb.net/E-kaly?retryWrites=true&w=majority";

// Local port.
const LOCAL_PORT = 8080;

// Init the server
mongodb.MongoClient.connect(process.env.MONGODB_URI || LOCAL_DATABASE,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }, function (error, client) {

        // Check if there are any problems with the connection to MongoDB database.
        if (error) {
            console.log(error);
            process.exit(1);
        }

        // Save database object from the callback for reuse.
        database = client.db('E-kaly');
        console.log("Database connection done.");

        //const db = client.db('star-wars-quotes2')
        //const quotesCollection = db.collection('quotes')

        // Initialize the app.
        var server = app.listen(process.env.PORT || LOCAL_PORT, function () {
            var port = server.address().port;
            console.log("App now running on port", port);
        });
    });

/*  "/api/status"
 *   GET: Get server status
 *   PS: it's just an example, not mandatory
 */
app.get("/api/status", function (req, res) {
    res.status(200).json({ status: "UP" });
});

/*  "/api/products"
 *  GET: finds all products
 */
app.get("/api/products", function (req, res) {
    database.collection('products').find({}).toArray(function (error, data) {
        if (error) {
            manageError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(data);
        }
    });
});

/*  "/api/products"
 *   POST: creates a new product
 */
app.post("/api/products", function (req, res) {
    var product = req.body;

    if (!product.name) {
        manageError(res, "Invalid product input", "Name is mandatory.", 400);
    } else if (!product.brand) {
        manageError(res, "Invalid product input", "Brand is mandatory.", 400);
    } else {
        database.collection('products').insertOne(product, function (err, doc) {
            if (err) {
                manageError(res, err.message, "Failed to create new product.");
            } else {
                res.status(201).json(doc.ops[0]);
            }
        });
    }
});

/*  "/api/products/:id"
 *   DELETE: deletes product by id
 */
app.delete("/api/products/:id", function (req, res) {
    if (req.params.id.length > 24 || req.params.id.length < 24) {
        manageError(res, "Invalid product id", "ID must be a single String of 12 bytes or a string of 24 hex characters.", 400);
    } else {
        database.collection(PRODUCTS_COLLECTION).deleteOne({ _id: new ObjectID(req.params.id) }, function (err, result) {
            if (err) {
                manageError(res, err.message, "Failed to delete product.");
            } else {
                res.status(200).json(req.params.id);
            }
        });
    }
});


//Get all user
app.get("/api/users", function (req, res) {
    database.collection('user').find({}).toArray(function (error, data) {
        if (error) {
            manageError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(data);
        }
    });
});
//Get all resto ekaly
app.get("/api/users/restos-ekaly", function (req, res) {
    database.collection('user').find({profil:"resto",ekaly:"oui"}).toArray(function (error, data) {
        if (error) {
            manageError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(data);
        }
    });
});
//Get all resto 
app.get("/api/users/restos", function (req, res) {
    database.collection('user').find({profil:"resto"}).toArray(function (error, data) {
        if (error) {
            manageError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(data);
        }
    });
});


//Get all plats by resto 
app.get("/api/plats/:id_resto", function (req, res) {
    var id=req.params.id_resto;
    var ObjectId = require('mongodb').ObjectID;
    database.collection('plats').find({ _id: ObjectId(id) }).toArray(function (error, data) {
        if (error) {
            manageError(res, err.message, "Failed to get contacts.");
        } else {
            res.status(200).json(data);
        }
    });
});







//Login
app.post("/api/users/login", function (req, res) {
    var user = req.body;
    console.log(user.email);
    console.log(user.mdp);
    database.collection('user').findOne({ email: user.email,mdp:user.mdp })
        .then(quotes => {
          res.status(200).json(quotes);
        })
});



//Insert user
app.post("/api/users", function (req, res) {
    var user = req.body;

    if (!user.nom) {
        manageError(res, "Invalid product input", "Name is mandatory.", 400);
    } else if (!user.prenom) {
        manageError(res, "Invalid product input", "Brand is mandatory.", 400);
    } else {
        database.collection('user').insertOne(user, function (err, doc) {
            if (err) {
                manageError(res, err.message, "Failed to create new product.");
            } else {
                res.status(201).json(doc.ops[0]);
            }
        });
    }
});






//Check mail exist
app.get('/api/users/:mail', (req, res) => {
    var mail=req.params.mail;
    var ObjectId = require('mongodb').ObjectID;
    database.collection('user').findOne({ email: mail })
      .then(quotes => {
        res.status(200).json(quotes);
      })
      .catch(/* ... */)
  })






// Errors handler.
function manageError(res, reason, message, code) {
    console.log("Error: " + reason);
    res.status(code || 500).json({ "error": message });
}