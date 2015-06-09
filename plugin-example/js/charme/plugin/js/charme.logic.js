/*
 * Copyright (c) 2014, CGI
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, are 
 * permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice, this list of 
 *    conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list 
 *    of conditions and the following disclaimer in the documentation and/or other materials 
 *    provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors may be 
 *    used to endorse or promote products derived from this software without specific prior 
 *    written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF 
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
 * THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT 
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) 
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS 
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/*
 * charme.logic.js
 * 
 * Functions for abstracting the lower level functions of the jsonoa.js library
 */
jQuery.support.cors = true;
if (!charme) {
	var charme = {};
	if (typeof wgxpath !== 'undefined') {
		wgxpath.install();
	}
}
charme.logic = {};

charme.logic.authToken = {};

charme.logic.constants = {
    ANNO_DEPTH : 3, // A depth specifier for the graph depth that is
    // returned when viewing annotations
    ATN_ID_PREFIX : 'http://localhost/',
    BODY_ID_PREFIX : 'http://localhost/',
    COMPOSITE_ID_PREFIX : 'http://localhost/',

    URL_PREFIX : 'http://',
    DXDOI_URL : 'http://dx.doi.org/',
    DXDOI_CRITERIA_ID : 'id',

    CROSSREF_URL : 'http://data.crossref.org/',
    CROSSREF_CRITERIA_ID : 'id',
    NERC_SPARQL_EP : 'http://vocab.nerc.ac.uk/sparql/sparql',
    TARGET_URL : 'localData/target_types.json', // use locally cached file for now

    SPARQL_GCMD : 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>			' +
            'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>				' +
            'SELECT ?p ?l WHERE {								' +
            '	<http://vocab.nerc.ac.uk/collection/P64/current/> rdf:type skos:Collection.	' +
            '	<http://vocab.nerc.ac.uk/collection/P64/current/> ?o ?p.			' +
            '	?p skos:prefLabel ?l								' +
            '}											' +
             'ORDER BY ?l									',

    FACET_TYPE_TARGET_TYPE: 'dataType',
    FACET_TYPE_CITING_TYPE: 'citingType',
    FACET_TYPE_BODY_TYPE: 'bodyType',
    FACET_TYPE_MOTIVATION: 'motivation',
    FACET_TYPE_DOMAIN: 'domainOfInterest',
    FACET_TYPE_ORGANIZATION: 'organization',
    //STATE_DELETE: 'retired',
        
    NUM_PAGE_BUTTONS: 15 // Odd number
};

/*
 * A series of utility functions for constructing REST requests to the various
 * CHARMe web services - main reference source for this is the CHARMe Node ICD
 * 
 */
