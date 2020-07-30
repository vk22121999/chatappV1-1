var User = require('../models/user_model.js');
var Room = require('../models/room_model.js');
var mongoose = require('mongoose');
const users = {  }
const userTab = {}
module.exports=function(io,socket){
  

         
  // =====================================
  //  User is offline ====================
  // =====================================
  socket.on('disconnect', () => {
    console.log("offline",users[socket.id]);
    
  
    let id = users[socket.id]
    console.log("off",userTab[id]);
    if(userTab[id]>1)
    {
      userTab[id] = userTab[id] - 1;
    }
    else if(userTab[id]==1)
    {
      userTab[id]=0;
      let lastSeen =  new Date();
      User.updateOne({
        _id:id
        },
        {$set:{
            isOnline:false,
            lastSeen:lastSeen,
        }}).then(val => 
           {
            io.to("commonRoom").emit("lastSeen",{id:id,lastSeen:lastSeen})
           })

    }
   
    
  });
        
  // =====================================
  //  User is online =====================
  // =====================================
        socket.on("join",function(data)
        { console.log(data);
          
           users[socket.id] = data.id;
           
           if(userTab[data.id])
           {
            userTab[data.id] = userTab[data.id] + 1;
           }
           else
           {
            
            userTab[data.id] =  1;
            io.to("commonRoom").emit("isOnline",{id:data.id})   //===================Emitting the user who is come online to other users==================//
           

           }
           
          socket.join("commonRoom");
          socket.join(`${data.id}`,() => {
            console.log("into chat room")
            
           
           User.updateOne({
             _id:data.id
             },
             {$set:{
                 isOnline:true 
             }}).then(val => 
                {
                   
                      
                         Room.aggregate([
                          {
                            $match: {
                              "_id" : mongoose.Types.ObjectId(data.id)
                            }
                          },
                        
                          {
                            $unwind: "$chats"
                          },
                           {
                            $sort: {
                               'chats.messages.sentTime':-1                           
                            }
                          }
	
                             
                         ]).then(res=>{
                            var chats = [];
                          res.forEach(item =>
                              { 
                                 User.findOne({_id:item.chats.Id},{_id:0,username:1,path:1,isOnline:1}).then(detail=>{
                                             let len=item.chats.messages.length;
                                            
                                             var latestmsg=[]
                                             if(len<10)
                                             {
                                               latestmsg= item.chats.messages;
                                             }
                                             else{
                                              latestmsg = item.chats.messages.slice(-10);
                                               if(!latestmsg[0].seen)
                                               { let temp=[]
                                                 for(let i=0;item.chats.messages[i].id!=latestmsg[0].id;i++)
                                                    {
                                                      if(!item.chats.messages[i].seen)
                                                      {
                                                         temp.push(item.chats.messages[i])
                                                      }
                                                    }
                                                    if(temp.length)
                                                    {
                                                      latestmsg=[...temp,...latestmsg]
                                                    }
                                               }

                                                 
                                              }
                                              let chat  = {Id:item.chats.Id,username:detail.username,path:detail.path,isOnline:detail.isOnline,messages:latestmsg}
                                                                    
                                              io.to(`${socket.id}`).emit("chat",chat); 
                                            })
                                           
                                             
                                   })
                                   
                                   
                                   
                              })
                             
                        
                          
                      
                         
                   
                });
              })
            })
  // =====================================
  //  User to send a message =============
  // =====================================
          
                    
        socket.on("postingMessage",function(newMessage){
       
          if(userTab[newMessage.senderId]>1)
          {
            io.to(`${newMessage.senderId}`).emit("postingMessgaeDevices",newMessage) 
          }
          const msg= {
             
              id:newMessage.id,
            msgBody:newMessage.msgBody,
            senderId:newMessage.senderId,
            receiverId:newMessage.receiverId,
           sentTime:new Date(newMessage.sentTime),
               sent:true,
               delivered:false,
               seen:false
           }
           const msgOnline= {
            id:newMessage.id,
          msgBody:newMessage.msgBody,
         sentTime:new Date(newMessage.sentTime),
             senderId:newMessage.senderId,
             receiverId:newMessage.receiverId,
             sent:true,
             delivered:false,
             seen:false
         }
         Room.updateOne({_id:newMessage.senderId,"chats.Id":newMessage.receiverId},{
          $push:{
              "chats.$.messages":{
                $each:[
                 msg 
                ]
              }
            }
         }).then(val => {
             if(val.n)
             {
      
              Room.updateOne({_id:newMessage.receiverId,"chats.Id":newMessage.senderId},{
                  $push:{
                      "chats.$.messages":{
                        $each:[
                         msg 
                        ]
                      }
                    }
                 }).then(val => {
      
               
     
                   
                   
                                   const newmsg = {
                                    senderUsername:newMessage.senderUsername,
                                    senderPath:newMessage.senderPath,
                                    isOnline:newMessage.senderisOnline,
                                     msg:msgOnline
                                   }
                                   console.log("message-sent")
                                   io.to(`${newMessage.senderId}`).emit("sentMessageSuccess",{receiverId:newMessage.receiverId,id:msgOnline.id})   //===============sent success to sender ===============//
                                  io.to(`${newMessage.receiverId}`).emit("receivingMessage",newmsg) //=======Sending the message to the receiver=============//
                        
                       
                     
                  
                  
                  
                  
                
                 }).catch(err =>{
                   console.log(err)
                 })   
              
      
             }
             else
             {
              Room.updateOne({_id:newMessage.senderId},
                  {$addToSet:{
                    "chats":{Id:newMessage.receiverId,messages:[msg]}}}).then(room =>{
      
                      Room.updateOne({_id:newMessage.receiverId},
                          {$addToSet:{
                            "chats":{Id:newMessage.senderId,messages:[msg]}}}).then(room =>{
                            
                              
                                  
                                   
                                   
                                   
                                                   const newmsg = {
                                                     username:newMessage.senderUsername,
                                                     path:newMessage.senderPath,
                                                     isOnline:newMessage.senderisOnline,
                                                     msg:msgOnline
                                                   }
                                                   console.log("message-sent")
                                                io.to(`${newMessage.senderId}`).emit("sentMessageSuccess",{receiverId:newMessage.receiverId,id:msgOnline.id})  //===============sent success to sender ===============//
                                                io.to(`${newMessage.receiverId}`).emit("receivingMessage",newmsg) //=======Sending the message to the receiver=============
                                         
                                       
                                     
                                  
                                  
                                  
                              
                                 }).catch(err =>{
                                   console.log(err)
                                 })  
      
      
      
      
      
                            })
      
                  
             }
      
         })
      })
  
      

  // =====================================
  //   Updating delivered messages========
  // =====================================

      socket.on("deliverUpdate",function(data){
            
        Room.updateOne({_id:data.receiverId,"chats.Id":data.senderId},{$set:{"chats.$.messages.$[elem].delivered":true}},{arrayFilters: [ { "elem.id": { $eq:data.id } } ]}).then(val=>{
                         
         
          Room.updateOne({_id:data.senderId,"chats.Id":data.receiverId,},{$set:{"chats.$.messages.$[elem].delivered":true}},{arrayFilters: [ { "elem.id": { $eq:data.id } } ]}).then(val=>{
   
            io.to(`${data.senderId}`).emit("deliverSuccess",data)  //===== deliver success message to sender =====================================
          })
                    
        })
      })
        
 // =====================================
 //    Updating seen messages============
 // =====================================


      socket.on("seenUpdate",function(data){

        Room.updateOne({_id:data.receiverId,"chats.Id":data.senderId},{$set:{"chats.$.messages.$[elem].seen":true}},{arrayFilters: [ { "elem.id": { $eq:data.id }}]} ).then(val=>{
                       
          Room.updateOne({_id:data.senderId,"chats.Id":data.receiverId},{$set:{"chats.$.messages.$[elem].seen":true}},{arrayFilters: [ { "elem.id": { $eq:data.id } }]}).then(val=>{
              
            io.to(`${data.senderId}`).emit("seenSuccess",data)  //===== seen success message to sender =====================================
          })
                    
        })
      })

   


  
          
 }


  




