import React, { Component } from 'react';
import DashBoard from './app/dashboard';
import Login from './app/login';
import ChkLogin from './app/chkLogin';

export default class FallAlertApp extends Component{
  constructor(){
    super();
    this.state = {
      dbd: false,
      chkLogin: true,
    }
    this.show = this.show.bind(this);
  }

  show(isLoggedIn){
    this.setState({dbd: isLoggedIn});
    this.setState({chkLogin: false});
  }

  render() {
    if(this.state.dbd){
      return(
        <DashBoard logout={this.show}/>
      );
    }
    if(this.state.chkLogin){
      return(
        <ChkLogin isLoggedIn={this.show}/>
      )
    }
    else{
      return (
        <Login login={this.show}/>
      );
    }
  }
}
