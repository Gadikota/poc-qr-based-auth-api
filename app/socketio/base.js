var Promise = require('promise');
var QRCode = require('qrcode');
var UserSession          = require('../models/user_session');
var moment = require('moment');
var util = require('util');


var h = require('../helpers/app_helpers');
var genNewQR = function(data){
  var p = new Promise(function(resolve, reject){
    try{
      var newSession            = new UserSession();
      var currentDate           = moment(new Date()).utc().add(1, "minute")._i.getTime();
      // set the user's local credentials
      newSession.expires_on  = currentDate;
      newSession.token = newSession.generateHash("helloworld"+currentDate); // this will be system generated
      // save the user
      newSession.save(function(err) {
        if (err)
          reject(err);
        var token = JSON.stringify({
          id: newSession._id,
          expires_on: newSession.expires_on,
          password: newSession.token,
          user_id: data.user_id
        })

        QRCode.toDataURL(h.encrypt(token),function(err,url){
          if(err){
            reject(err)
          }
          else{
            resolve(url);
          }
        });
      })
    } catch(err){
      reject(err)
    }
  })

  return p;

}
module.exports = function (app) { // io stuff here... io.on('conection..... }
  var io = app.io;
  var util = require('util');
  io.on('connection', function (socket) {
    socket.on('message', function(data){
      var refreshToken = function(){
        var p = genNewQR(data);
        p.then(function(dataUrl){
          io.emit(data.user_id+"/qr", JSON.stringify({url: dataUrl}));
        })
        p.catch(function(error){
          console.log("Error "+error.message);
          io.emit(data.user_id, "Error occured");
          io.emit(data.user_id, error.message);
        })
      }
      setInterval(refreshToken, 60*1000);
      refreshToken();
    })
  });
}