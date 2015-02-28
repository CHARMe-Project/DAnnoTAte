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

charme.web.services = angular.module('charmeServices', []);

charme.web.services.factory('persistence', function(){ 
	var persistService = {};
	persistService.persist = function(key, val){
		$.jStorage.set(key, val);
	};
	persistService.retrieve = function(key){
		var promise = new Promise(function(resolver){
			var val = $.jStorage.get(key);
			if (val){
				resolver.fulfill(val);
			} else {
				resolver.reject(val);
			}
		});
		return promise;
	};
	persistService.clear = function(){
		$.jStorage.flush();
	};
	return persistService;
});

charme.web.services.factory('loginService', ['persistence', function(persistence){
	var loginService = {};
	loginService._loginListeners = [];
	loginService._logoutListeners = [];
	loginService._auth = null;
	
	/**
	 * Load stored credentials (if any)
	 */
	loginService._loadState=function(){
            persistence.retrieve(charme.web.constants.CHARME_TK).then(function(auth) {
                if(auth.expiry && (new Date(auth.expiry) > new Date()))
                    loginService._doLogin(auth);
            });
	};
	
	loginService.setAuth=function(auth){
		loginService._auth = auth;
	};
	loginService.isLoggedIn=function(){
		return loginService._auth && !loginService.isExpired() ? true : false;
	};
	loginService.isExpired=function(){
		if (loginService._auth.expiry < new Date()){
			persistence.clear();
			return true;
		}
		return false;
	};
	loginService.getAuth=function(){
		return loginService._auth;
	};
	
	loginService.fetchUserDetails=function(authToken){
		return charme.logic.fetchUserDetails(authToken.token);
	};
	
	loginService._doLogin=function(authData){
		if (authData.expiry){
			authData.expiry = new Date(authData.expiry);
		}
		if (authData.token){
			loginService.setAuth(authData);
		}
		loginService.fetchUserDetails(authData).then(function(userDetails){
			loginService.getAuth().user = userDetails;
			angular.forEach(loginService._loginListeners, function(value, key){
				value(loginService.getAuth());
			});
		}, function(error){
			loginService.logout();
		});
	};
        
        loginService.handshake = function(evt) {
            if(evt.origin === window.location.protocol + '//' + window.location.host && evt.data) {
                if(evt.data === 'charme-handshake-request') {
                    window.removeEventListener('message', loginService.handshake, false);
                    window.addEventListener('message', loginService._loginEvent, false);
                    
                    var msgStr = 'charme-handshake-established';
                    if (charme.common.isIE11orLess)
                        evt.source.charme.web.postMessageProxy(msgStr, evt.origin);
                    else // Else use HTML5 standard method
                        evt.source.postMessage(msgStr, evt.origin);
                }
                else {
                    console.error('Bad message received:');
                    console.error(evt);
                }
            }
            else {
                console.error('Bad message received:');
                console.error(evt);
                }
        };
	
	loginService._loginEvent = function(evt) {
            if(evt.origin === window.location.protocol + '//' + window.location.host && evt.data) {
                var msg = JSON.parse(evt.data);
                if(!msg.hasOwnProperty('token') || !msg.hasOwnProperty('expiry')) {
                    console.error('Bad message received:');
                    console.error(msg);
                    return;
                }
                
                if(msg.error)
                    console.error(msg.error);

                try {
                    persistence.persist(charme.web.constants.CHARME_TK, msg);
                }
                catch(e) {
                    if(console) {
                        console.log('Unable to persist user credentials');
                        console.log(e);
                    }
                }
                
                loginService._doLogin(msg);
		}
                else {
                    console.error('Bad message received:');
                    console.error(evt);
                }
	};
	
	loginService._logoutEvent = function(){
		angular.forEach(loginService._logoutListeners, function(value, key){
			value();
		});
		persistence.clear();
	};
	
	loginService.logout=function(){
		loginService._auth = null;
		loginService._logoutEvent();
	};
	
	/**
	 * Function to allow objects to register for login events
	 */
	loginService.addLoginListener=function(listener){
		loginService._loginListeners.push(listener);
	};

	/**
	 * Function to allow objects to register for login events
	 */
	loginService.addLogoutListener=function(listener){
		loginService._logoutListeners.push(listener);
	};
	
	return loginService;
}]);

