import React, { Component } from 'react';
import axios from 'axios';
import Form from './form';
import  { UserContext } from '../contexts/userContext'
import jwt_decode from "jwt-decode";
require("dotenv").config();
export default class Login extends Component {
    static contextType = UserContext
    constructor(props,context) {
        super(props,context);

       
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.validateForm = this.validateForm.bind(this);

        this.state = {
            username: "",
            password: "",
            token: "",
            passerror: false
        }
       this.check(context);
        
    }
    
    check = (context) =>
    {
      const { updatemainLoading} = context
      
     let token = window.localStorage.getItem("token")
         if(token)
         {
           
         this.props.history.push("/home")
         }
         else
         {
           updatemainLoading(false)
          
           
         }
         
    }



   stopAnime = () =>
    {  
    
        
    }

    validateForm() {
        return true;

    }

    handleChange(e) {

        const name = e.target.name;
        const value = e.target.value;
        this.setState({
            ...this.state,
            [name]: value
        })

    }

    handleClick(e) {
        e.preventDefault();
        const { updatemainLoading } = this.context
        updatemainLoading(true);
        const userr = {
            username: this.state.username,
            password: this.state.password
        }
       const {updateId} = this.context
      
        axios.post(process.env.REACT_APP_BACKEND_URL+'api/login', userr)
            .then(res => {

                    

                if (res.data.status === 'error') {
                    this.setState({ passerror: true });
                    updatemainLoading(false);

                }
                else {

                    this.setState({ token: this.state.token })
                    window.localStorage.setItem("token",res.data.token)
                    const decode = jwt_decode(res.data.token);
                    updateId({id:decode._id,username:decode.username});
                  
                    this.props.history.push("/home")

               

                    this.setState({
                        username: "",
                        password: "",
                        token: ""
                    });

                }


            });
         



    }
    render() {
        const {mainLoading} = this.context
        if(mainLoading)
        {
         return <div>
             <Form loading={mainLoading}/>
         </div>

        }
        else{
        return (

            <div>
                < Form rootProps={this.props} loading={mainLoading} tog={this.props.tog} stateSignup={this.state} stopAnime={this.stopAnime} handleChange={this.handleChange} handleClick={this.handleClick} validateForm={this.validateForm} toggle={this.props.toggle} />
            </div>
        );
        }
    }
}