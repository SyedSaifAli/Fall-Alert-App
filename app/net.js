import { Text, View, Modal, Alert} from 'react-native';
const CONFIG = require("../config.js");

export function GetUrl(host, path, isWS){
  var url = '';
  if(isWS)
    url += 'ws';
  else
    url += 'http';
  if(CONFIG.useSecure)
    url += 's';

  url += '://';
  url += host;
  if(path)
    url += path;
  return url;
}

export function GetRequest(url, cb) {
  var xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;
  xhttp.onreadystatechange = function() {
    handleCallBack(this, cb);
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

export function PostRequest(url, params, cb){
  var xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;
  var data = JSON.stringify(params);
  xhttp.open("POST", url, true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.onreadystatechange = function(){
    handleCallBack(this, cb);
  }
  xhttp.send(data);
}

export function PatchRequest(url, params, cb){
  var xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;
  var data = JSON.stringify(params);
  xhttp.open("PATCH", url, true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.onreadystatechange = function(){
    handleCallBack(this, cb);
  }
  xhttp.send(data);
}

export function PutRequest(url, params, cb){
  var xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;
  var data = JSON.stringify(params);
  xhttp.open("PUT", url, true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.onreadystatechange = function(){
    handleCallBack(this, cb);
  }
  xhttp.send(data);
}

export function DeleteRequest(url, params, cb) {
  var xhttp = new XMLHttpRequest();
  xhttp.withCredentials = true;
  var data = JSON.stringify(params);
  xhttp.open("DELETE", url, true);
  xhttp.onreadystatechange = function() {
    handleCallBack(this, cb);
  };
  xhttp.send(data);
}

function handleCallBack(response, cb){
  if(response.readyState === 4){
    if(response.status === 0){
      Alert.alert(
        'No Internet',
        "Please make sure your device has access to internet",
        [
          {text: 'OK'},
        ]
      )
      cb(response);
    }
    else{
      try{
        cb(response);
      }
      catch(e){
        console.log(`net request response : ${response._response}`, 'error' , e.message, ' stack trace:')
        console.log(e.stack.split("\n"));
        // throw e;
      }
    }
  }
}
