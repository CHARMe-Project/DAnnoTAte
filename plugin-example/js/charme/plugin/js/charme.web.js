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

var charme;
charme.web={};
charme.web.constants = {
    CHARME_TK: 'CHARME_AT',
    PARAM_TARGET_TYPES: 'dataType',
    PARAM_CITING_TYPES: 'citingType',
    //PARAM_BODY_TYPES: 'bodyType',
    PARAM_MOTIVATIONS: 'motivations',
    PARAM_DOMAINS: 'domains',
    PARAM_ORGANIZATION: 'organization',
    PARAM_CREATOR: 'userName',
	UNKNOWN_TYPE: 'Unknown'

};

charme.web._closeListeners = [];
charme.web._minimiseListeners = [];
charme.web._maximiseListeners = [];

//charme.web._dsSelectionListeners = [];
//charme.web._dsDeselectionListeners = [];

/**
 * Register CHARMe app, and define its modular dependencies
 */
charme.web.app=angular.module('charmePlugin', [
	'ngRoute',
    'charmeControllers'
]);

/**
 * Define routing to the different pages in the app
 */
charme.web.app.config(['$routeProvider',
    function($routeProvider){
            $routeProvider.when('/:targetId/init', {
                    templateUrl: 'templates/init.html',
                    controller: 'InitCtrl'
            }).when('/:targetId/annotations/new/', {
                    templateUrl: 'templates/editannotation.html',
                    controller: 'EditAnnotationCtrl'
			}).when('/:targetId/annotations/:annotationId/edit/', {
				templateUrl: 'templates/editannotation.html',
				controller: 'EditAnnotationCtrl'
            }).when('/:targetId/annotations/', {
                    templateUrl: 'templates/listannotations.html',
                    controller: 'ListAnnotationsCtrl',
                    reloadOnSearch: false
            }).when('/:targetId/annotation/:annotationId/', {
                    templateUrl: 'templates/viewannotation.html',
                    controller: 'ViewAnnotationCtrl',
                    reloadOnSearch: false
            });
    }
]);

charme.web.close = function(isOneTarget, targetId){
	angular.forEach(charme.web._closeListeners, function(closeFunc, key){
		closeFunc(isOneTarget, targetId);
	});
};

charme.web.removeCloseListener = function (closeFunc){
	charme.web._closeListeners.splice(charme.web._closeListeners.indexOf(closeFunc),1);
};

charme.web.addCloseListener = function (closeFunc){
	charme.web._closeListeners.push(closeFunc);
};

charme.web.postMessageProxy = function(msgStr, originStr){
	var injector = angular.element(document).injector();
	var loginService = injector.get('loginService');
	loginService._loginEvent({data: msgStr, origin: originStr});
};

charme.web.minimise = function(topOffset){
    angular.forEach(charme.web._minimiseListeners, function(minimiseFunc, key){
        minimiseFunc(topOffset);
    });
};

charme.web.maximise = function(){
    angular.forEach(charme.web._maximiseListeners, function(maximiseFunc, key){
        maximiseFunc();
    });
};

charme.web.removeMinimiseListener = function (minimiseFunc){
    charme.web._minimiseListeners.splice(charme.web._minimiseListeners.indexOf(minimiseFunc),1);
};

charme.web.addMinimiseListener = function (minimiseFunc){
    charme.web._minimiseListeners.push(minimiseFunc);
};

charme.web.removeMaximiseListener = function (maximiseFunc){
    charme.web._maximiseListeners.splice(charme.web._maximiseListeners.indexOf(maximiseFunc),1);
};

charme.web.addMaximiseListener = function (maximiseFunc){
    charme.web._maximiseListeners.push(maximiseFunc);
};