/**
 * Register charme.logic methods as service methods
 */
charme.web.services.factory('fetchAnnotationsForTarget', function(){
        return charme.logic.fetchAnnotationsForTarget;
});

charme.web.services.factory('fetchAnnotation', function(){
        return charme.logic.fetchAnnotation;
});

/**
 * A general service with a number of functions relating to annotations. Existing annotation services should be migrated into this one service and exposed as API functions
 */
charme.web.services.factory('annotationService', function(){
	var api = {};

	/**
	 * Given an annotation object, populate a 'simple' annotation object. This will essentially be a DTO
	 * There are a number of places where, for example, we are populating scope variables from a jsonoa.types.Annotation graph node.
	 * This could be simplified by introducing a simplified annotation object. This is often referred to as a 'domain transfer object'.
	 * The simplified annotation could be simply set on the scope as is, or used for populating scope variables. It removes the need to use more verbose jsonoa.js methods for accessing annotation values.
	 * @param anno
	 * @param scope
	 */
	api.createSimpleAnnotationObject = function(annoGraphNode){
		var anno = {
			id: '',
			comment: '',
			commentId: '',
			targets: [],
			motivation: [],
			modificationOf: '',
			author: '',
                        organizationName: '',
			date: '',
			domain: [],
			linkType: '',
			linkURI: '',
                        isCitation: false,
                        linkIsDOI: false
		};
		//If no anno graph provided, just return a new simple anno object.
		if (typeof annoGraphNode === 'undefined'){
			return anno;
		}

		var annoSpec = jsonoa.types.Annotation;
		var textSpec = jsonoa.types.Text;
		var targets = [];
		var targetAttr = annoGraphNode.getValues(annoSpec.TARGET);

		if (targetAttr.length > 0){
			if (targetAttr[0].hasType && targetAttr[0].hasType(jsonoa.types.Composite.TYPE)) {
				//Is composite type, so take only element in array (which will be the composite itself).
				targets = targetAttr[0].getValues(jsonoa.types.Composite.ITEM);
			} else {
				targets = targetAttr;
			}
		}

		var bodies = annoGraphNode.getValues(annoSpec.BODY);
		var motivations = annoGraphNode.getValues(annoSpec.MOTIVATED_BY);

		var annoId = annoGraphNode.getValue(jsonoa.types.Common.ID);
		anno.id = annoId;

		var authors = annoGraphNode.getValues(annoSpec.ANNOTATED_BY);
		angular.forEach(authors, function(author){
			if (author.hasType(jsonoa.types.Person.TYPE)) {
                            anno.author = author.getValue(jsonoa.types.Person.GIVEN_NAME) + ' ' +
					  author.getValue(jsonoa.types.Person.FAMILY_NAME);
                            anno.email = author.getValue(jsonoa.types.Person.EMAIL);
			}
                        else if(author.hasType(jsonoa.types.Organization.TYPE)){
                            anno.organizationName = author.getValue(jsonoa.types.Organization.NAME);
                        }
		});
                
		var annoDate = annoGraphNode.getValue(annoSpec.DATE);
		anno.date = annoDate[jsonoa.types.Common.VALUE];

		var modificationOf = annoGraphNode.getValue(annoSpec.WAS_REVISION_OF);
		if (typeof modificationOf !== 'undefined'){
			anno.modificationOf = modificationOf.getValue(jsonoa.types.Common.ID);
		}
                
                if(annoGraphNode.hasType(jsonoa.types.CitationAct.TYPE)) {
                    anno.isCitation = true;
                    var linkURI = annoGraphNode.getValue(jsonoa.types.CitationAct.CITING_ENTITY).getValue(jsonoa.types.Common.ID);
                    anno.linkURI = linkURI;
                    anno.linkType = annoGraphNode.getValue(jsonoa.types.CitationAct.CITING_ENTITY).getValue(jsonoa.types.Common.TYPE);
                    
                    // If the URI is a doi
                    if(linkURI.search(charme.logic.constants.DXDOI_URL) === 0) {
                        // Trim off 'http://dx.doi.org/' from URL, then insert 'doi' so that URL still passes validity test
                        anno.linkURI = 'doi:' + linkURI.substring(charme.logic.constants.DXDOI_URL.length, linkURI.length);
                        anno.linkIsDOI = true;
                    }
                }

		angular.forEach(bodies, function(body) {
                    if(body.hasType) {
                        if(body.hasType(textSpec.TEXT) || body.hasType(textSpec.CONTENT_AS_TEXT)) {
                            anno.comment = body.getValue(textSpec.CONTENT_CHARS);
                            anno.commentId = body.getValue(jsonoa.types.Common.ID);
                        } else if(body.hasType(jsonoa.types.SemanticTag.TYPE)) {
                            anno.domain.push({value: body.getValue(jsonoa.types.Common.ID)});
                        } else {
                            var linkURI = body.getValue(jsonoa.types.Common.ID);
                            anno.linkURI = linkURI;
                            anno.linkType = body.getValue(jsonoa.types.Common.TYPE);
                            
                            // If the URI is a doi
                            if(linkURI.search(charme.logic.constants.DXDOI_URL) === 0) {
                                // Trim off 'http://dx.doi.org/' from URL, then insert 'doi' so that URL still passes validity test
                                anno.linkURI = 'doi:' + linkURI.substring(charme.logic.constants.DXDOI_URL.length, linkURI.length);
                                anno.linkIsDOI = true;
                            }
                        }
                    }
		});

		angular.forEach(targets, function(target){
			var targetDescriptor = {
				id: target.getValue(jsonoa.types.Common.ID),
				typeId: target.getValue(jsonoa.types.Common.TYPE)
				//type description etc. should go here.
			};
			anno.targets.push(targetDescriptor);
		});

		angular.forEach(motivations, function (motivation){
			var motivationURI =  motivation.getValue(motivation.ID);
			anno.motivation.push(
				{
					value: motivationURI
				});
		});
		return anno;
	};
	return api;
});

