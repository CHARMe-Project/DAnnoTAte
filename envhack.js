var CHARME_URL = 'http://charme-test.cems.rl.ac.uk/sparql';

// Template SPARQL query for finding the number of citations attached to a dataset
var FIND_NUM_CITATIONS = 'PREFIX oa: <http://www.w3.org/ns/oa#> ' +
                         'PREFIX cito: <http://purl.org/spar/cito/> ' +
                         'SELECT (COUNT(?citer) as ?numOfCitations) ' +
                         'WHERE { ' +
                            'GRAPH <http://localhost:3333/privateds/data/submitted> { ' +
                               '?anno a oa:Annotation . ' +
                               '?anno cito:hasCitedEntity <${uri}> . ' +
                               '?anno cito:hasCitingEntity ?citer . ' +
                             '}' +
                         '}';

var FIND_CITATIONS = 'PREFIX oa: <http://www.w3.org/ns/oa#> ' +
                         'PREFIX cito: <http://purl.org/spar/cito/> ' +
                         'SELECT ?publication ' +
                         'WHERE { ' +
                            'GRAPH <http://localhost:3333/privateds/data/submitted> { ' +
                               '?cite a <http://purl.org/spar/cito/CitationAct> . ' +
                               '?cite cito:hasCitedEntity <${dataset}> . ' +
                               '?cite cito:hasCitingEntity ?publication . ' +
                             '}' +
                         '}';                       
                         
var app = angular.module('enviroHack2015', []);

// For the hack we use a global variable to hold the datasets that have been returned
// from the server.
var datasets = null;

app.controller('MainCtrl', function($scope, $http) {
  // Called when the Search button is clicked
  $scope.search = function() {
    // At the moment we ignore the search string!
    // We load the list of datasets from the server. In a real system we would call a
    // web service here, but for now we just load a static file from GitHub!
    $http.get('datasets.json')
      .success(function(data) {
        console.log(data);
        $scope.datasets = data.datasets;
      })
      .error(function (data, status) {
        console.log(data);
      });
  }

  $scope.showData = function(dataset) {
    $scope.dataset = dataset;
    // Create the query string we want to use
    var query = FIND_CITATIONS.replace('${dataset}', dataset.uri);
    $http.get(CHARME_URL, {
      params: {query: query, output: 'json'},
    })
    .success(function(data) {
      console.log(data);
      if (data.results.bindings.length)
        citationFromDOI(data.results.bindings[0].publication.value.split(":")[1]);
      else
        console.log("No bindings!");
    }).
    error(function(data) {
      console.error(data);
    });
  }

  function citationFromDOI(url) {
    $http.get(url, {
      headers: {"Accept": "application/vnd.citationstyles.csl+json;q=1.0"},
    }).
    success(function(data) { console.log(data); });
  }
});
