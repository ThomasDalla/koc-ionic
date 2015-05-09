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
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
  sys.puts(stdout);
}

pluginlist.forEach(function(plug) {
  exec("ionic plugin add " + plug, puts);
});