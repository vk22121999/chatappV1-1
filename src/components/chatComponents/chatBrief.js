import React, { Component } from 'react';

import { UserContext } from '../../contexts/userContext';



class ChatBrief extends Component {
    static contextType = UserContext;
 
  state = {  }
  formatAMPM = (lastSeen) =>
    { // var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
       var temp_now = new Date();
     //  let month= months[lastSeen.getMonth()];
       let day = lastSeen.getDate();
       let weekDay = days[lastSeen.getDay()]
       let year = lastSeen.getFullYear().toString().slice(-2);
       let month =lastSeen.getMonth()+1;
       
       if(temp_now.getFullYear()!==lastSeen.getFullYear()||temp_now.getMonth()!==lastSeen.getMonth())
        {
              
               return day+"/"+month+"/"+year
        }
        if(temp_now.getMonth()===lastSeen.getMonth())
        {
            if((temp_now.getDate() - day) === 0)
              {
                var hours = lastSeen.getHours();
                var minutes = lastSeen.getMinutes();
                var ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                minutes = minutes < 10 ? '0'+minutes : minutes;
                var strTime = hours + ':' + minutes + ' ' + ampm;
                return strTime;
              }
              else if((temp_now.getDate() - day) === 1)
              {
                return "Yesterday"
              }
              else if((temp_now.getDate() - day) > 7)
              {
                return weekDay;
              }
              else{
                return day+"/"+month+"/"+year
              }
        }
     
    }
  unseenMsg = (newmsg) =>{
    var cnt = 0;
    newmsg.messages.map(m =>{
      if(!m.seen && m.senderId === newmsg.Id)
      {
        cnt=cnt+1;
      }
      return 0;
    })
    if(cnt)
    {
      return <div className='unseen-msg'><p className="center-cnt">{cnt}</p></div>
    }

  }
  unseenMsgForRoom = (newmsg) =>{
    var cnt = 0;
 
    newmsg.messages.map(m =>{
      if(!m.seen && m.senderId === newmsg.Id)
      { 
        cnt=cnt+1;
      }
      return 0;
    })
   
      return cnt;
 

  }
  openChat = (user) =>
 { const {currentUserUpdate,messages} = this.context
   
    let em = parseFloat( getComputedStyle( document.querySelector('body'))['font-size'])
    let width = window.innerWidth / em
    let height = window.innerHeight/ em
   
 
    if(width<60||height<41)
    { 

    
      
     document.querySelector(".middleHome").style.display="flex";
     document.querySelector(".leftHome").style.display="none"; 
      
    
    
      
    }

    if(width>60&&width<90)
    {
          const middle = document.querySelector(".middleHome").style.display;
          if(middle==="none")
          {
           document.querySelector(".middleHome").style.display="flex";
           document.querySelector(".rightHome").style.display='none';
 
          }
 
    }
  

  
 
  for(let i=0;i<messages.length;i++)
  {
    if(user.id===messages[i].Id)
    {
      let chat = messages[i];
     
      currentUserUpdate({_id:chat.Id,username:chat.username,path:chat.path,isOnline:chat.isOnline,status:chat.status,lastSeen:chat.lastSeen})
      break;
    }
    
  }
  
     
  }
  status = (msg) =>
  {  
      if(msg.seen)
        return (<div className="status-brief"><div className="check"></div>
        <div className="check"></div><p>{msg.msgBody}</p> </div>)
     else if(msg.delivered)
      return (<div className="status-brief"><div className="check-sent"></div>
      <div className="check-sent"></div> <p>{msg.msgBody}</p></div>)
      else if(msg.sent)
      return(<div className="status-brief"><div className="check-sent"></div><p>{msg.msgBody}</p></div>)
      else
           return (<div className="status-brief">
           <div id="loading5">
               <span id="outerCircle"></span>
               
           </div>
           <p>{msg.msgBody}</p>
           </div>)
  }
  lastMessage = (newmsg) =>
  { 
     
    if(newmsg.Id===newmsg.messages[newmsg.messages.length-1].senderId)
     return newmsg.messages[newmsg.messages.length-1].msgBody
    else
  return <div>{this.status(newmsg.messages[newmsg.messages.length-1])} </div>
  }
  
  render() { 
   
    const {updateSearch,updatecnt,onlineBottomUpdate,updatecntifup} = this.context
    return ( 
      <div className='left-c '>
      <ul className="img-ul">
    {this.props.messages.map( (newmsg) =>{ 
      
    return (
    
    <li className='img-li ' key={newmsg.Id} onClick={e => {
      this.openChat({id:newmsg.Id})
      updatecnt(this.unseenMsgForRoom(newmsg));
   onlineBottomUpdate(true);
   updatecntifup();
  
          updateSearch()

    
                                                                }}>
   
      {newmsg.isOnline?<div className="img-chat"> <img className="left-img"   alt="#" src={newmsg.path} /><div className="online-color"></div></div>:<div className="img-chat"><img className="left-img"  alt="#" src={newmsg.path} /></div>}
  
    <div className='img-div '>
<h6 className="img-h">{newmsg.username} </h6>
      
  {newmsg.isTyping?<div className="typing">Typing ....</div>:<div className="img-p">  {this.lastMessage(newmsg)}</div>} 
    </div>
    <div>
    {newmsg.isTyping?<span></span>:<span className='time'>{this.formatAMPM(new Date(newmsg.messages[newmsg.messages.length-1].sentTime))}</span>}
{this.unseenMsg(newmsg)}
     </div>
        
    </li>
 
    )
   
    })}
     </ul>
    {this.props.messages.length?<div className="dot-end"></div>:<span></span>}
    </div>
     
 );

 }
}
 
export default ChatBrief;