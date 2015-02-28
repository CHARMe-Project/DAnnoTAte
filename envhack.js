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
      updateDatasets(response.datasets);
    },
    error: function (xhr, status) {
      alert('error status = ' + status);
    }
  });
}

// Updates the datasets on the left-hand list
function updateDatasets(datasets) {
  // Clear the existing list of datasets
  $('#datasets li').remove();
  // Add each dataset to the list of datasets
  for (var i = 0; i < datasets.length; i++) {
    var dataset = datasets[i];
    $('#datasets ul').append("<li uri=\"" + dataset.uri + "\">" + dataset.title + "</li>");
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
    
    // Use the dataset's title to update the title of the Annotations window
    $('#datasetid').text($('#datasets li.selected').text());
    
    // Create the query string we want to use
    var datasetUri = $('#datasets li.selected').attr('uri');
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