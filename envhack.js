var CHARME_URL = 'http://charme-test.cems.rl.ac.uk/sparql';
var FIND_NUM_CITATIONS = 'PREFIX oa: <http://www.w3.org/ns/oa#> ' +
                         'PREFIX cito: <http://purl.org/spar/cito/> ' +
                         'SELECT (COUNT(?citer) as ?numOfCitations) ' +
                         'WHERE { ' +
                            'GRAPH <http://localhost:3333/privateds/data/submitted> { ' +
                               '?anno a oa:Annotation .' +
                               '?anno cito:hasCitedEntity <${uri}> .' +
                               '?anno cito:hasCitingEntity ?citer .' +
                             '}' +
                         '}';


// Called when the window is loaded
window.onload = function() {
  // Create the selector for dataset objects
  createSelector('#results li');
}

// Creates a selector widget, given the identifier of a list
function createSelector(selector) {
  var $options = $(selector);
  $options.click(function(e) {
    // get the selected minimum wind speed
    var $li = $(e.target);
    // deselect all and select the clicked one
    $options.removeClass('selected');
    $li.addClass('selected');
    
    // Use the dataset's title to update the title of the Annotations window
    $('#datasetid').text($('#results li.selected').text());
    
    // Create the query string we want to use
    var datasetUri = $('#results li.selected').attr('uri');
    var queryString = FIND_NUM_CITATIONS.replace('${uri}', datasetUri);
    
    // Query the server, calling the given function on success
    queryServer(queryString, function(response) {
      alert(response.results.bindings[0].numOfCitations.value + ' citations');
    });
    
  });
}

// Queries the CHARMe node with the given query string. Server returns JSON, which is
// then passed to the given callback function
function queryServer(query, callback) {
  $.ajax({
    url: CHARME_URL,
    data: 'query=' + encodeURIComponent(query) + '&output=json',
    type: 'GET',
    crossDomain: true,
    dataType: 'json',
    success: callback,
    error: function (xhr, status) {
      alert('error status = ' + status);
    }
  });  
}