const express = require("express");
const router = express.Router();
const Project = require('./../models/project.model');
const User = require('./../models/user.model');
const createError = require('http-errors');
const uploader = require('./../config/cloudinary-setup')
const mongoose = require('mongoose')

//POST   '/api//projectUpload'   => upload project image
router.post("/projectupload", uploader.single("image"), (req, res, next) => {
    console.log("file is: ", req.file);
  
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    // get secure_url from the file object and save it in the
    // variable 'secure_url', but this can be any name, just make sure you remember to use the same in frontend
    res.json({ secure_url: req.file.secure_url });
  });



//GET  '/api//projects'   => get all the projects
router.get('/projects',(req,res,next)=>{
    Project
       .find()
       .populate('owner')
       .then((allProjects)=>{
           res
             .status(200)
             .json(allProjects);
       })
       .catch((err)=>{
           next(createError(err));
       })
})

//POST  '/api//projects'   => create a project
router.post('/projects',(req,res,next)=>{
    const {title,type,lookingFor, location, fee, coverURL, description} = req.body;
    
    //filter input value
    if(title==="" || type==="" || lookingFor===""){
        res.status(400).json({ message: "Title type and lookingFor can't be empty" });
        return;
    }

    Project.create({title, type, lookingFor, location, fee, coverURL, description, status:"open", owner:req.session.currentUser._id})
       .then((createdProject)=>{
           res
             .status(201)
             .json(createdProject)
       })
       .catch((err)=>{
        next(createError(err));
    })


})


//GET  '/api/projects/:projectId'   => show a project detail
router.get('/projects/:projectId', (req, res, next) => {

    const { projectId } = req.params;

    Project
      .findById( projectId )
      .populate('owner')
      .then( (foundProject) => {
        res
          .status(200)          // OK
          .json(foundProject);
      })
      .catch( (err) => {
        next(createError(err));
      });
  })


//PUT  '/api/projects/:projectId'   => edit a project
router.put('/projects/:projectId', (req,res,next)=>{
    const {projectId} = req.params;
    const {title,type,lookingFor, location, fee, coverURL, description, status} = req.body;

    Project
       .findByIdAndUpdate(projectId,{title,type,lookingFor, location, fee, coverURL, description, status},{new:true})
       .then((updatedProject)=>{
           res.status(200).json(updatedProject)
       })
       .catch( (err) => {
        next(createError(err));
      });

})

//DELETE  '/api/projects/:projectId'   => delete a project
router.delete('/projects/:projectId',(req,res,next)=>{
    const {projectId} = req.params;

    Project.findByIdAndRemove(projectId)
      .then(()=>{
          res
            .status(202)
            .send(`Document ${projectId} was removed successfully.`)
      })
      .catch( (err) => {
        next(createError(err));
      });
})

//GET /api/projects/acceptation/:projectId/:userId  => change a user from project requests to project participants
router.get('/projects/acceptation/:projectId/:userId',(req,res,next)=>{
    const {projectId,userId} = req.params;

    Project
    .findByIdAndUpdate(projectId,{$pull:{requests:userId}},{new:true})
    
       .then(()=>{
          Project.findByIdAndUpdate(projectId,{$push:{participants:userId}},{new:true})
            .then((updatedProject)=>{             
                res.status(202).json(updatedProject)
            })
            .catch( (err) => {
                next(createError(err));
              });
      })
      .catch( (err) => {
        next(createError(err));
      });


})

//GET /api/projects/rejection/:projectId/:userId  => change a user from project requests to project participants
router.get('/projects/rejection/:projectId/:userId',(req,res,next)=>{
    const {projectId,userId} = req.params;

    Project
    .findByIdAndUpdate(projectId,{$pull:{requests:userId}},{new:true})      
            .then((updatedProject)=>{             
                res.status(202).json(updatedProject)
            })
            .catch( (err) => {
                next(createError(err));            
             })
      .catch( (err) => {
        next(createError(err));
      });
})

//GET /api/projects/request/:projectId/:userId => send a request of project
router.get('/projects/request/:projectId/:userId',(req,res,next)=>{
    const {projectId,userId} = req.params;

    Project
    .findByIdAndUpdate(projectId,{$push:{requests:userId}},{new:true})
    .then((updatedProject)=>{
        res.status(202).json(updatedProject)
    })
    .catch((err)=>{
        next(createError(err));
    })
})





module.exports=router