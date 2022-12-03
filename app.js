const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const date = require(__dirname+"/date.js");

const app=express();
app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
const currentDay = date.getDate();

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});

const itemSchema = new mongoose.Schema({name: String});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});
const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<--- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
    name: String,
    items : [itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/",function(req,res){
    
    Item.find({},function(err,foundItems){
        if(foundItems.length == 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully added default items to the db");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listTitle :currentDay,newListItem : foundItems});
        }   
    });  
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name: customListName},function(err,foundList){
     if(!err){
         if(!foundList){
             const list = new List({
                 name: customListName,
                 items : defaultItems
                });
             
                list.save();
                res.redirect("/"+customListName);
            
         }
         else{
             res.render("list",{listTitle:foundList.name, newListItem: foundList.items});   
         }
     }
    })  
 });


app.post("/",function(req,res){
    const itemName =  req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name: itemName
    });
    if(listName == currentDay){
        item.save();
        res.redirect("/"); 
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
    
})

app.post("/delete",function(req,res){
    const deleteItemId = req.body.checkbox;
    const listName = req.body.list;
    if(listName === currentDay){
        Item.deleteOne({_id:deleteItemId},function(err){
            if(!err){
                res.redirect("/");
            }
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
})

app.listen("3000",function(){
    console.log("Server started at port 3000");
});


