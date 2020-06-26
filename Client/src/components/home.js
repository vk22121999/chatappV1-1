
import React, { Component } from 'react';
import io from "socket.io-client";
import jwt_decode from "jwt-decode";    
import 'bootstrap/dist/css/bootstrap.min.css';


class Home extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.state = { msgbody:"" }
          


    }

    componentDidMount() {
        let token=window.localStorage.getItem("token")
        
        if(token)
        {
            const decode = jwt_decode(token);
           this.id = decode._id;
            this.setState({id:this.id});
            console.log(this.state.id)
        }
        else{

            window.location = '/signup'
        }
        console.log(this.id);
        const point = "http://localhost:3000/";
        this.socket = io(point);
        if(this.id=="5ef5ae4eca64292fd4237602")
        {
            this.recieverId="5ef53622c98dac7d0d7054ec"
        }
        else{
            this.recieverId="5ef5ae4eca64292fd4237602"
        }
        this.socket.emit("join",{id:this.id});
     
        
        this.socket.on("recievingMessage",function(newmsg){
          console.log(newmsg.msgBody);
        });
          
    }
    handleChange(e) {
        var value = e.target.value;
      

        this.setState({
          
            msgbody: value

        })
    }
    handleClick(e) {
        e.preventDefault();
        const newMessage = {
            msgBody: this.state.msgbody,
            recieverId:this.recieverId,
            senderId:this.id
        }
     
        this.socket.emit("postingMessage",newMessage);
    }
    render() { 
        return (
            <div>
                <div>
             
                </div>
                <h1>U Have Logged In Successfully</h1>
                <button type="submit" onClick={(e)=>{
                    window.localStorage.clear();
                    window.location='/signup';
                }}>Clear</button>

      <div className="form-group">
                       
                        <input id="p" type="text" className="form-control" name="msgbody" value={this.state.msgBody} onChange={this.handleChange} />
                    </div>

                    <button type="submit" className="btn btn-primary" onClick={this.handleClick} >Send</button>
            </div>
        );
    }
}
 
export default Home;