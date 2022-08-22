const users = require('./models/register')


function initRoutes(app) {
    app.get('/', (req, resp) => {
        return resp.render('index')
    })

    app.get('/login', (req, resp) => {
        return resp.render('login')
    })
    app.get('/signup', (req, resp) => {
        return resp.render('signup')
    })
    app.get('/logout', (req, resp) => {
        req.logout(req.user, err => {
            if (err) return next(err);
            resp.redirect("/");
        });
    })
    app.get('/delete',async(req,resp)=>{
       
        await users.deleteOne({_id:req.session.passport.user})
        resp.redirect('/logout')
    })
}

module.exports = initRoutes;