charme.logic.urls={};
charme.logic.urls._baseURL = function(uri) {
	return (charme.settings.REMOTE_BASE_URL.match(/\/$/) ? charme.settings.REMOTE_BASE_URL :
		charme.settings.REMOTE_BASE_URL + '/');
};
charme.logic.urls.existRequest = function(uri) {
	return charme.logic.urls._baseURL() + 'index/' + uri + '?format=json-ld';
};
charme.logic.urls.createRequest = function() {
	return charme.logic.urls._baseURL() + 'insert/annotation';
};
charme.logic.urls.flagRequest = function(annoID) {
	return charme.logic.urls._baseURL() + 'resource/' + annoID + '/reporttomoderator/';
};
charme.logic.urls.updateRequest = function() {
	return charme.logic.urls._baseURL() + 'modify/annotation';
};
charme.logic.urls.stateRequest = function(newState) {
	return charme.logic.urls._baseURL() + 'advance_status/';
};
charme.logic.urls.deleteRequest = function(annoID) {
    return charme.logic.urls._baseURL() + 'resource/' + annoID;
};
charme.logic.urls.fetchForTarget = function(targetId) {
	//return 'testData/charmetest.atom';
	return charme.logic.urls._baseURL() + 'search/atom?target=' + encodeURIComponent(targetId) +
		'&status=submitted';
};
charme.logic.urls.fetchRequest = function(id) {
	return charme.logic.urls._baseURL() + 'data/' +
		id +
		'?format=json-ld' +
		//(charme.logic.constants.ANNO_DEPTH === 0 ? '' : '&depth=' + 
		//	charme.logic.constants.ANNO_DEPTH);
                '&depth=' + charme.logic.constants.ANNO_DEPTH;
};
charme.logic.urls.fetchSearchFacets = function(criteria, facets){
	var url=charme.logic.urls._baseURL() + 'suggest/atom?' + 
                'depth=' + charme.logic.constants.ANNO_DEPTH + 
                '&status=submitted&q=';
	if (typeof facets !== 'undefined'){
		url+=facets.join(',');
	} else {
		url+='*';
	}

    if (typeof criteria.targets !== 'undefined' && criteria.targets.length > 0){
			url+='&target=' + encodeURIComponent(criteria.targets.join(' '));
	}
        
	return url;
};
charme.logic.urls.userDetailsRequest = function(id) {
	return charme.logic.urls._baseURL() + 'token/userinfo';
};
charme.logic.urls.authRequest = function() {
	return charme.settings.AUTH_BASE_URL + charme.settings.AUTH_PATH + '/?client_id=' +
		charme.settings.AUTH_CLIENT_ID + '&response_type=' + 
		charme.settings.AUTH_RESPONSE_TYPE;
};
charme.logic.urls.gcmdVocabRequest = function(sparqlQry) {
	var url = charme.logic.constants.NERC_SPARQL_EP;
	url += '?query=' + encodeURIComponent(charme.logic.constants.SPARQL_GCMD);
	url += '&output=json';
	return url;
};
charme.logic.urls.targetTypesRequest = function() {
    return charme.logic.constants.TARGET_URL;
};
charme.logic.urls.dxdoiRequest = function(criteria) {
	var url = null;
	if (criteria[charme.logic.constants.DXDOI_CRITERIA_ID] &&
		criteria[charme.logic.constants.DXDOI_CRITERIA_ID].length > 0) {
		var doi = criteria[charme.logic.constants.DXDOI_CRITERIA_ID];
		if (doi.indexOf(charme.logic.constants.DXDOI_URL) === 0) {
			doi = doi.substring(charme.logic.constants.DXDOI_URL.length + 1);
		}
		url = charme.logic.constants.DXDOI_URL + doi;
	}
	return url;
};
charme.logic.urls.fetchAnnotations = function(criteria) {
	var url= charme.logic.urls._baseURL() + 'search/atom?' + 
                'depth=' + charme.logic.constants.ANNO_DEPTH + 
                '&status=submitted';
	if (typeof criteria.targets !== 'undefined' && criteria.targets.length > 0){
		url+='&target=' + encodeURIComponent(criteria.targets.join(' '));
	}
        if (typeof criteria.targetTypes !== 'undefined' && criteria.targetTypes.length > 0){
		url+='&dataType=' + encodeURIComponent(criteria.targetTypes.join(' '));
	}
        //if (typeof criteria.citingTypes !== 'undefined' && criteria.citingTypes.length > 0){
	//	url+='&citingType=' + encodeURIComponent(criteria.citingTypes.join(' '));
	//}
        if (typeof criteria.citingTypes !== 'undefined' && criteria.citingTypes.length > 0){
		url+='&bodyType=' + encodeURIComponent(criteria.citingTypes.join(' '));
	}
	if (typeof criteria.motivations !== 'undefined' && criteria.motivations.length > 0){
		url+='&motivation=' + encodeURIComponent(criteria.motivations.join(' '));
	}
	if (typeof criteria.domainsOfInterest !== 'undefined' && criteria.domainsOfInterest.length > 0) {
		url+='&domainOfInterest=' + encodeURIComponent(criteria.domainsOfInterest.join(' '));
	}
	if (typeof criteria.organization !== 'undefined' && criteria.organization !== null &&
		criteria.organization.length > 0) {
		url += '&organization=' + encodeURIComponent(criteria.organization);
	}
	if (typeof criteria.creator !== 'undefined' && criteria.creator !== null &&
		criteria.creator.length > 0) {
		url += '&userName=' + encodeURIComponent(criteria.creator);
	}
        if (typeof criteria.pageNum !== 'undefined' && criteria.pageNum !== null) {
		url += '&startPage=' + encodeURIComponent(criteria.pageNum.toString());
	}
        if (typeof criteria.resultsPerPage !== 'undefined' && criteria.resultsPerPage !== null) {
		url += '&count=' + encodeURIComponent(criteria.resultsPerPage.toString());
	}
	return url;
};

/*
 * Utility functions
 */

