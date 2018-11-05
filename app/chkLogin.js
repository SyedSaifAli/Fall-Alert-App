import React from 'react';
import {View, Text, TextInput, Button, ActivityIndicator, Dimensions} from 'react-native';
import { GetRequest, GetUrl } from './net.js';

const CONFIG = require("../config.js");

export default class ChkLogin extends React.Component{
  constructor(props){
    super(props);
  }

  componentDidMount(){
    const url = GetUrl(CONFIG.hpsHost, '/crm/auth/isloggedin/');
    GetRequest(url, (response) => {
      try{
        var resp = JSON.parse(response._response);
        if(resp.message == "OK"){
          this.props.isLoggedIn(true);
        }
        else{
          this.props.isLoggedIn(false);
        }
      }
      catch(e){
        this.props.isLoggedIn(false);
      }
    });
  }

  render(){
    return(
      <ActivityIndicator style={{flex: 1}} animating={true} size={60}/>
    );
  }
}
