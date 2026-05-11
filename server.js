const express = require('express');
const app = express();
const fs = require('fs');
const session = require("express-session");
const cookie = require('cookie-parser');
const e = require('express');
const multer = require('multer')
const mongodb = require('mongodb');
const { name } = require('ejs');
const { ObjectId } = require('mongodb');
const client = mongodb.MongoClient;
let dbinstance;

app.set('view engine', 'ejs');


client.connect('mongodb://127.0.0.1:27017')
    .then(data => {
        dbinstance = data.db('Soumyajit');
        if (dbinstance) {
            console.log("Database Connected");
        }
        else {
            console.log('hello');
            console.log(err);
        }
    });
// mongodb+srv://soumyajit2004:mongo004@backend.2bwkmvt.mongodb.net/
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true })); // middleware for handling form data
app.use(express.json());  // middleware for parsing
app.use(session({ 
    saveUninitialized: true,
    resave: false,
    secret: "abc",
    cookie: {
        maxAge: undefined
    }
}))


function check2(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login')
    }
    else {
        next();
    }
}
function check(req, res, next) {
    if (req.session.user && (req.originalUrl !== '/signup')) {
        res.redirect("/home");
    } else {
        next();
    }
}
function auth(req, res, next) {
    if (!req.session.user)
        res.redirect('/login');
    else if (req.session.user.role == 'admin')
        next();
}

app.get('/cart', check2, (req, res) => {
    res.sendFile(__dirname + "/cart.html")
})

app.get(['/', '/signup'], check, (req, res) => {
    res.sendFile(__dirname + "/signup.html")
})

app.get('/admin', auth, (req, res) => {
    dbinstance.collection('user').find().toArray().then((users) => {
        dbinstance.collection('booking').find().toArray().then((bookings) => {
            console.log(bookings);
            res.render('admin', { users: users, bookings: bookings })
        })
    })
})          
app.get('/login', check, (req, res) => {
    res.sendFile(__dirname + "/contact.html");
})
app.get('/home', (req, res) => {
    res.sendFile(__dirname + "/index.html");

})

app.get('/menu', (req, res) => {
    res.sendFile(__dirname + "/menu.html")
})

app.get('/contact', (req, res) => {
    res.sendFile(__dirname + "/contact.html");
})

app.get('/index', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

// app.get('/restaurant website/Restaurant Website Free/css/cart.css', (req, res) => {
//     res.sendFile(__dirname + '/path/to/cart.css', {
//         headers: {
//             'Content-Type': 'text/css'
//         }
//     });
// });


app.get('/service', (req, res) => {
    res.sendFile(__dirname + "/service.html");
})
app.get('/about', (req, res) => {
    res.sendFile(__dirname + "/about.html");
})
app.get('/team', (req, res) => {
    res.sendFile(__dirname + "/team.html");
})
app.get('/testimonial', (req, res) => {
    res.sendFile(__dirname + "/testimonial.html");
})

app.get('/booking', (req, res) => {
    res.sendFile(__dirname + "/booking.html");
})

app.get('/cartcheck', check2, (req, res) => {
    res.send();
})
app.post('/login', (req, res) => {
    const userData = req.body;
    dbinstance.collection('user').find({ email: userData.email }).toArray().then((data) => {
        if (data.length == 0) {
            res.redirect('/signup');
        } else {
            req.session.user = data[0];
            console.log(req.session.user.role);
            if (req.session.user.role == 'admin')
                res.redirect('/admin');
            else
                res.redirect('/home');
        }
    })
});

app.post('/signup', (req, res) => {
    const userData = req.body;
    dbinstance.collection('user').find({ name: userData.name, email: userData.email }).toArray().then((data) => {
        if (data.length > 0) {
            res.redirect('/login');
        } else {
            req.body.role = 'user';
            dbinstance.collection('user').insertOne(req.body).then(() => {
                res.redirect('/login');
            }).catch(err => {
                console.log(err);
            })
        }
    })
})

app.post('/booking', (req, res) => {
    let bokingInfo = req.body;
    dbinstance.collection('booking').insertOne(bokingInfo).then(() => {
        res.redirect('/home');
    }).catch((err) => {
        console.log(err);
    })
})


app.post('/orderQ', (req, res) => {
    dbinstance.collection('order').insertOne({ name: req.session.user.name, que: req.body.que }).then(() => {
        dbinstance.collection('order').find().toArray().then((data) => {
            res.json(data.length);
        })
    })
})

// admin delete

// Handle DELETE requests for deleting bookings
app.delete('/delete/booking/:id', (req, res) => {
    const bookingId = req.params.id;
    console.log('Deleting booking with ID:', bookingId);
    dbinstance.collection('booking').deleteOne({ _id: new mongodb.ObjectId(bookingId) }, (err, result) => {
        if (err) {
            console.error('Error deleting booking:', err);
            res.sendStatus(500); // Internal Server Error
            return;
        }
        console.log('Booking deleted successfully:', result);
        res.sendStatus(200); // OK
    });
});

// Handle DELETE requests for deleting users
app.delete('/delete/user/:id', (req, res) => {
    const userId = req.params.id;
    console.log('Deleting user with ID:', userId);
    dbinstance.collection('user').deleteOne({ _id: new mongodb.ObjectId(userId) }, (err, result) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.sendStatus(500); // Internal Server Error
            return;
        }
        console.log('User deleted successfully:', result);
        res.sendStatus(200); // OK
    });
});


//admin end


app.listen(3000, (err) => {
    if (err)
        console.log(err);
    else
        console.log("SuccessFully Connected to Server");
}); 