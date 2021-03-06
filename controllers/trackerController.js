'use strict'
var async = require('async');
var transLocAPI = require('../models/transLocAPI');
console.log("loading the tracker controller...");

exports.renderMain = (req,res) => {
  res.render('tracker', {title: "Tracker"});
};

exports.dispRoute = (req,res) => {
  console.log("in dispRoute")
  var route = req.body.vanType
  var name;
  if (route == "2010") {
    name = "Campus BranVan (Weekdays)";
  } else if (route == "2011") {
    name = "Campus BranVan (Weekends)";
  } else if (route == "2020") {
    name = "Daytime Campus Shuttle";
  } else if (route == "3020") {
    name = "Daytime Waltham Shuttle";
  } else if (route == "3010") {
    name = "Evening Waltham Branvan";
  } else if (route == "1010") {
    name = "Boston/Cambridge Shuttle (Thurs)";
  } else if (route == "1020") {
    name = "Boston/Cambridge Shuttle (Fri)";
  } else if ( route == "1030") {
    name = "Boston/Cambridge Shuttle (Sat)";
  } else if (route == "1040") {
    name = "Boston/Cambridge Shuttle (Sun)";
  }
  console.log("fetching info of route: " + name)
  var stops = Query.getSchedule(route).then(data =>
    {
      //res.render('schedules', {name:name, data:data})
      res.json({data: data});
    })
}

exports.getEstimate = ( req, res) => {
  console.log("in getEstimate")
  const brandeisQuery = new transLocAPI(483);
  const response = {};
  //construct the two needed query parameters for API calls
  const route = req.body.vanType;
  const stop = req.body.stop;
  var shortname;
  var shortname2;
  var shortname3;
  var name;
  //campus bvan
  if (route == 2011 || route == 2010) {
    shortname = "Yellow"
    if (route == 2010){
      name = "Campus BranVan (Weekdays)";
    } else {
      name = "Campus BranVan (Weekends)";
    }
  //waltham bvan & extra waltham
  } else if (route == 3010) {
    shortname = "Blue"
    name = "Evening Waltham Branvan";
    shortname2 = "Green"
  //campus josephs
  } else if (route == 2020) {
    shortname = "Red"
    name = "Daytime Campus Shuttle";
  //waltham josephs
  } else if (route == 3020) {
    shortname = "Orange"
    name = "Daytime Waltham Shuttle";
  //boston shuttles
  } else if (route == 1010 || route == 1020 || route == 1030 || route == 1040) {
    shortname = "White"
    shortname2 = "Purple"
    shortname3 = "Pink"
    if (route == 1010) {
      name = "Boston/Cambridge Shuttle (Thurs)";
    } else if (route == 1020) {
      name = "Boston/Cambridge Shuttle (Fri)";
    } else if (route == 1030) {
      name = "Boston/Cambridge Shuttle (Sat)";
    } else {
      name = "Boston/Cambridge Shuttle (Sun)";
    }
  }
  //console.log("fetching ETA of next van at " + stop + " on the " + route + " route.")
  //construct two variables needed later
  var route_id = "";
  var stop_id = "";
  var arrival_times = [];

  async.waterfall([
    function(callback){
      brandeisQuery.findRouteIdShortName(route, callback);
    },
    function(route_id, callback){
      brandeisQuery.findStopId(stop, function(err, result){
        if(err){
          callback(err, null);
        } else {
          callback(null, route_id, result);
        }
      });
    },
    function(route_id, stop_id, callback) {
      brandeisQuery.findArrivalEstimate(route_id, stop_id, callback);
    }
  ],
  function(err, result){
    if(err){
      console.log("Sorry, I could not retrieve any information");
    } else {
      if (typeof result[0] === 'undefined' ){
        res.render('tracker', {route:name, stop:stop, arrival_time1: "No arrivals"});
      } else {
        if (typeof result[1] === 'undefined'){
          res.render('tracker', {route:name, stop:stop,
                                arrival_time1:result[0].substring(11,16)});
        } else {
          res.render('tracker', {route:name, stop:stop,
                                arrival_time1:result[0].substring(11,16),
                                arrival_time2:result[1].substring(11,16)});
        }
      }
    }
  });
};


// exports.getEstimate = ( req, res) => {
//   console.log("in getEstimate")
//   const partnersQuery = new transLocAPI(707);
//   const response = {};
//   //construct the two needed query parameters for API calls
//   const route = req.body.route.replace("-","–");;
//   const stop = (req.body.stop).replace("–","-");
//   console.log("fetching ETA of next van at " + stop + " on the " + route + " route.")
//   //construct two variables needed later
//   var route_id = "";
//   var stop_id = "";
//   var arrival_times = [];
//
//   async.waterfall([
//     function(callback){
//       partnersQuery.findRouteId(route, callback);
//     },
//     function(route_id, callback){
//       partnersQuery.findStopId(stop, function(err, result){
//         if(err){
//           callback(err, null);
//         } else {
//           callback(null, route_id, result);
//         }
//       });
//     },
//     function(route_id, stop_id, callback) {
//       partnersQuery.findArrivalEstimate(route_id, stop_id, callback);
//     }
//   ],
//   function(err, result){
//     if(err){
//       console.log("Sorry, I could not retrieve any information");
//     } else {
//       if (typeof result[0] === 'undefined' ){
//         res.render('tracker', {route:route, stop:stop, arrival_time1: "No arrivals"});
//       } else {
//         if (typeof result[1] === 'undefined'){
//           res.render('tracker', {route:route, stop:stop,
//                                 arrival_time1:result[0].substring(11,16)});
//         } else {
//           res.render('tracker', {route:route, stop:stop,
//                                 arrival_time1:result[0].substring(11,16),
//                                 arrival_time2:result[1].substring(11,16)});
//         }
//       }
//     }
//   });
// };
