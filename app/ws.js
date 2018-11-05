const CONFIG = require("../config.js");

export default class WS{
  constructor(url, onMessage, onOpen){
    this.ws = null;
    this.wsUrl = null;
    this.retryJob = null;
    this.isInitialised = false;

    this.wsUrl = url;
    this.onOpen = onOpen;
    this.onMessage = onMessage;

    this.init = this.init.bind(this);
    this.stopWS = this.stopWS.bind(this);
    this.startWS = this.startWS.bind(this);
    this.sendJson = this.sendJson.bind(this);
    this.retryFunc = this.retryFunc.bind(this);

    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);

    this.onConnectionChange = this.onConnectionChange.bind(this);

    console.log('ws actor');
    this.online = false;
  }

  onConnectionChange(connectionInfo){
    console.log('onConnectionChange', connectionInfo);
    if(this.isInitialised)
      this.retryFunc('onConnectionChange');
  }

  dispose(){
    this.isInitialised = false;
    NetInfo.removeEventListener('change', this.onConnectionChange);
    this.stopWS();
  }

  stopWS(){
    global.wsOnline = false;
    clearTimeout(this.retryJob);
    try{
      if(this.ws){
        this.ws.onclose = null;
        this.ws.onerror = null;
        this.ws.close();
      }
    }
    catch(e){
      console.log('StopWS error', e);
    }
    this.ws = null;
  }

  startWS(){
    this.stopWS();
    console.log('connecting to', this.wsUrl);
    this.ws = new WebSocket(this.wsUrl);
    this.ws.onopen = () => {
      console.log('ws onopen');
      global.wsOnline = true;
      this.onOpen();
    };
    this.topSpeed = 0;
    this.ws.onclose = this.retryFunc;
    this.ws.onerror = this.retryFunc;
    this.ws.onmessage = this.onMessage;
  }

  retryFunc(e){
    this.stopWS();
    console.log('ws retryFunc');
    this.retryJob = setTimeout(this.startWS, 1000);
  }

  init(){
    this.startWS();
    this.isInitialised = true;
  }

  sendJson(action, data){
    if(this.ws && this.ws.readyState == 1){
      console.log('sending', action, data);
      this.ws.send(JSON.stringify({
        a: action
      }));
      return true;
    }
    else{
      return false;
    }
  }
}
