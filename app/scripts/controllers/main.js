'use strict';

/**
 * @ngdoc function
 * @name pokeloreApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pokeloreApp
 */
angular.module('pokeloreApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
