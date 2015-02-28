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
                         

// For the hack we use a global variable to hold the datasets that have been returned
// from the server.
var datasets = null;


// Called when the window is loaded
window.onload = function() {
  // Does nothing yet
}

// Called when the Search button is clicked
function searchButtonClicked() {
  // At the moment we ignore the search string!
  // We load the list of datasets from the server. In a real system we would call a
  // web service here, but for now we just load a static file from GitHub!
  $.ajax({
    url: 'https://raw.githubusercontent.com/jonblower/envhack15-ui/master/datasets.json',
    type: 'GET',
    crossDomain: true,
    dataType: 'json',
    success: function(response) {
      datasets = response.datasets;
      updateDatasets();
    },
    error: function (xhr, status) {
      alert('error status = ' + status);
    }
  });
}

// Updates the datasets on the left-hand list
function updateDatasets() {
  // Clear the existing list of datasets
  $('#datasets li').remove();
  // Add each dataset to the list of datasets
  for (var i = 0; i < datasets.length; i++) {
    var dataset = datasets[i];
    $('#datasets ul').append("<li datasetid=\"" + i + "\">" + dataset.title + "</li>");
  }
  // Turn the list of datasets into a selector
  createSelector('#datasets li');
}

// Creates a selector widget, given the identifier of a list
function createSelector(selector) {
  var $options = $(selector);
  $options.click(function(e) {
    // get the selected dataset
    var $li = $(e.target);
    // deselect all list items, then select the clicked one
    $options.removeClass('selected');
    $li.addClass('selected');
    
    // Get the dataset that has been selected
    var datasetId = $('#datasets li.selected').attr('datasetid');
    var dataset = datasets[datasetId];
    
    // Use the dataset's title to update the title of the Annotations window
    $('#datasetid').text(dataset.title);
    $('#datasetabstract').text(dataset.abstract);
    $('#dataseturi').html("<a href=\"" + dataset.uri + "\">" + dataset.uri + "</a>");
    
    // Create the query string we want to use
    var queryString = FIND_CITATIONS.replace('${dataset}', dataset.uri);
    //alert(queryString);
    
    // Query the server, calling the given function on success
    queryServer(queryString, function(response) {
      alert(response.results.bindings.length + ' citations');
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