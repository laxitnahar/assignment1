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


var corsOptions={
    origin:'https://login-signup-register.herokuapp.com/',
    optionSuccessStatus:200
}
const swaggerOptions = {
    swaggerDefinition: {
      info: {
        version: "1.0.0",
        title: "Customer API",
        description: "Customer API Information",
        contact: {
          name: "Amazing Developer"
        },
        servers: ["https://login-signup-register.herokuapp.com/"]
      }
    },
    // ['.routes/*.js']
    apis: ["server.js"]
  };

  const swaggerDocs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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


// Routes
/**
 * @swagger
 * /login:
 *  get:
 *    description: Used to render login
 *    responses:
 *      '200':
 *        description: A successful response
 */


/**
 * @swagger
 * /signup:
 *  get:
 *    description: Used to render login
 *    responses:
 *      '200':
 *        description: A successful response
 */

/**
 * @swagger
 * definitions:
 *  users:
 *   type: object
 *   properties:
 *    name:
 *     type: string
 *     description: name of the team
 *     example: 'javscript'
 *    email:
 *     type: string
 *     description: email of the team
 *     example: 'javascript@whizpath.com'
 *    password:
 *     type: string
 *     description: description of the team
 *     example: 'javascript'
 * 
 */

 /**
  * @swagger
  * /signup:
  *  post:
  *   summary: create employee
  *   description: create employee for the organisation
  *   requestBody:
  *    content:
  *     application/json:
  *      schema:
  *       $ref: '#/definitions/users'
  *   responses:
  *    200:
  *     description: employee created succesfully
  *    500:
  *     description: failure in creating employee
  */
  
/**
 *  @swagger
 *  /signup:
 *   post:
 *     description: 'Returns token for authorized User'
 *     tags: [user]
 *     operationId: Login
 *     consumes:
 *       - "application/json"
 *     parameters:
 *       - name: 'login'
 *         in: 'body'
 *         required: true
 *         description: 'Login Payload'
 *         schema:
 *           $ref: '#/definitions/users'
 *     responses:
 *       200:
 *         description: Successful login
 *         schema:
 *           $ref: '#/definitions/LoginSuccess'
 *       400:
 *         description: Bad Request
 *       404:
 *         schema:
 *           type: string
 *         description: User not found
 *       500:
 *         schema:
 *           type: string
 *         description: Server error
 */

 /**
  * @swagger
  * /signup:
  *  post:
  *   summary: create employee
  *   description: create employee for the organisation
  *   requestBody:
  *    content:
  *     application/json:
  *      schema:
  *       $ref: '#/definitions/users'
  *   responses:
  *    200:
  *     description: employee created succesfully
  *    500:
  *     description: failure in creating employee
  */
  
/**
 *  @swagger
 *  /login:
 *   post:
 *     description: 'Returns token for authorized User'
 *     tags: [user]
 *     operationId: Login
 *     consumes:
 *       - "application/json"
 *     parameters:
 *       - name: 'login'
 *         in: 'body'
 *         required: true
 *         description: 'Login Payload'
 *         schema:
 *           $ref: '#/definitions/users'
 *     responses:
 *       200:
 *         description: Successful login
 *         schema:
 *           $ref: '#/definitions/LoginSuccess'
 *       400:
 *         description: Bad Request
 *       404:
 *         schema:
 *           type: string
 *         description: User not found
 *       500:
 *         schema:
 *           type: string
 *         description: Server error
 */



require('./config/routes')(app)
app.listen(port, (req, resp) => {
    console.log('server running')
})