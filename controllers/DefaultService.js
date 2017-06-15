/*eslint-disable no-undef-expression, no-unused-params, semi*/
'use strict';

exports.cancelFlightBooking = function(args, res, next) {
  /**
   * updates the booking DB with status ‘Cancelled’ and updates the Cancellation ID
   * By passing the booking reference no and email/ph no booking is cancelled. 
   *
   * bookingRefNo String Booking Reference No
   * emailOrPhone String Email or Phone No
   * returns inline_response_200
   **/
  
  var http = require('https');
  var Client = require('node-rest-client').Client;
  var myJSON = JSON.stringify(args);
  var parsedResponse = JSON.parse(myJSON);
  
  var bookingRefNoValue = parsedResponse["BookingRefNo"]["value"];
  var emailOrPhoneValue = parsedResponse["EmailOrPhone"]["value"];
  var cancellationID = "";

  console.log("Input received :: BookingRefNo: "+bookingRefNoValue+", EmailOrPhone: "+emailOrPhoneValue);

 
 var generateCancellationID = function(){
    var id = "CAN_";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        id += possible.charAt(Math.floor(Math.random() * possible.length));
    return id;
 }
 
 //Function to call PUT using node-rest-client package
 var putData = function (){
    var url = `https://api.mlab.com/api/1/databases/CloudFoundry_7ik8lbbn_9v82nfds/collections/AirBooking?q={"FlightBookingRequest.ReservationId":"${bookingRefNoValue}","FlightBookingRequest.Email":"${emailOrPhoneValue}", "FlightBookingRequest.Status":"Booked"}&fo=true&apiKey=L8xAbCxQBE1r-6Mt8sAFHwKi734Vpc7i`;
    var client = new Client();
    cancellationID = generateCancellationID();
    // set content-type header and data as json in argsClient parameter for PUT operation
    var argsClient = {
    
        requestConfig: {
            timeout: 1000, //request timeout in milliseconds 
            noDelay: true, //Enable/disable the Nagle algorithm 
            keepAlive: true, //Enable/disable keep-alive functionalityidle socket. 
            keepAliveDelay: 1000 //and optionally set the initial delay before the first keepalive probe is sent 
        },
        responseConfig: {
            timeout: 1000 //response timeout 
        },
        data: { "$set" : { "FlightBookingRequest.Status" : "Cancelled" , "FlightBookingRequest.CancellationID" : `${cancellationID}`}},
        headers: { "Content-Type": "application/json" }
    };
    
    client.put(url, argsClient, function (data,response) {
        console.log("Inside put method to update document");
        console.log("Data after put:"+JSON.stringify(data));
        var parsedRespData = JSON.parse(JSON.stringify(data));
        var n = parsedRespData["n"];
        if( n == "1"){
          
          console.log("Cancellation ID generated : "+ cancellationID);
          res.setHeader('Content-Type', 'application/json');
          res.end(`{"CancellationId" : "${cancellationID}"}`);
        }else{
           // res.setHeader('Content-Type', 'application/json');
            res.end("{'CancellationId' : ''}");
        }
        
});

};

 var extServerOptionsGet = {
    host: 'api.mlab.com',
    port: '443',
    path: `/api/1/databases/CloudFoundry_7ik8lbbn_9v82nfds/collections/AirBooking?q={"FlightBookingRequest.ReservationId":"${bookingRefNoValue}","FlightBookingRequest.Email":"${emailOrPhoneValue}"}&fo=true&apiKey=L8xAbCxQBE1r-6Mt8sAFHwKi734Vpc7i`,
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    }
};

//Http call to GET with input parameters to check if the data exists in the database
var reqGet = http.request(extServerOptionsGet, function (resGet) {
    console.log("Inside get method to retrieve document details");
        resGet.on('data', function (data) {
                var jsonResponse = JSON.parse(data.toString());
                if(jsonResponse){
                    console.log("Document retrieved for "+bookingRefNoValue+" with booking status : "+jsonResponse["FlightBookingRequest"]["Status"]);
                    putData();
                }else{
                   // res.setHeader('Content-Type', 'application/json');
                    res.end("{'CancellationId' : ''}");
                 //res.end("Reservation : " + bookingRefNoValue + " does not exist");
                }
            });
        });                                                 
