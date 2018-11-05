import React from 'react';
import {View, Text, TextInput, Button} from 'react-native';
import { PostRequest, GetUrl } from './net.js';

const CONFIG = require("../config.js");

export default class Login extends React.Component{
  constructor(props){
    super();
    this.state = {
      pwd: '',
      email: '',
      loginLabel: '',
    };
  }

  login(){
    if(!this.email || !this.pwd){
      this.setState({
        loginLabel:"Please enter email and password"
      })
      return;
    }
    var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(regex.test(this.email)){
      var data ={
        "eml": this.email,
        "pwd": this.pwd,
      }
      const url = GetUrl(CONFIG.hpsHost, '/crm/auth/login/', CONFIG.useSecure);
      PostRequest(url, data , (response) => {
        var data = JSON.parse(response._response);
        if(response.status == 200){
          this.props.login(true);
        }
        else{
          this.setState({loginLabel:data.data})
        }
      });
    }
    else{
      this.setState({loginLabel: "Not a valid email"})
    }
  }

  render(){
    return(
      <View style={{flex: 1, padding: 15}}>
        <Text style={styles.title}>Ajjas Fall Alert</Text>
        <View style={styles.fieldContainer}>
          <TextInput
            keyboardType="email-address"
            placeholder="Email"
            autoCapitalize="none"
            onChangeText={(text) => this.email = text}
          />
          <TextInput
            placeholder="password"
            autoCapitalize="none"
            onChangeText={(text) => this.pwd = text}
            secureTextEntry={true}
          />
          <Button title='Login' onPress={() => this.login()}/>
        </View>
        <Text style={{textAlign:'center', paddingTop: 20, color: 'red'}}>{this.state.loginLabel}</Text>
      </View>
    );
  }
}

const styles = {
  title: {
    fontSize: 25,
    color:'#000',
    alignSelf: 'center'
  },
  fieldContainer: {
    marginTop: 50,
    marginLeft: 20,
    marginRight: 20,
  },
};