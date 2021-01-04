const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const util = require('util')

let testUserName = 'Bob';

// Winston logger
let winston = require('winston');

let logCreatedUser = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`;
        })
    ),
    transports: [new winston.transports.Console({json: true}), new winston.transports.File({json: true,filename: process.env.LOG_TEST_USERS_CREATED}), ]
});

const MESSAGE = Symbol.for('message');
const jsonFormatter = (logEntry) => {
  const base = { timestamp: new Date() };
  const json = Object.assign(base, logEntry);
  logEntry[MESSAGE] = JSON.stringify(json);
  return logEntry;
};

const logCreatePage = winston.createLogger({
  level: 'info',
  format: winston.format(jsonFormatter)(),
  transports:  [new winston.transports.Console({json: true}),
              new winston.transports.File({json: true,filename: process.env.LOG_TEST_PAGES_CREATED })
    ]
});




var app_access_token = process.env.APP_TOKEN;
var appID = process.env.APP_ID


const POSTURL = 'https://graph.facebook.com/v9.0/'+ appID + '/accounts/test-users?access_token='+app_access_token;


async function makePostRequest() {
        var fbdata = {};
        fbdata = {
            "installed": true,
            "permissions": process.env.PERMS,  // To make a page, publish_pages,pages_manage_metadata,pages_read_engagement
            "name": testUserName 
        };

    console.log("SENDING ",fbdata);
    let res = await axios.post(POSTURL, fbdata);
    console.log("RES DATA ", fbdata,res.data);
    logCreatedUser.log('info',util.inspect(res.data, false, null, true) );
    makePageRequest(res.data.id,res.data.access_token);

}

async function makePageRequest(id,token){

    const PAGEURL = 'https://graph.facebook.com/v9.0/'+id+ '/accounts?access_token='+token; 
     var fbdata = {
            'about': 'Great OSB test page'+id,
            'category_enum':'COMMUNITY_ORGANIZATION',
            'name': 'OSB Test Page'+id,
            'picture': 'https://images.indianexpress.com/2020/11/Google-logos.jpg',
            'cover_photo': "{\"url\": 'https://images.indianexpress.com/2020/11/Google-logos.jpg' }",
        };

    console.log("SENDING PAGE CREATE",fbdata);
    let res = await axios.post(PAGEURL, fbdata);
    console.log("RES DATA ", fbdata,res.data);
    logCreatePage.log('info',util.inspect(res.data, false, null, true) );

}

makePostRequest();