charme.web.services.factory('searchAnnotations', function(){
	var searchService = {};
	searchService.listenerTypes = {
		SUCCESS: 'SUCCESS',
		ERROR: 'ERROR',
		BEFORE_SEARCH: 'BEFORE_SEARCH',
		AFTER_SEARCH: 'AFTER_SEARCH'
	};
	var annoSpec = jsonoa.types.Annotation;
	searchService.listeners = {};
        
	searchService.addListener = function (type, listener){
		if (typeof searchService.listeners[type] === 'undefined'){
			searchService.listeners[type] = [];
		}    
            searchService.listeners[type].push(listener);
	};

	searchService.removeListener = function(type, listener){
		if (typeof searchService.listeners[type] !== 'undefined'){
			var index = searchService.listeners[type].indexOf(listener);
			if (index > -1){
				searchService.listeners[type].splice(index, 1);
			}
		}
	};
        
    searchService.clearListeners = function() {
        searchService.listeners = {};
    };

	searchService.tellListeners = function (type, data1, data2, data3, data4, data5, data6, data7){
		angular.forEach(searchService.listeners[type], function(listener){
			if (typeof data1 !== 'undefined' || 
                            typeof data2 !== 'undefined' || 
                            typeof data3 !== 'undefined' ||
                            typeof data4 !== 'undefined' ||
                            typeof data5 !== 'undefined' ||
                            typeof data6 !== 'undefined' ||
                            typeof data7 !== 'undefined') {
				listener(data1, data2, data3, data4, data5, data6, data7);
			} else {
				listener();
			}
		});
	};

	searchService.searchAnnotations = function(criteria, searchCallId){
		searchService.tellListeners(searchService.listenerTypes.BEFORE_SEARCH, searchCallId);
		charme.logic.searchAnnotations(criteria).then(
			function(feed){
				var results = [];
				//Prepare the model for the view
				angular.forEach(feed.entries, function(value, key){
					var anno = value.annotation;
                                        var graph = value.graph;
					var title = charme.logic.shortAnnoTitle(anno);
					var person = anno.getValues(annoSpec.ANNOTATED_BY);
					var author = '';
					var userName = '';
                                        var email = '';
					var organizationName = '';
                                        var organizationUri = '';

					var date = anno.getValue(annoSpec.DATE);
					date = (date !== undefined && date.hasOwnProperty('@value')) ? date['@value'] : 'undefined';

					angular.forEach(person, function(detail){
                        var personType = jsonoa.types.Person; //Alias the Person type locally so that we don't need to use fully qualified path to reference constants
                        var organizationType = jsonoa.types.Organization;
                        if (detail.hasType(personType.TYPE)){
                                author = detail.getValue(personType.GIVEN_NAME) + ' ' + detail.getValue(personType.FAMILY_NAME);
                                userName = detail.getValue(personType.USER_NAME);
                                email = detail.getValue(personType.EMAIL);
                        } else if (detail.hasType(organizationType.TYPE)){
                                organizationName = detail.getValue(organizationType.NAME);
                                organizationUri = detail.getValue(organizationType.URI);
                        }
					});
                                        
                                        var modificationOf = anno.getValue(jsonoa.types.Annotation.WAS_REVISION_OF);
                                        var isModified = typeof modificationOf !== 'undefined' ? true : false;

                                        var targets;
                                        var composite = anno.getValue(jsonoa.types.Annotation.TARGET);
                                        if (composite.hasType(jsonoa.types.Composite.TYPE))
                                            targets = composite.getValues(jsonoa.types.Composite.ITEM);
                                        else
                                            targets = anno.getValues(jsonoa.types.Annotation.TARGET);
                                        
                                        var targetIds = [];
                                        angular.forEach(targets, function(target) {
                                            targetIds.push(target.getValue(jsonoa.types.Common.ID));
                                        });
                                        
					results.push(
						{
                                                    'id': value.id,
						    'title': title,
						    'author': author,
                                                    'userName': userName,
                                                    'email': email,
                                                    'organizationName': organizationName,
                                                    'organizationUri': organizationUri,
                                                    'date': date,
                                                    'isModified': isModified,
                                                    //'targets': criteria.targets
                                                    'targets': targetIds,
                                                    'graph': graph,
                                                    'anno': anno
						}
					);
				});

                                results.sort(function(a, b) {return (Date.parse(b.date) - Date.parse(a.date));});
                                
                                // This (results.length > criteria.resultsPerPage) can happen in certain cases - for example:
                                // There is an annotation 'Blah', and a reply, 'Reply to Blah'. I launch the plugin for all 
                                // targets, expecting a list of the 10 most recent annotations, but instead I see 11 - 'Reply 
                                // to Blah' is the 10th most-recent annotation, but 'Blah' is also shown (instead of only 
                                // being visible on the next page of results). This is because 'Reply to Blah' contains a copy 
                                // of 'Blah', and the jsonoa.js function getAnnotations() 'extracts' this copy, returning 11 
                                // annotations instead of 10. (This is understandable, but here's where it gets weird: say 
                                // 'Reply to Blah' was only the 5th most-recent annotation, and so 'Blah' *should* be 
                                // included in the list. You might think that then, 'Blah' would be included twice, once 
                                // properly, and once for the extracted copy. But instead it's still only included once, which 
                                // of course is what we want.) The only way to deal with this issue is the following code:
                                if(results.length > criteria.resultsPerPage) {
                                    results.length = criteria.resultsPerPage;
                                }

				var pages = [];
                                var lastPage = Math.ceil(feed.totalResults / criteria.resultsPerPage);
				for(var i = 1; i <= lastPage; i++) {
                                    if(i === criteria.pageNum)
                                        pages.push({status: 'current'});
                                    else if((criteria.pageNum <= Math.ceil(charme.logic.constants.NUM_PAGE_BUTTONS / 2) && i <= charme.logic.constants.NUM_PAGE_BUTTONS) || 
                                            (criteria.pageNum >= lastPage - Math.floor(charme.logic.constants.NUM_PAGE_BUTTONS / 2) && i >= lastPage - charme.logic.constants.NUM_PAGE_BUTTONS + 1) ||
                                            Math.abs(i - criteria.pageNum) <= Math.floor(charme.logic.constants.NUM_PAGE_BUTTONS / 2))
                                        pages.push({status: 'notCurrent'});
				}
                                
                                var targetIsAnno = criteria.targetIsAnno || false;
                                
				searchService.tellListeners(searchService.listenerTypes.SUCCESS, searchCallId, results, pages, criteria.pageNum, lastPage, feed.totalResults, targetIsAnno);
				searchService.tellListeners(searchService.listenerTypes.AFTER_SEARCH, searchCallId);
			},
			function(error){
				searchService.tellListeners(searchService.listenerTypes.ERROR, searchCallId, 'Error: ' + error);
				searchService.tellListeners(searchService.listenerTypes.AFTER_SEARCH, searchCallId);
			}
		, function(error){
				searchService.tellListeners(searchService.listenerTypes.ERROR, searchCallId, 'Error: ' + error);
				searchService.tellListeners(searchService.listenerTypes.AFTER_SEARCH, searchCallId);
		});
	};

	return searchService;
});

