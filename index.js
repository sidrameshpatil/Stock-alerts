const request = require("request-promise")
const cheerio = require("cheerio")
const fs = require("fs")
const CSVToJSON = require('csvtojson');
const path = require("path")
 
// Twilio Code Information

 
client.messages 
      .create({ 
         body: 'Your appointment is coming up on July 21 at 3PM', 
         from: 'whatsapp:+14155238886',       
         to: 'whatsapp:+918152007238' 
       }) 
      .then(message => console.log(message.sid)) 
      .done();


 // Checker List is the List of all the companies on which the trigger has been set
var checkerList = []

// This is the array of all the alerts to be sent to the Stock trader
var emailMesseges = []


// This code will take the Users Peek and Lowest Trigger values from the stock csv file
CSVToJSON().fromFile('/Users/stock.cs')
    .then(users => {

        // users is a JSON array
        // log the JSON array
        // console.log(users[0])
        users.forEach(element =>{
            checkerList.push({name : element["SYMBOL \n"], ltp : element["LTP \n"],trgh : element.trgh, trgl: element.trgl })

        })
        
    }).catch(err => {
        // log error if any
        console.log(err);
    });




// This is the link from which the perticular live stock prices have been retrieved
const myUrl = "https://www.nseindia.com/api/equity-stockIndices?csv=true&index=NIFTY 50";

(async () =>{
    const response = await request({
        uri: myUrl,
        headers:{
            Accept :	"*/*",
            "Accept-Encoding" :"gzip, deflate, br",
            "Accept-Language":	"en-US,en;q=0.5"
        },
        gzip: true
    })
    fs.writeFileSync('/Users/stockData.csv', response)
     

    CSVToJSON().fromFile('/Users/stockData.csv')
    .then(users => {

        // users is a JSON array
        // log the JSON array
        // console.log(users)
         for(let i = 0;i < checkerList.length;i++){
             if(checkerList[i].trgh !== '') {
                 for(let j = 0;j < users.length;j++) {
                     if(checkerList[i].name === users[j]["SYMBOL \n"]){
                         if(users[j]["LTP \n"] >= checkerList[i].trgh){
                             emailMesseges.push(`${users[j]["SYMBOL \n"]} Stock price raised to the limit you have set  ${checkerList[i].trgh}`)
                         }
                         else if(users[j]["LTP \n"] <= checkerList[i].trgl){
                             emailMesseges.push(`${users[j]["SYMBOL \n"]} Stock price raised to the limit you have set  ${checkerList[i].trgl}`)
                         
                         }
                     }
                 }
             }
         }
         if( emailMesseges.length !== 0) {
         var messegeString
        emailMesseges.forEach(element => {
            messegeString = messegeString + "\n" + element
        })
        client.messages 
        .create({ 
           body: messegeString, 
           from: 'whatsapp:+14155238886',       
           to: 'whatsapp:+918152007238' 
         }) 
        .then(message => console.log(message.sid)) 
        .done();
           
        }
    }).catch(err => {
        // log error if any
        console.log(err);
    

    
    
    
})})()

 

 
    
  

 