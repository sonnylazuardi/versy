angular.module('starter.services', [])

.factory('Devo', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var devo = {};

  return {
    getDevo: function() {
      return devo;
    },
    setDevo: function(_devo) {
      devo = _devo;
    }
  };
})

.directive('noScroll', function($document) {

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {

      $document.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  }
});