charme.web.services.factory('flagAnnotation', function() {
	return charme.logic.flagAnnotation;
});

charme.web.services.factory('deleteAnnotation', function(){
	return charme.logic.deleteAnnotation;
});

/**
 * Saves the provided annotation model. A 'pristine' version of the model may optionally be provided for the case of updates, where comparisons are required to see whether anything has changed.
 */
charme.web.services.factory('saveAnnotation', function () {
    return function(targetId, targetMap, auth, annoModel, annoModelPristine){

       var promise = new Promise(function(resolver) {
         //If the save is on a new annotation then pristine model is undefined.
         //If the save is on a modification, then pristine model is defined. Check to see if the annoModel is dirty before saving
         if((!annoModelPristine) || (annoModelPristine && charme.logic.modelEdited(annoModel, annoModelPristine)))
         {
            //alert("Model edited. Saving...");

            var annoSpec = jsonoa.types.Annotation;
            var graph = new jsonoa.core.Graph();
            var anno;
            if (annoModel.id) {
                anno = graph.createNode({type: jsonoa.types.Annotation, id: annoModel.id});
            } else {
                anno = graph.createNode({type: jsonoa.types.Annotation, id: charme.logic.constants.ATN_ID_PREFIX +
                    'annoID'});
            }
            var bodyId = charme.logic.constants.BODY_ID_PREFIX + 'bodyID';
            var commentId = bodyId;
            var compositeSpec = jsonoa.types.Composite;

            /**
             * If this is an update (a 'pristine' model was provided), check if comments have changed. If they have not, DO NOT include a body node, just a reference to the existing node.
             */
            if (annoModelPristine && annoModelPristine.comment === annoModel.comment) {
                anno.setValue(jsonoa.types.Annotation.BODY, graph.createStub(annoModelPristine.commentId));
            } else if (annoModel.comment) {
                var comment = graph.createNode({type: jsonoa.types.Text, id: commentId});
                comment.setValue(jsonoa.types.Text.CONTENT_CHARS, annoModel.comment);
                anno.addValue(annoSpec.BODY, comment);
            }
            if (annoModel.linkType) {
                var type = jsonoa.util.templateFromType(annoModel.linkType);
                if (typeof type !== 'function') {
                    resolver.reject('Invalid selection ' + annoModel.linkType);
                }
                if (annoModel.linkURI) {
                    var linkURI = encodeURI(annoModel.linkURI);
                    var doiVal = charme.logic.findDOI(linkURI);
                    
                    // Create a fully qualified canonical URI for the DOI
                    if(doiVal)
                        linkURI = charme.logic.constants.DXDOI_URL + doiVal;

                    if(annoModel.isCitation)
                    {
                        //Auto-generating IDs at the moment on client side, which shouldn't happen. The Node must take responsibility for this, but no method is available yet for multiple bodies
                        var citoId = charme.logic.generateId();

                        /*
                         * Create a citation act for the body.
                         */
                        var citoType = jsonoa.types.CitationAct;

                        //Create node for link uri, with typing information
                        var uriLink = graph.createNode({type: type, id: linkURI});

                        //Add the "citationAct type" to annotation
                        anno.addValue('@type', citoType.TYPE);
                        anno.setValue(citoType.CITED_ENTITY, graph.createStub(targetId));
                        anno.setValue(citoType.CITING_ENTITY, graph.createStub(linkURI));

                    }// else {

                    // Always add the link to the graph body, even if it's a citation (if it's a citation, then we're 
                    // adding it twice: once in a citation act, and once in the body). This is so that the faceted search 
                    // can look at all attached links, including citation acts.
                    var linkBody = graph.createNode({type: type, id: linkURI});
                    anno.addValue(annoSpec.BODY, linkBody);
                    
                    //}

                    /*
                     * Check if the annotation model already has a 'linking' type defined (selected manually by user, or on existing annotation). If it does not, add it.
                     */
                    var linkingType = "http://www.w3.org/ns/oa#linking";
                    var matchLink = false;
                    //Automatically add the "Linking" Motivation
                    angular.forEach(annoModel.motivation, function (existingMotivation) {
                        if (existingMotivation.value === linkingType) {
                            matchLink = true;
                        }
                    });
                    if (!matchLink) {
                        //Add it to the model, will be picked up later and added to annotation graph.
                        annoModel.motivation.push({value: linkingType});
                    }
                } else {
                    resolver.reject('No URI entered');
                }
            }
            
            if(annoModel.isReply) {
                // Check if the annotation model already has a 'replying' motivation (selected 
                // manually by user, or on existing annotation). If it doesn't, add it.
                var replyingType = "http://www.w3.org/ns/oa#replying";
                var replyingMotivation = false;
                angular.forEach(annoModel.motivation, function(existingMotivation) {
                    if(existingMotivation.value === replyingType)
                        replyingMotivation = true;
                });
                if(!replyingMotivation)
                    annoModel.motivation.push({value: replyingType});
            }
            
            if (annoModel.domain.length > 0) {
                angular.forEach(annoModel.domain, function (domain) {
                    var tagId = domain.value;
                    var tag = graph.createNode({type: jsonoa.types.SemanticTag, id: tagId});
                    tag.setValue(jsonoa.types.SemanticTag.PREF_LABEL, domain.textLong);
                    anno.addValue(annoSpec.BODY, tag);
                });

                var taggingType = "http://www.w3.org/ns/oa#tagging";
                var matchTag = false;
                //Automatically add the "tagging" Motivation
                angular.forEach(annoModel.motivation, function (existingMotivation) {
                    if (existingMotivation.value === taggingType) {
                        matchTag = true;
                    }
                });
                if (!matchTag) {
                    //Add it to the model, will be picked up later and added to annotation graph.
                    annoModel.motivation.push({value: taggingType});
                }
            }

            if (annoModel.motivation) {
                angular.forEach(annoModel.motivation, function (motivation) {
                    //var tagId = charme.logic.generateId();
                    var page = graph.createStub(motivation.value);
                    //var tag = graph.createNode(jsonoa.types.SemanticTag, tagId);
                    //tag.setValue(tag.MOTIVATED_BY, page);
                    anno.addValue(annoSpec.MOTIVATED_BY, page);
                });
            }

            //If the number of targets exceeds one, then attach the collection as a oc:composite.
            //Else attach the target directly to the annotation

            //if(targetMap.length > 1)
            if (annoModel.targets.length > 1) {
                var composite = graph.createNode({type: jsonoa.types.Composite, id: charme.logic.constants.COMPOSITE_ID_PREFIX + 'targetID'});
                for (var i = 0; i < annoModel.targets.length; i++) {
                    var annoTarget = annoModel.targets[i];
                    if (typeof annoTarget.typeId === 'undefined') {
                        resolver.reject('Annotations may not be saved with unknown types');
                    }
                                        
                    var target;
                    if(annoTarget.typeId === jsonoa.types.Annotation.TYPE) {
                        target = graph.createStub(annoTarget.id);
                    }
                    else {
                        var annoTargetType = jsonoa.util.templateFromType(annoTarget.typeId);
                        target = graph.createNode({type: annoTargetType, id: annoTarget.id});
                    }
                    
                    composite.addValue(compositeSpec.ITEM, graph.createStub(annoTarget.id));
                }
                anno.setValue(annoSpec.TARGET, composite);
            } else if (annoModel.targets.length === 1) {
                var annoTarget = annoModel.targets[0];
                if (typeof annoTarget.typeId === 'undefined') {
                    resolver.reject('Annotations may not be saved with unknown types');
                }

                var target;
                if(annoTarget.typeId === jsonoa.types.Annotation.TYPE) {
                    target = graph.createStub(annoTarget.id);
                }
                else {
                    var annoTargetType = jsonoa.util.templateFromType(annoTarget.typeId);
                    target = graph.createNode({type: annoTargetType, id: annoTarget.id});
                }
                
                anno.setValue(annoSpec.TARGET, target);
            } else {
                resolver.reject('An annotation must have at least one target');
            }

            //insert or update?
            var saveUrl;
            if (!annoModel.id)
                saveUrl = charme.logic.urls.createRequest();
            else
                saveUrl = charme.logic.urls.updateRequest();

            charme.logic.saveGraph(graph, auth.token, saveUrl).then(
                function (data) {
                    resolver.fulfill(data);
                },
                function (error) {
                    console.error(error);
                    resolver.reject('Unable to save annotation');
                }
            );

        } // if model changed
        else
        {
             //alert("Model unchanged");
             resolver.fulfill();
        }

       });
    return promise;
	};
});

