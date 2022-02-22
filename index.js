const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
const mongoose = require('mongoose');
app.use(express.json());
app.use(express.static('build'));
mongoose.connect(
    "mongodb+srv://pranshunagar01:%2Apranshunagar01%23@cluster0.gsjk9.mongodb.net/procolab?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );
  app.use(function(req,res,next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
const projectSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    admin: {type: Array,
        required: true,
        default: []
    },
    collaborators: {
        type: Array,
        default: []
    },
    title: {
        type: String,
        required:true
    },
    code: {
        type: String,
        default: ""
    },
    language: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    } ,
    date: Date,
    chats: {
        type: Array,
        default: []
    }
})

const Project = mongoose.model("Project", projectSchema);

app.post("/viewReq", (req, res)=>{
    console.log(req.body);
    res.send(req.body);
})

app.post("/newProject", (req, res)=>{
    const newProj = new Project({
        _id: req.body.id,
        admin: req.body.admin,
        collaborators: req.body.collaborators,
        title: req.body.title,
        code: req.body.code,
        language: req.body.language,
        description: req.body.description,
        date: Date()
    });
    newProj.save(function(err){
        if(err){
            console.log(err)
        }
        else{
            res.send();
        }
    });
});
app.get("/readProjectsAdmin/:name", (req, res)=>{
    Project.find({admin: {email: req.params.name, permissions: 100, admin: true}}, (err, elem)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(elem);
        }
    })
})
app.get("/particularProject/:id", (req, res)=>{
    Project.find({_id: req.params.id}, function(err, elem){
        if(err){
            res.send(err);
        }
        else{
            res.header("Access-Control-Allow-Origin", "*");
            res.send(elem)
        }
    })
})
app.get("/readProjectsCollaborator/:name", (req, res)=>{
    Project.find({$or: [{ collaborators:  {email: req.params.name, permissions: 100, admin: false}}, { collaborators:  {email: req.params.name, permissions: 40, admin: false}}, { collaborators:  {email: req.params.name, permissions: 0, admin: false}}, { collaborators:  {email: req.params.name, permissions: 100, admin: true}}]}, (err, elem)=>{
        if(err){
            res.send(err);
        }
        else{
            res.send(elem);
        }
    })
})
app.post("/updateCode", (req, res)=>{
    Project.updateOne({_id: req.body.id}, {code: req.body.newCode}, function(err){
        if(err){
            res.send(err);
        }
        else{
            res.send(200);
        }
    })
})
app.post("/removeCollaborator", (req, res)=>{
    Project.update(
        {_id: req.body.id},
        {$pull: {collaborators: req.body.collaboratorToBeRemoved}},
        function(err){
            if(err)res.send(err);
            else{res.send(200);}
        }
    )
})
app.post("/removeAdmin", (req, res)=>{
    Project.update(
        {_id: req.body.id},
        {$pull: {admin: req.body.adminToBeRemoved}},
        function(err){
            if(err)res.send(err);
            else{res.send(200);}
        }
    )
})
app.post("/deleteProject", (req, res)=>{
    Project.deleteMany({_id: req.body.id}, function(error){
        if(error){
            res.send(error);
        }
        else{
            res.send(200);
        }
    })
})
app.post("/changeCollaboratorPermissions", (req, res)=>{
    Project.find(
        {_id: req.body.id, "collaborators.email": req.body.collaboratorName},
        function(err, elem){
            if(err){
                res.send(err);
            }
            else{
                let newArr = [];
                for(let i = 0; i <(elem[0].collaborators).length; i++){
                    if(elem[0].collaborators[i].email !== req.body.collaboratorName)
                        newArr.push(elem[0].collaborators[i]);
                    else{
                        newArr.push({
                            email: elem[0].collaborators[i].email,
                            permissions: req.body.newPermissions,
                            admin: elem[0].collaborators[i].admin
                        })
                    }
                }
                Project.updateOne({_id: req.body.id}, {collaborators: newArr}, function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.send(200);
                    }
                })
            }
        }
    )
})
app.post("/addMessageToChat", (req, res)=>{
    let newMessage = {
        author: req.body.author,
        message: req.body.message,
        time: Date()
    }
    Project.update(
        {_id: req.body.id},
        {$push: {chats: newMessage}},
        function(err){
            if(err){
                res.send(err);
            }
            else{
                res.send("Success");
            }
        }
    )
})
app.listen(process.env.PORT||3002, ()=>{
    console.log("The server is up and running at 3002");
})

