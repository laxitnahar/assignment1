const express = require('express')
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const session = require('express-session');
const mongoose = require("mongoose")
const MongoDbStore = require("connect-mongo");
const flash = require("express-flash");
const passport = require('passport');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const port = process.env.PORT || 700
const app = express()

app.use(express.json())
app.use(bodyParser.json());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: false
}))


mongoose.connect('mongodb+srv://laxit:laxit@cluster0.wuuul96.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const users = require('./config/models/register')
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile);
app.use(flash())
app.use(session({
    secret: '1234567qwdeq890QWERTY',
    resave: false,
    store: MongoDbStore.create({ mongoUrl: 'mongodb+srv://laxit:laxit@cluster0.wuuul96.mongodb.net/?retryWrites=true&w=majority' }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }

}))

const passportInit = require('./config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


app.use((req, res, next) => {
    res.locals.session = req.session
    next()
})
 
app.post('/signup', async (req, resp) => {
    var name = req.body.name
    var email = req.body.email
    var password = req.body.password
    var confirmPassword = req.body.confirmPassword

    users.exists({ email: email }, (err, result) => {
        if (result) {
            req.flash('error', "Email Already Taken")
            return resp.render('signup')
        }
    })

    const hashPass = await bcrypt.hash(password, 10)
    if (password === confirmPassword) {

        const registerUser = new users({
            name: name,
            email: email,
            password: hashPass,
        })

        await registerUser.save().then((user) => {
            return resp.redirect('/')
        }).catch(err => {
            req.flash('error', 'Something went wrong')
            return resp.render('signup')
        })
    } else {
        req.flash('error', 'Password Do Not Match')
        resp.redirect('/signup')

    }

})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
},
))



require('./config/routes')(app)
app.listen(port, (req, resp) => {
    console.log('server running')
})