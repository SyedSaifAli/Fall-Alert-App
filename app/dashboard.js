import React from 'react';
import {View, Text, Alert, ListView, Linking, DeviceEventEmitter} from 'react-native';
import { GetUrl, GetRequest } from './net.js';
import WS from './ws';
import NotifService from './NotifService';
import PushNotificationAndroid from 'react-native-push-notification'
const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const CONFIG = require("../config.js");

export default class DashBoard extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      fallList: [],
      showList: false
    }
    this.statProps = [ 'APP', 'SMS' , 'CALL_STAT' ];
    this.ws = new WS(GetUrl(CONFIG.hpsHost, '/wss?', true), this.onWSMessage, this.onWSOpen);
    this.notif = new NotifService(this.onNotification);
  }
  componentDidMount(){
    this.ws.init();
    this.getFallAlerts();
  }
  onNotification = (notif)=>{
    this.getFallAlerts();
  }
  getFallAlerts(){
    var url = '/crm/admin/devices/getLatestFallAlerts';
    var ts = this.prepareTimeStamp(24);
    url += "?tsgte=" + Math.floor(ts/1000);
    url += "&fallAfter=" + this.GetDateFromNow(30);
    const url = GetUrl(CONFIG.hpsHost,url, CONFIG.useSecure);
    GetRequest(url, (resp) => {
      var data = JSON.parse(resp.response).data;
      if(resp.status !== 200){
        Alert.alert(
          'Error',
          data,
          [
            {text: 'Ok'},
          ]
        );
        return;
      }
      var falls = data.falls;
      var meta = data.d;
      if(falls.results && falls.results.length){
        var fallData  = falls.results[0].data;
        var schema = falls.results[0].schema;
        this.fallArray = this.createFallList(schema, fallData, meta);
        this.setState({
          fallList : ds.cloneWithRows(this.fallArray),
          showList: true
        });
      }
    });
  }
  componentWillUnmount(){
    this.ws.sendJson('unsubToFallAlert');
    this.notif.unSubscribedNotif();
  }
  prepareTimeStamp(hours){
    if(!hours) return;
    var currDate = new Date();
    currDate.setHours(currDate.getHours() - hours);
    return currDate.getTime();
  }

  onWSMessage = (msg)=>{
    try{
      if(typeof msg.data == 'string'){
        var obj = JSON.parse(msg.data);
        if(obj && obj.a == 'fallAlert'){
          this.notif.localNotif(obj.d);
          this.latestNotif = obj.d.key;
          Alert.alert(
            'Fall Alert',
            "User with contact number " + obj.d.user.cmob + " experienced a fall at " + new Date(obj.d.notif.dc * 1000).toString().split('GMT')[0],
            [
              {text: 'OK', onPress: () => this.getFallAlerts()}
            ]
          )
        }
      }
    }
    catch(e){
      console.log(`ws onmessage msg : ${msg.data}`, 'error' , e.message, ' stack trace:')
    }
  }
  onWSOpen = (state)=>{
    this.ws.sendJson('subToFallAlert');
  }
  callNumber = (isd, num) =>{
    if(!num) return;
    Linking.canOpenURL(isd + num).then(supported => {
      if (!supported) {
        console.log('Can\'t handle url: ' + isd,num);
      } else {
        return Linking.openURL(isd + num);
      }
    }).catch(err => console.error('An error occurred', err));
  }
  // sendWSMsg(){
  //   global.gWebSocket.SendRequest({
  //     data: { a: "subToFallAlert"},
  //     cb: (resp)=> {
  //     }
  //   })
  // }
  createFallList(schema, data, meta){
    let metaMap = {};
    meta.map((m)=>{ metaMap[m.idx] = m;}); // did <==> other details

    return data.map((row)=>{
      var obj = {};
      row.forEach((val,i)=>{
        if(this.statProps.indexOf(schema[i].name) !== -1 ) val = this.convertStatToString(val);
        obj[schema[i].name] = val;
        if( schema[i].name == "DEVICEID" ) { obj['meta'] = metaMap[val]; }
      });
      return obj;
    })
  }
  convertStatToString(val){
    switch(val){
      case -1 : return 'N/A'; break;
      case 1 : return 'On'; break;
      case 0 : return 'Off'; break;
      default : return val;

    }
  }
  _renderRow(rowData, sectionID, rowID){
    return(
      <View style={{borderColor:"#e5e5e5", borderWidth:1, backgroundColor: rowData.LOC_KEY === this.latestNotif ? "#fff0000" : "#fff",borderRadius:10, marginTop: 20, marginHorizontal: 20, marginBottom: rowID == this.fallArray.length - 1 ? 16 : 0}}>
        <View style={{padding:15,borderTopLeftRadius:10,borderTopRightRadius:10}}>
          <Text style={{fontSize: 22,fontWeight: "normal", paddingLeft: 15}}>{rowData.HEADING}</Text>
          <Text style={{fontSize: 15,fontWeight: "normal", paddingLeft: 15, position:'absolute',right:10, color: '#0094de', textDecorationLine: 'underline'}} onPress={() => {Linking.openURL("https://l.ajjas.com/?a=" + rowData.LOC_KEY)}}>View Location</Text>
          <Text style={{fontSize: 14,fontWeight: "bold", right: 10, paddingLeft: 25}}>Time - {new Date(rowData.TS*1000).toString().split('GMT')[0]}</Text>
          <Text style={{fontSize: 14,fontWeight: "normal", right: 10, paddingLeft: 25}}>User Name - {rowData.meta && rowData.meta.uid ? (rowData.meta.uid.fn + " " + rowData.meta.uid.ln) : null}</Text>
          <Text style={{fontSize: 14,fontWeight: "normal", right: 10, paddingLeft: 25}} onPress={()=> this.callNumber('tel:+91',rowData.meta.uid.mob)}>Mobile Number - <Text style={{textDecorationLine :'underline', color: '#0000ff'}}>{rowData.meta && rowData.meta.uid ? rowData.meta.uid.mob : null}</Text>
          </Text>
          <Text style={{paddingLeft: 15}}>Emergency Contacts - </Text>
          <View>
            {rowData.meta.emContacts ?
              rowData.meta.emContacts.map((emg,i)=>{
                return <Text key={i} style={{fontSize: 14,fontWeight: "normal", right: 10, paddingLeft: 40}}>{++i + ") " + emg.nm} - {emg.mob}</Text>
              }) : null
            }
          </View>
          <Text style={{fontSize: 14,fontWeight: "normal", right: 10, paddingLeft: 25, paddingTop:10}}>Total Fall Alert Notifs - {rowData.meta && rowData.meta.notifs ? rowData.meta.notifs.length : null}</Text>
        </View>
      </View>
    )
  }
  GetDateFromNow(days){ // will return date of no. of days passed in args from now in epoc ts.
    var today = new Date();
    return Math.round(new Date().setDate(today.getDate() - days) / 1000);
  }
  render(){
    return(
      <View style={{ backgroundColor: '#f3f3f3', flex: 1}}>
        {this.state.showList ? 
          <ListView
          dataSource={this.state.fallList}
          enableEmptySections={true}
          renderRow={(rowData, sectionID, rowID) => this._renderRow(rowData, sectionID, rowID)}
        /> 
        : <Text>Please wait...</Text>
        }
      </View>
    );
  }
}