/**
 * Escapes characters in the string that are not safe to use in a RegExp. Taken
 * from Google closure library - https://developers.google.com/closure/library/
 * 
 * @param {*}
 *            s The string to escape. If not a string, it will be cast to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
charme.logic.regExpEscape = function(s) {
	return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');
};

/**
 * A 'namespace resolver' This function is essential for parsing XML documents
 * that contain namespaces. Given a prefix, it will resolve to a canonical
 * namespace URL.
 * 
 * @param prefix
 * @returns
 */
/*charme.logic.fabioNSResolver = function(prefix) {
	var ns = {
		'rdfs' : 'http://www.w3.org/2000/01/rdf-schema#',
		'owl' : 'http://www.w3.org/2002/07/owl#'
	};
	return ns[prefix] || null;
};*/

charme.logic.shortAnnoId = function(longformId){
	var matches = longformId.match(/([^\/]+)\/?$/g);
	var shortId = longformId;
	if (matches)
		shortId = matches[0];
	return shortId;
};

/**
 * A utility function that will find a DOI within a given string
 * 
 * @param someString
 * @returns
 */
charme.logic.findDOI = function(someString) {
	var result = (/\b(10[.][0-9]{3,}(?:[.][0-9]+)*\/(?:(?!["&\'])\S)+)\b/).exec(someString);
	return result && result[0] ? result[0] : result;
};

/**
 * A function for auto-generating GUIDs
 * @returns
 */
charme.logic.generateGUID = function() {
	return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
};

/**
 * A utility function for generating valid CHARMe resource identifiers
 * @returns {String}
 */
charme.logic.generateId = function() {
	return charme.logic.urls._baseURL() + 'resource/' + charme.logic.generateGUID();
};

charme.logic.validURI = function(uri){
	var regex = charme.logic.uriMatcher;
	var matches = regex.exec(uri);
	//Did we find a match, and does it match the entire string?
	if (matches && matches.length > 0 && matches[0].length === uri.length){
		return true;
	} else {
		return false;
	}
};

/*
 * Functions for fetching data
 */

/**
 * Given some authentication details provided by the login action and passed
 * back to the CHARMe plugin,
 */
charme.logic.fetchUserDetails = function(authToken) {
	var promise = new Promise(function(resolver) {
		var reqUrl = charme.logic.urls.userDetailsRequest();
		if (reqUrl === null || reqUrl.length === 0) {
			resolver.reject();
		}
		$.ajax(reqUrl, {
			headers : {
				'Authorization' : ' Bearer ' + authToken
			}
		}).then(function(userDetails) {
			resolver.fulfill(userDetails);
		}, function(error) {
			resolver.reject(error);
		});
	});
	return promise;
};

/**
 * Fetches and processes the GCMD keywords used for specifying the domain of
 * interest
 * 
 * @returns {Promise}
 */
charme.logic.fetchGCMDVocab = function(removeDuplicates) {
    var promise = new Promise(function(resolver) {
        var reqUrl = charme.logic.urls.gcmdVocabRequest(charme.logic.constants.SPARQL_GCMD);
        if (reqUrl === null || reqUrl.length === 0) {
            resolver.reject();
        }
        $.ajax(reqUrl, {
            headers : {
                accept : 'application/sparql-results+json; charset=utf-8'
            }
        }).then(function(jsonResp) {
            var keywords = [];
            $(jsonResp.results.bindings).each(function(index, binding) {
                var word = binding.l.value;
                keywords.push({
                    uri: binding.p.value,
                    desc: word.trim()
                });
            });
            
            if(!removeDuplicates) {
                resolver.fulfill(keywords);
            } else {
                // Remove duplicates, inspired by this: http://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/
                var keywordsNoDuplicates = [], tempObj = {};
                for(var i = 0; i < keywords.length; i++) {
                    tempObj[charme.logic.shortDomainLabel(keywords[i].desc)] = keywords[i].uri;
                }
                for(var desc in tempObj) {
                    keywordsNoDuplicates.push({
                        uri: tempObj[desc],
                        desc: desc
                    });
                }
                
                resolver.fulfill(keywordsNoDuplicates);
            }
        }, function(e) {
            resolver.reject(e);
        });
    });
    return promise;
};


/**
 * Fetches the keywords used for specifying Motivation
 * This will pick up statically defined list of motivations from a text file - motivations.json
 * No SPARQL call is made since the list of motivations is not expected to change drastically over time.
 *
 * @returns {Promise}
 */
charme.logic.fetchMotivationVocab = function() {

    //return $.getJSON("motivations.json").done();

    var promise = new Promise(function(resolver) {

        try {

            var jsontext =      '{                                                                                                                              ' +
                                '    "head": {                                                                                                                  ' +
                                '        "vars": [ "p" , "l" ]                                                                                                  ' +
                                '    } ,                                                                                                                        ' +
                                '    "results": {                                                                                                               ' +
                                '        "bindings": [                                                                                                          ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#bookmarking" } ,                                      ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > bookmarking" }                       ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#classifying" } ,                                      ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > classifying" }                       ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#commenting" } ,                                       ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > commenting" }                        ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#describing" } ,                                       ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > describing" }                        ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#editing" } ,                                          ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > editing" }                           ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#highlighting" } ,                                     ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > highlighting" }                      ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#identifying" } ,                                      ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > identifying" }                       ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#linking" } ,                                          ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > linking" }                           ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#moderating" } ,                                       ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > moderating" }                        ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#questioning" } ,                                      ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > questioning" }                       ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#replying" } ,                                         ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > replying" }                          ' +
                                '            } ,                                                                                                                ' +
                                '            {                                                                                                                  ' +
                                '                "p": { "type": "uri" , "value": "http://www.w3.org/ns/oa#tagging" } ,                                          ' +
                                '                "l": { "type": "literal" , "xml:lang": "en" , "value": "OA > Motivation > tagging" }                           ' +
                                '            }                                                                                                                  ' +
                                '        ]                                                                                                                      ' +
                                '    }                                                                                                                          ' +
                                '}                                                                                                                              ' ;


            var jsonResp = JSON.parse(jsontext);

            var keywords = [];
            $(jsonResp.results.bindings).each(function (index, binding) {
                var word = binding.l.value;
                word = word.substring(word.lastIndexOf('>') + 1);
                keywords.push({
                    uri: binding.p.value,
                    desc: word
                });
            });
            resolver.fulfill(keywords);


        }
        catch(e) {
            resolver.reject(e);
        }


    });

    return promise;

};

charme.logic.fetchTargetTypeVocab = function() {
    var promise = new Promise(function(resolver) {
        var reqUrl = charme.logic.urls.targetTypesRequest(charme.logic.constants.TARGET_URL);
        if (reqUrl === null || reqUrl.length === 0) {
            resolver.reject();
        }
        
        $.ajax(reqUrl, {
            headers: {
                accept: 'application/json; charset=utf-8'
            }
        }).then(function(jsonResp) {
            if (typeof jsonResp === 'string'){
                jsonResp = JSON.parse(jsonResp);
            }
            resolver.fulfill(jsonResp);
        }, function(error) {
            console.error('Error fetching target types');
            resolver.reject('Error: Could not fetch target types');
        });
    });
    
    return promise;
};

/**
 * Uses the dx.doi web services (available from http://www.dx.doi.org/ to retrieve 
 * bibliographic data for a given DOI
 */
charme.logic.fetchDxdoiMetaData = function(criteria) {
    var promise = new Promise(function(resolver) {
        var reqUrl = charme.logic.urls.dxdoiRequest(criteria);
        if(reqUrl === null || reqUrl.length === 0) {
            resolver.reject();
        }
        $.ajax(reqUrl, {
            headers: {
                accept: 'text/x-bibliography; style=apa; locale=en-US'
            }
        }).then(function(xmlResp) {
                resolver.fulfill(xmlResp);
        }, function(e) {
                resolver.reject(e);
        });
    });
    return promise;
};

/**
 * Given a state, returns true if any metadata exists for this resource
 */
charme.logic.exists = function(state, successCB, errorCB) {
	var reqUrl = charme.logic.urls.existRequest(state);
	$.ajax(reqUrl, {
		dataType : 'json',
		success : successCB,
		error : errorCB
	});
};

/**
 * Persist a populated annotation to the triplestore
 * 
 * Parameters: successCB: a callback to be invoked on successful completion
 * errorCB: a callback to be invoked on error
 */
charme.logic.createAnnotation = function(annotation, successCB, errorCB) {
	var reqUrl = charme.logic.urls.createRequest();
	var jsonObj = annotation.serialize();
	var stringified = JSON.stringify(jsonObj);
	$.ajax(reqUrl, {
		dataType : 'json',
		headers : {
			'Authorization' : ' Bearer ' + charme.logic.authToken.token
		},
		type : 'POST',
		contentType : 'application/ld+json',
		success : successCB,
		error : errorCB,
		data : stringified
	});
};

/**
 * Persist a populated annotation to the triplestore
 * 
 * Parameters: successCB: a callback to be invoked on successful completion
 * errorCB: a callback to be invoked on error
 */
charme.logic.saveGraph = function(graph, token, url) {
	var promise = new Promise(function(resolver) {
		var reqUrl = url;
		if (!reqUrl) {
			reqUrl = charme.logic.urls.createRequest();
		}

		var jsonSrc = graph.toJSON();

		$.ajax(reqUrl, {
			dataType : 'text',
			type : 'POST',
			headers : {
				'Authorization' : ' Bearer ' + token
			},
			contentType : 'application/ld+json',
			data : jsonSrc
		}).then(function() {
			resolver.fulfill();
		}, function(e, msg) {
			console.error('Error saving annotation: ' + msg);
			resolver.reject(e);
		});
	});
	return promise;
};

/**
 * Retrieve a specific annotation
 * 
 */
charme.logic.fetchAnnotation = function(annotationId) {
	// Isolate the annotation ID from a full URI
	var shortId = charme.logic.shortAnnoId(annotationId);

	var promise = new Promise(function(resolver) {
		var reqUrl = charme.logic.urls.fetchRequest(shortId);
		$.ajax(reqUrl, {
			type : 'GET'
		}).then(function(data) {
			var graph = new jsonoa.core.Graph();
			graph.load(data, false).then(function(graph) {
				resolver.fulfill(graph);
			}, function(e) {
				resolver.reject(e);
			});
		}, function(jqXHR, textStatus, errorThrown) {
			resolver.reject();
		});
	});
	return promise;
};

charme.logic.fetchAllSearchFacets = function(criteria){
	var promise = new Promise(function(resolver) {
		var reqUrl = charme.logic.urls.fetchSearchFacets(criteria);
                
		$.ajax(reqUrl, {
			type : 'GET'
		}).then(function(data) {
			// Data is returned as ATOM wrapped json-ld
			var result = new charme.atom.Result(data);
			// Extract json-ld from the multiple 'content' payloads returned
			var resultMap = [];
			/*
			 * Collect all entries so that they can be processed at the same
			 * time
			 */
                        
                        // If I fetch target type vocab here, it breaks the code. Why? Do it in the ctrl instead.
                        /*var validTargetTypeLabels = {};
                        charme.logic.fetchTargetTypeVocab().then(function(types) {
                            for(var i = 0; i < types.length; i++) {
                               var label = types[i].label.replace(" ", "");
                               validTargetTypeLabels[label] = types[i].label;
                            }*/
                            $.each(result.entries, function(index, entry) {
                                    var facetGraphStr = entry.content;
                                    var facetGraphObj = JSON.parse(facetGraphStr);
                                    var facetType = entry.id;
                                    resultMap[facetType]=[];
                                    var facets = [];
                                    if (typeof facetGraphObj[jsonoa.constants.GRAPH]!=='undefined'){
                                            facets = facetGraphObj[jsonoa.constants.GRAPH];
                                    } else {
                                            facets.push(facetGraphObj);
                                    }
                                    
                                    $.each(facets, function (index, facet){
                                            var facetObj = {};
                                            facetObj.uri=facet[jsonoa.constants.ID];
                                            if (facetType === charme.logic.constants.FACET_TYPE_ORGANIZATION)
                                                facetObj.label = facet[jsonoa.constants.NAME];
                                            else
                                                facetObj.label = facet[jsonoa.constants.PREF_LABEL];

                                            resultMap[facetType].push(facetObj);
                                    });
                            });
                        //});
			resolver.fulfill(resultMap);
		}), function(jqXHR, textStatus, errorThrown) {
			resolver.reject();
		};
	});

	return promise;
};

charme.logic.shortAnnoTitle = function(anno) {
	var out = '';
	var bodies = anno.getValues(jsonoa.types.Annotation.BODY);
	angular.forEach(bodies, function(body) {
            if(body.hasType) { // Check is necessary as sometimes the body of a value is simply a string, not a jsonoa object
                if (body.hasType(jsonoa.types.Text.TEXT) || body.hasType(jsonoa.types.Text.CONTENT_AS_TEXT))
                    out = body.getValue(jsonoa.types.Text.CONTENT_CHARS);
                else if(out.length === 0 && !body.hasType(jsonoa.types.SemanticTag.TYPE))
                    out = body.getValue(jsonoa.types.Common.ID);
            }
	});
        
        if(out.length === 0 && anno.hasType(jsonoa.types.CitationAct.TYPE))
            out = anno.getValue(jsonoa.types.CitationAct.CITING_ENTITY).getValue(jsonoa.types.Common.ID);
        
	return out;
};

// Written this way so that can be called both from js and as HTML filter
charme.logic.shortDomainLabel = function(label) {
    if(label)
        return label.substring(label.lastIndexOf('>') + 1).trim();
    else {
        return function(label) {
            return label.substring(label.lastIndexOf('>') + 1).trim();
        };
    }
};

charme.logic.shortTargetName = function(name, length) {
    var out = '';
    var ellipsis = '...';
    
    if(name && length) {
        if(name.length > length)
            out = name.substring(0, length - ellipsis.length) + ellipsis;
        else
            out = name.substring(0, length);
    }

    return out;
};

/**
 * Retrieve all annotations matching the supplied criteria
 *
 * Parameters:
 * 	criteria: The values which will be used to search the annotations
 */
charme.logic.searchAnnotations = function(criteria) {
    var promise = new Promise(function(resolver) {
        var reqUrl = charme.logic.urls.fetchAnnotations(criteria);
        $.ajax(reqUrl, {
            type : 'GET'
        }).then(function(data) {
            // Data is returned as ATOM wrapped json-ld
            var result = new charme.atom.Result(data);
            // Extract json-ld from the multiple 'content' payloads returned
            var resultArr = [];
            /*
             * Collect all entries so that they can be processed at the same
             * time
             */
            $.each(result.entries, function(index, entry) {
                var shortGraph = $.parseJSON(entry.content);
                if(typeof shortGraph[jsonoa.constants.GRAPH] !== 'undefined') {
                    resultArr.push(shortGraph[jsonoa.constants.GRAPH]);
                } else {
                    resultArr.push(shortGraph);
                }
            });
            var graphSrc = {};
            graphSrc[jsonoa.constants.GRAPH]=resultArr;

            var graph = new jsonoa.core.Graph();
            graph.load(graphSrc, false).then(function(graph) {
                var annoList = graph.getAnnotations();
                if(criteria.targetIsAnno)
                    annoList = charme.logic.filterAnnoListByTarget(annoList, jsonoa.types.Annotation);
                
                var newResult = [];
                $.each(annoList, function(index, anno) {
                    anno = charme.logic.filterAnnoListByTarget([anno], jsonoa.types.Annotation);
                    anno = anno[0];
                    var id = anno.getValue(jsonoa.types.Common.ID);
                    
                    newResult.push({
                        id: id,
                        annotation: anno,
                        graph: graph
                    });
                });

                /*$.each(result.entries, function(index, value) {
                        var graphAnno = graph.getNode(value.id);
                        if (graphAnno)
                                value.annotation = graphAnno;
                });*/

                result.entries = newResult;
                resolver.fulfill(result);
            }, function(e) {
                resolver.reject(e);
            });
        }, function(jqXHR, textStatus, errorThrown) {    
                resolver.reject();
        });
    });
    return promise;
};

// Flags the annotation for review by moderator
charme.logic.flagAnnotation = function(annotationId, token) {
    var shortId = charme.logic.shortAnnoId(annotationId);
    
    var url = charme.logic.urls.flagRequest(shortId);
    return new Promise(function(resolver) {
        $.ajax(url, {
            dataType: 'xml',
            type: 'PUT',
            headers: {
                'Authorization': ' Bearer ' + token
            },
            contentType: 'text/html',
            data: ''//'No message (flagged via the CHARMe Plugin)'
                    // If this string is non-empty, the email to moderator will include an extra line, 'The following reason was 
                    // given:', followed by the string. We could potentially provide an input field to allow the user to give a reason, 
                    // but this shouldn't be necessary as if an annotation is inappropriate the reason should usually be obvious, and 
                    // also the email includes the user's email address in case the moderator does need clarification.
        }).then(function(result){
                resolver.fulfill(result);
            },
            function(error){
                resolver.reject(error);
            });
    });
};

/*
 * Deletes the given annotation by changing its state to 'retired'.
 * @param annotationId
 */
charme.logic.deleteAnnotation=function(annotationId, token){
	//return charme.logic.advanceState(annotationId, charme.logic.constants.STATE_DELETE, token)
	//return charme.logic.advanceState(annotationId, 'retired', token);

    var shortId = charme.logic.shortAnnoId(annotationId);

    var url = charme.logic.urls.deleteRequest(shortId);
    return new Promise(function(resolver) {
        $.ajax(url, {
            dataType: 'xml',
            type: 'DELETE',
            headers : {
                'Authorization' : ' Bearer ' + token
            },
            contentType: 'application/json'
        }).then(function(result){
                resolver.fulfill(result);
            },
            function(error){
                resolver.reject(error);
            });
    });
};

/*
 * Change the status of the given annotation. All transitions between states are allowed.
 *
 * Parameters:
 * 		annotationId: The annotation to modify
 * 		newState: The state to advance to
 * 		successCB: a callback to be invoked on successful completion.
 * 		errorCB: a callback to be invoked on error
 */
charme.logic.advanceState=function(annotationId, newState, token){
	var shortId = charme.logic.shortAnnoId(annotationId);

	var url = charme.logic.urls.stateRequest(newState);
	return new Promise(function(resolver) {
		$.ajax(url, {
			dataType: 'xml',
			type: 'POST',
			headers : {
				'Authorization' : ' Bearer ' + token
			},
			contentType: 'application/ld+json',
			data: JSON.stringify({annotation: annotationId, toState: newState})
		}).then(function(result){
			resolver.fulfill(result);
		},
		function(error){
			resolver.reject(error);
		});
	});
};

charme.logic.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;

        var later = function() {
            timeout = null;

            if(!immediate)
                func.apply(context, args);
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if(callNow)
            func.apply(context, args);
    };
};

// Given an array of annotations, filter out those that are themselves targets of other annotations in the array
charme.logic.filterAnnoListByTarget = function(annoList, annoType) {
    var composite, _annoTargets, _targetIds = [];
    var newAnnoList = [];
    
    for(var i = 0; i < annoList.length; i++) {
        composite = annoList[i].getValue(annoType.TARGET);
        if(composite.hasType(jsonoa.types.Composite.TYPE))
            _annoTargets = composite.getValues(jsonoa.types.Composite.ITEM);
        else
            _annoTargets = annoList[i].getValues(annoType.TARGET);

        angular.forEach(_annoTargets, function(target) {
            _targetIds.push(target.getValue(jsonoa.types.Common.ID));
        });
    }

    var annoId, pushFlag;
    for(var i = 0; i < annoList.length; i++) {
        pushFlag = true;
        annoId = annoList[i].getValue(jsonoa.types.Common.ID);
        for(var j = 0; j < _targetIds.length; j++) {
            if(annoId === _targetIds[j])
                pushFlag = false;
        }

        if(pushFlag)
            newAnnoList.push(annoList[i]);
    }

    return(newAnnoList);
};


// Given the latest version of an annotation that has been modified, trace back through the graph's revision history 
// to obtain the IDs of all the previous versions
charme.logic.fetchAnnoPreviousVersionIds = function(graph, anno, annoId, annoType) {
    var versionIds = [annoId];
    var modificationOf;
    
    var promise = new Promise(function(resolver) {
        var searchChain = function(graph, anno, annoId, annoType) {
            var reachedStartOfInnerChainFlag = false;
            var needAnotherSearchFlag = false;

            while(!reachedStartOfInnerChainFlag) {
                modificationOf = anno.getValue(annoType.WAS_REVISION_OF);
                if(modificationOf !== undefined) {
                    annoId = modificationOf.getValue(jsonoa.types.Common.ID);
                    versionIds.push(annoId);

                    anno = graph.getNode(annoId);
                    if(anno === undefined) {
                        reachedStartOfInnerChainFlag = true;
                        needAnotherSearchFlag = true;
                    }
                }
                else
                    reachedStartOfInnerChainFlag = true;
            }
            
            if(needAnotherSearchFlag) {
                charme.logic.fetchAnnotation(annoId).then(function(newGraph) {
                    var newAnno = newGraph.getNode(annoId);
                    searchChain(newGraph, newAnno, annoId, annoType);
                }, function(error) {
                    resolver.reject(error);
                });
            }
            else
                resolver.fulfill(versionIds);
        };
        
        searchChain(graph, anno, annoId, annoType);
    });

    return promise;
};


// Given an ID that points to an out-of-date version of a modified annotation, step through the graph's revision 
// history to obtain the ID corresponding to the latest version
charme.logic.fetchAnnoLatestVersionId = function(graph, anno, annoType, activityType) {
    var versionId, annoId;
    var invalidatedBy;
    
    var promise = new Promise(function(resolver) {
        var searchChain = function(graph, anno, annoType, activityType) {
            var reachedEndOfInnerChainFlag = false;
            var needAnotherSearchFlag = false;

            while(!reachedEndOfInnerChainFlag) {
                invalidatedBy = anno.getValue(annoType.WAS_INVALIDATED_BY);
                if(invalidatedBy !== undefined) {
                    versionId = invalidatedBy.getValue(activityType.GENERATED);
                    if(versionId !== undefined) {
                        versionId = annoId = versionId.getValue(jsonoa.types.Common.ID);
                        anno = graph.getNode(versionId);
                        if(anno === undefined) {
                            reachedEndOfInnerChainFlag = true;
                            needAnotherSearchFlag = true;
                        }
                    }
                }
                else
                    reachedEndOfInnerChainFlag = true;
            }
            
            if(needAnotherSearchFlag) {
                charme.logic.fetchAnnotation(annoId).then(function(newGraph) {
                    var newAnno = newGraph.getNode(annoId);
                    searchChain(newGraph, newAnno, annoType, activityType);
                }, function(error) {
                    resolver.reject(error);
                });
            }
            else
                resolver.fulfill([versionId, anno]);
        };
        
        searchChain(graph, anno, annoType, activityType);
    });

    return promise;
};


charme.logic.modelEdited = function(annoModel, annoModelPristine) {
    var editedFlag = false;
    if(annoModelPristine)
    {
        //Check to see if the model has chages is dine in two stages.
        //In stage one we just check the cardinality of various items and if they are different, then we know something has changed and return true.
        //Otherwise in the next stage we compare individual items and at the first detection of a difference in an element we break and return true.

        //check item counts
        if((annoModelPristine.comment !== annoModel.comment) ||
            ((annoModelPristine.linkType !== annoModel.linkType) || (annoModelPristine.linkURI !== annoModel.linkURI)) ||
            (annoModelPristine.domain.length !== annoModel.domain.length) ||
            (annoModelPristine.motivation.length !== annoModel.motivation.length) ||
            (annoModelPristine.targets.length !== annoModel.targets.length))
        {
            editedFlag = true;
        }

        if(!editedFlag)
        {   //Check if the set of motivations match exactly
            var modelMotivationValues = [];
            var pristineMotivationValues = [];
            var len = annoModel.motivation.length;
            var plen = annoModelPristine.length;

            for(var i = 0; i < len; i++) {
                modelMotivationValues.push(annoModel.motivation[i].value);
            }
            for(var i = 0; i < len; i++) {
                pristineMotivationValues.push(annoModelPristine.motivation[i].value);
            }
            
            for(var i=0; i<len; i++ )
            {
                if(!charme.logic.isInArray(pristineMotivationValues, modelMotivationValues[i]))
                {
                    editedFlag = true;
                    break;
                }
            }
        }

        if(!editedFlag)
        {   //Check if the set of domains match exactly
            var modelDomainValues = [];
            var pristineDomainValues = [];
            var len = annoModel.domain.length;
            var plen = annoModelPristine.domain.length;
            
            for(var i = 0; i < len; i++) {
                modelDomainValues.push(annoModel.domain[i].value);
            }
            for(var i = 0; i < len; i++) {
                pristineDomainValues.push(annoModelPristine.domain[i].value);
            }
            
            for(var i=0; i<len; i++ )
            {
                if(!charme.logic.isInArray(pristineDomainValues, modelDomainValues[i]))
                {
                    editedFlag = true;
                    break;
                }
            }
        }

        if(!editedFlag)
        {   //Check if the set of targets match exactly
            var modelTargetIds = [];
            var pristineTargetIds = [];
            var len = annoModel.targets.length;
            var plen = annoModelPristine.targets.length;

            for(var i=0; i<len; i++ )
            {
                modelTargetIds.push(annoModel.targets[i].id);
            }

            for(var j=0; j<plen; j++ )
            {
                pristineTargetIds.push(annoModelPristine.targets[j].id);
            }

            for(var i=0; i<len; i++ )
            {
                if(!charme.logic.isInArray(pristineTargetIds, modelTargetIds[i]))
                {
                    editedFlag = true;
                    break;
                }
            }
        }

    }

    return(editedFlag);

};


charme.logic.isInArray = function(array, searchTerm)
{
    return (array.indexOf(searchTerm) >= 0) ? true : false;
};