reqGet.end();
reqGet.on('error', function (e) {
    console.error(e);
});


/* CODE FOR UPDATING DOCUMENT WITH HTTP GET AND POST
  
  var examples = {};
  
  var myJSON = JSON.stringify(args);
  var parsedResponse = JSON.parse(myJSON);
 // console.log(parsedResponse);
  var bookingRefNoName = parsedResponse["BookingRefNo"]["schema"]["name"];
  var bookingRefNoValue = parsedResponse["BookingRefNo"]["value"];
  var emailOrPhone = parsedResponse["EmailOrPhone"]["schema"]["name"];
  var emailOrPhoneValue = parsedResponse["EmailOrPhone"]["value"];
  var id;
  var status;
  var contactNo;
  var email;
  var price;
  var reservationId;
  var noOfPassengers;
  var routeId;
 
  var extServerOptionsGet = {
    host: 'api.mlab.com',
    port: '443',
    path: `/api/1/databases/CloudFoundry_7ik8lbbn_9v82nfds/collections/AirBooking?q={"FlightBookingRequest.ReservationId":"${bookingRefNoValue}","FlightBookingRequest.Email":"${emailOrPhoneValue}"}&fo=true&apiKey=L8xAbCxQBE1r-6Mt8sAFHwKi734Vpc7i`,
    method: 'GET',
    headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    }
};

var http = require('https');
var reqGet = http.request(extServerOptionsGet, function (res) {
        res.on('data', function (data) {
                var jsonResponse = JSON.parse(data.toString());
                console.log(data.toString());
                console.log(jsonResponse);
                id = jsonResponse._id.$oid;
                console.log("Inside Get"+id);
                status = jsonResponse.FlightBookingRequest.Status;
                if(status === "Booked"){
                    status ="Cancelled";
                    console.log("STATUS"+status);
                }
                contactNo = jsonResponse.FlightBookingRequest.ContactNo;
                email = jsonResponse.FlightBookingRequest.Email;
                price = jsonResponse.FlightBookingRequest.Price;
                reservationId = jsonResponse.FlightBookingRequest.ReservationId;
                noOfPassengers = jsonResponse.FlightBookingRequest.NoOfPassenger;
                routeId = jsonResponse.FlightBookingRequest.RouteId; 
                });
        });                                                 
reqGet.end();
reqGet.on('error', function (e) {
    console.error(e);
});
//PUT the whole body
console.log("Outside Get"+id);
var flightreq = JSON.stringify(
{ "_id" : { "$oid" : "59364bfbbd966f7a953c6667"} , 
"FlightBookingRequest" : 
{ "Status" : "Cancelled" , 
"ContactNo" : "1234567" , 
"Email" : "abc.edf@gmail.com" , 
"Price" : "2000" , 
"ReservationId" : "3DPF8" , 
"NoOfPassenger" : "4" , 
"RouteId" : "12345"}});

console.log("flight Request"+flightreq);

 var extServerOptionsPost = {
    host: 'api.mlab.com',
    port: '443',
    path: `/api/1/databases/CloudFoundry_7ik8lbbn_9v82nfds/collections/AirBooking?apiKey=L8xAbCxQBE1r-6Mt8sAFHwKi734Vpc7i`,
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    }
};
console.log("POST"+extServerOptionsPost);

var reqPost = http.request(extServerOptionsPost, function (res) {

    res.on('data', function (data) {
       process.stdout.write(data);
        console.log(data.toString);
       
    
    });
});


reqPost.write(flightreq);
reqPost.end();
reqPost.on('error', function (e) {
    console.error(e);
});


    examples['application/json'] = {
            "CancellationId" : "aeiou"
    };

  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }*/


}