charme.web.services.factory('fetchKeywords', function(){
	var categories = [];//Only fetch once, and scope to session
	return function(annoModel, targetId){	
		var promise = new Promise(function(resolver){
			if (categories.length===0){
				charme.logic.fetchGCMDVocab(false).then(function(keywords){
					categories.push({
						name: 'GCMD',
						keywords: keywords
					});
					resolver.fulfill(categories);
				});
			} else {
				resolver.fulfill(categories);
			}
		}, function(error){
			resolver.reject(error);
		});
		return promise;
	};
});


charme.web.services.factory('fetchAllMotivations', function(){
    var categories = [];//Only fetch once, and scope to session
	return function () {
        var promise = new Promise(function(resolver){
            if (categories.length===0){
                charme.logic.fetchMotivationVocab().then(function(keywords){
                    categories.push({
                        name: 'OA Motivation',
                        keywords: keywords
                    });
                    resolver.fulfill(categories);
                });
            } else {
                resolver.fulfill(categories);
            }
        }, function(error){
            resolver.reject(error);
        });
        return promise;
    };
});

charme.web.services.factory('fetchTargetTypeVocab', function() {
    return function() {	
        var promise = new Promise(function(resolver) {
            charme.logic.fetchTargetTypeVocab().then(function(types) {
                resolver.fulfill(types);
            });
        }, function(error) {
            resolver.reject(error);
        });
        
        return promise;
    };
});

