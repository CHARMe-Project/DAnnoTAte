angular.module('labelFilters', []).filter('shortLabel', function() {
    return function(input) {
        return input ? 'aaa' : 'bbb';
    };
});