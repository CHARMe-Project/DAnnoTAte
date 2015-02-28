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
                         'PREFIX cnt: <http://www.w3.org/2011/content#> ' +
                         'SELECT ?publication ?comment ' +
                         'WHERE { ' +
                            'GRAPH <http://localhost:3333/privateds/data/submitted> { ' +
                               '?cite a <http://purl.org/spar/cito/CitationAct> . ' +
                               '?cite cito:hasCitedEntity <${dataset}> . ' +
                               '?cite oa:hasBody ?body . ' +
                               '?body cnt:chars ?comment . ' +
                               '?cite cito:hasCitingEntity ?publication . ' +
                             '}' +
                         '}';

var FIND_RELATED_DATA = "PREFIX oa: <http://www.w3.org/ns/oa#> "+
                    "PREFIX dctypes: <http://purl.org/dc/dcmitype/>  "+
                    "SELECT DISTINCT ?relation "+
                    "WHERE { "+
                      "GRAPH <http://localhost:3333/privateds/data/submitted> {  "+
                        "{ "+
                          "<${datasetURL}> a dctypes:Dataset . "+
                          "?anno oa:hasTarget <${datasetURL}> . "+
                          "?anno oa:hasBody ?relation . "+
                          "?relation a dctypes:Dataset . "+
                        "} UNION { "+
                          "<${datasetURL}> a dctypes:Dataset . "+
                          "?anno oa:hasBody <${datasetURL}> . "+
                          "?anno oa:hasTarget ?relation . "+
                          "?relation a dctypes:Dataset . "+
                        "} UNION { "+
                          "<${datasetURL}> a dctypes:Dataset . "+
                          "?anno oa:hasTarget <${datasetURL}> . "+
                          "?anno oa:hasTarget ?relation . "+
                          "?relation a dctypes:Dataset . "+
                          "FILTER(?relation != <${datasetURL}>) "+
                        "} "+
                      "} "+
                    "}";

var FIND_COMMENTS = 'PREFIX oa: <http://www.w3.org/ns/oa#> ' +
                    'PREFIX dctypes: <http://purl.org/dc/dcmitype/> ' +
                    'PREFIX cnt: <http://www.w3.org/2011/content#> ' +
                    'PREFIX cito: <http://purl.org/spar/cito/> ' +
                    'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ' +
                    'SELECT DISTINCT ?comment ' +
                    'WHERE { ' +
                    '  GRAPH <http://localhost:3333/privateds/data/submitted> { ' +
                    '      ?anno rdf:type ?type ' +
                    '      FILTER( ?type != cito:CitationAct )' +
                    '      ?anno oa:hasTarget <${dataset}> .' +
                    '      ?anno oa:hasBody ?body .' +
                    '      ?body a cnt:ContentAsText. ?body cnt:chars ?comment .' +
                    '  }' +
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


  transformData = function(data, u) {
    console.log(data)
    var u = !!u ? u : "Root";

    var children = [];
    for (var i in data["results"]["bindings"]) {;
      var childUrl = data["results"]["bindings"][i]["relation"]["value"];
      children.push({
        "name": childUrl,
        "size": 20
      });
    }
    var transformed = {
      "name": u,
      "children": children
    };

    createCodeFlower = new CodeFlower("#visualization", 600, 200).update(transformed);
    return transformed;
  };

  $scope.showData = function(dataset) {
    $scope.dataset = dataset;

    // Create the query string we want to use
    var query = FIND_CITATIONS.replace('${dataset}', dataset.uri);
    $http.get(CHARME_URL, {
      params: {query: query, output: 'json'},
    })
    .success(function(data) {
      console.log(data);
      $scope.publications = [];
      data.results.bindings.forEach(function(item) {
        citationFromDOI(item.publication.value, item.comment.value);
      });
    })
    .error(function(data) {
      console.error(data);
    });

    var query = FIND_RELATED_DATA.replace(new RegExp('\\$\\{datasetURL\\}', "g"), dataset.uri);
    
    $http.get(CHARME_URL, {
      params: {query: query, output: 'json'},
    })
    .success(function(data, u) {
      var u = !!u ? u : "Root";

      var children = [];
      for (var i in data["results"]["bindings"]) {;
        var childUrl = data["results"]["bindings"][i]["relation"]["value"];
        children.push({
          "name": childUrl,
          "size": 20
        });
      }
      var transformed = {
        "name": u,
        "children": children
      };

      createCodeFlower = new CodeFlower("#visualization", 400, 400).update(transformed);
      return transformed;
    })
    .error(function(data) {
      console.error(data);
    });

    var query = FIND_COMMENTS.replace('${dataset}', dataset.uri);
    $http.get(CHARME_URL, {
      params: {query: query, output: 'json'},
    })
    .success(function(data) {
      console.log(data);
      $scope.comments = [];
      data.results.bindings.forEach(function(item) {
        $scope.comments.push(item.comment.value);
      });
    })
    .error(function(data) {
      console.error(data);
    });
  }

  function citationFromDOI(url, comment) {
    $http.get(url, {
      headers: {"Accept": "application/vnd.citationstyles.csl+json;q=1.0"},
    })
    .success(function(data) {
      data.comment = comment;
      console.log(data);
      $scope.publications.push(data);
    })
    .error(function(data) {
      console.error(data);
    });
  }
});
