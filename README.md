# KoC Mobile Application
Documentation to come.<br>
Demo: https://vimeo.com/124733714

### Pre-requisites

You need NodeJS, cordova, ionic and bower
<pre>
$ npm install -g cordova
$ npm install -g ionic
$ npm install -g bower
</pre>

### Prepare
<pre>
$ git clone https://github.com/ThomasDalla/koc-ionic
$ cd koc-ionic
$ npm install
$ bower install
</pre>

### Test
<pre>$ ionic serve --lab</pre>

Note: if testing on a web browser, you need a local running instance of the back-end:
<pre>
$ git clone https://github.com/ThomasDalla/koc-api
$ cd koc-api
$ node server
> Magic happens on port 3000
</pre>
You don't need it if running on iOS/Android, as per below.

#### iOS
<pre>
$ ionic build ios
$ ionic emulate ios -l -c # on emulator (fast)
</pre>

#### Android
<pre>
ionic build android
ionic emulate android -l -c # on emulator (slow)
ionic run android --device  # on device (fast)
</pre>
