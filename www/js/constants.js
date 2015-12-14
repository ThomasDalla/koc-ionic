
angular.module('koc.constants', [])
  .constant('ConfigUrl', 'https://koc-mobile.firebaseio.com/config')
  .constant('DefaultConfig',
  {
    endpoints: [
      "https://koc-api.herokuapp.com/api"
    ],
  })
  .constant('KocUrl','http://www.kingsofchaos.com');
