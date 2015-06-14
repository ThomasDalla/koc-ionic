#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either
// the identifier, the filesystem location
// or the URL
var pluginlist = [
  "https://github.com/VersoSolutions/CordovaClipboard",
  "https://github.com/jcsmesquita/cordova-speechrecognition",
  "https://github.com/ThomasDalla/cordova-plugin-koc",
  "https://github.com/whiteoctober/cordova-plugin-app-version.git",
  "https://github.com/apache/cordova-plugin-inappbrowser.git",
  "cordova-plugin-whitelist",
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

pluginlist.forEach( function(plug) {
  exec("ionic plugin add " + plug, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if(err) console.log(err);
  });
});

pluginlist.forEach(function(plug) {
  console.log("ionic plugin add " + plug)
});