charme.web.services.factory('fetchAllSearchFacets', function(){
    /* return charme.logic.fetchAllSearchFacets(); */

    return function(criteria) {
	var promise = new Promise(function(resolver){
            charme.logic.fetchAllSearchFacets(criteria).then(function(facetTypes){
                resolver.fulfill(facetTypes);
            });
        }, function(error){
            resolver.reject(error);
        });

	return promise;
    };
});

/**
 * This service returns the list of selected targets.
 */
charme.web.services.factory('targetService', function() {
        return {
            targets: [], /* This array is initialised in the InitCtrl */
            listViewTarget: ''
        };
    }
);

charme.web.services.factory('searchBarService', function() {
        return {
            isSearchOpen: false,
            targetDropdownFlag: false
        };
    }
);

charme.web.services.factory('minimisedService', function() {
        return {
            isMinimised: false
        };
    }
);

charme.web.services.factory('shiftAnnoService', function() {
        var shiftAnnoService = {};
        shiftAnnoService.annoList = {};
        
        shiftAnnoService.getPosition = function(targetId, annoId) {
            if(shiftAnnoService.latestId[targetId])
                targetId = shiftAnnoService.latestId[targetId];
            
            if(shiftAnnoService.annoList[targetId]) {
                for(var i = 0; i < shiftAnnoService.annoList[targetId].length; i++) {
                    if(annoId === shiftAnnoService.annoList[targetId][i].id)
                        return i + 1;
                }
                return -1; // The annotation is not in the array (there are valid circumstances where this may be the case)
            }
            else
                return 1;
        };
        
        shiftAnnoService.getListLength = function(targetId) {
            if(shiftAnnoService.latestId[targetId])
                targetId = shiftAnnoService.latestId[targetId];
            
            if(shiftAnnoService.annoList[targetId])
                return shiftAnnoService.annoList[targetId].length;
            else
                return 1;
        };
    
        shiftAnnoService.getNewAnno = function(targetId, annoId, direction) {
            if(shiftAnnoService.annoList[targetId].hasLatestVersion)
                targetId = shiftAnnoService.annoList[targetId].hasLatestVersion;
            
            for(var i = 0; i < shiftAnnoService.annoList[targetId].length; i++) {
                if(shiftAnnoService.annoList[targetId][i].id === annoId) {
                    if(i + direction === -1)
                        return shiftAnnoService.annoList[targetId][shiftAnnoService.annoList[targetId].length - 1];
                    else if(i + direction === shiftAnnoService.annoList[targetId].length)
                        return shiftAnnoService.annoList[targetId][0];
                    else                    
                        return shiftAnnoService.annoList[targetId][i + direction];
                }
            }
        };
        
        shiftAnnoService.latestId = {};

        return shiftAnnoService;
    }
);

charme.web.services.factory('replyToAnnoService', function() {
        return {
            replying: false,
            comments: '',
            initialTarget: ''
        };
    }
);

charme.web.services.factory('fetchReplies', function() {
    return function(targetList) {
        return charme.logic.fetchReplies(targetList);
    };
});

charme.web.services.factory('prevIdsService', function() {
        var prevIdsService = {};
        prevIdsService.targetList = {};
        
        return prevIdsService;
});

charme.web.services.factory('latestIdService', function() {
        var latestIdService = {};
        latestIdService.targetList = {};
        
        return latestIdService;
});