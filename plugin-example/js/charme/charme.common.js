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

"use strict";

/**
 * A collection of utility functions that are reused in various charme scripts.
 */

if (typeof charme === 'undefined') {
	var charme = {};
}

charme.settings = {
	path: null
};

charme.common = {};

/**
	A variable that can be used to determine if the browser being used is IE11, or is IE with a
 version no. < 11
 */
charme.common.isIE11 = navigator.userAgent.indexOf(".NET CLR") > -1;      
charme.common.isIE11orLess = charme.common.isIE11 || navigator.appVersion.indexOf("MSIE") !== -1;

// Determining if browser is Chrome
charme.common.isChrome = !!window.chrome;

// We adjust the GUI width with window width
charme.common.SMALL_WINDOW = 1280;
charme.common.LARGE_WINDOW = 1366;
charme.common.SMALL_WIDTH = 1262;
charme.common.LARGE_WIDTH = 1368;

// Dummy URL for when we view annotations for all targets
charme.common.ALL_TARGETS = 'http://alltargets/';

// Length of target title in listView and targets tab (viewAnno, editAnno)
charme.common.shortTargetTitle = 75;
charme.common.longTargetTitle = 150;

// Length of link URI in viewAnno
charme.common.linkLength = 150;

// Max length of comment line when viewing annotation
charme.common.maxCommentLineLength = 146;

/**
 * Finds the path to the current script (for referencing images etc.) DO NOT INVOKE THIS FUNCTION
 * DIRECTLY
 */
charme.common._scriptPath = function(){
	var scripts = document.getElementsByTagName('script');
	var scriptPath = scripts[scripts.length-1].src;
	if (!/charme\..*\.js$/.test(scriptPath)){
		//FUNCTION SHOULD ONLY EVER BE INVOKED FROM THIS FILE, OTHERWISE RESULTS UNPREDICTABLE
		if (console && console.error){
			console.error('Unable to initialise CHARMe plugin. Error determining script path');
		}
		return;
	}
	scriptPath = scriptPath.substring(0, scriptPath.lastIndexOf('/'));
	charme.settings.path=scriptPath;
};

/**
 * Given a string, will tokenise based on the standard URL query string delimiters, and return a
 * map of key-value pairs
 * @param str The string to be parameterised
 * @returns {{}} a map of key-value pairs
 */
charme.common.parameterise = function(str){
	if (str === "") {
		return {};
	}

	var a = str.split('&');
	var b = {};
	for (var i = 0; i < a.length; ++i)
	{
		var p=a[i].split('=');
		if (p.length !== 2) {
			continue;
		}
		b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
	}
	return b;
};

/**
 * Parses parameters that are passed to this page as URL query string. Is executed automatically on
 * page load, and will return parameters in associative array with structure
 * ["paramName":"paramValue"]
 */
charme.common.params = 
	charme.common.parameterise(window.location.search.substr(1));

/**
 * A cross-browser method for adding an event to an element. Function is necessary to avoid
 * external dependency on external library
 * @param el The element that is to have the event attached
 * @param ev The event to listen for. Uses the standard event names specified in
 * https://developer.mozilla.org/en-US/docs/Web/Reference/Events
 * @param fn The function to be called when event is fired
 */
charme.common.addEvent = function(el, ev, fn){
	if (el.addEventListener){
		el.addEventListener(ev, fn, false);
	} else if (el.attachEvent){
		el.attachEvent("on" + ev, fn);
	}
	//Else do nothing
};
/**
 * Remove an existing event listener. See charme.common.addEvent
 */
charme.common.removeEvent = function(el, ev, fn){
	if (el.removeEventListener){
		el.removeEventListener(ev, fn, false);
	} else if (el.detachEvent){
		el.detachEvent("on" + ev, fn);
	}
	//Else do nothing.
};

/**
 * Function that will be executed automatically upon script include
 */
charme.common._scriptPath();