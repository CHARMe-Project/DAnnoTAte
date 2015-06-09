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
if (!charme) {
	var charme = {};
}

//Define an object that will provide scope for charme-specific functions and fields
charme.plugin = {};

// Number of markup tags
charme.plugin.numTags = 0;

// Number of selected targets
charme.plugin.numSelected = 0;

//Map to hold selected target names as keys and the target hrefs as corresponding values
charme.plugin.selectedTargets = {};

charme.plugin.constants = (function constants() {
	constants.XPATH_BASE = '//atm:feed';
	constants.XPATH_TOTAL_RESULTS = constants.XPATH_BASE + '/os:totalResults';
	constants.MATCH_EXACT = 0;
	constants.MATCH_PARTIAL = 1;
	//this.XPATH_TOTAL_RESULTS	= '//os:totalResults';
	return constants;
})();

// GUI open/closed
charme.plugin.isOpenFlag = false;

/**
 * An XML document namespace resolver. This is required for processing the atom feed
 * @param prefix
 * @returns {*|null}
 */
charme.plugin.nsResolver = function (prefix) {
	var ns = {
		'atm': 'http://www.w3.org/2005/Atom',
		'os': 'http://a9.com/-/spec/opensearch/1.1/'
	};
	return ns[prefix] || null;
};

/**
 * Execute an xpath query on a given XML document
 * @param xpath An xpath query
 * @param xmlDoc An xml document
 * @param type A type specifier that will attempt to be used to coerce the returned data into the requested format. Types are defined on the builtin XPathResult object.
 * @returns A value of the type specified by the type parameter
 */
charme.plugin.xpathQuery = function (xpath, xmlDoc, type) {
	var xmlEval = xmlDoc;

	if (charme.common.isIE11orLess) {
		xmlEval.setProperty('SelectionLanguage', 'XPath');
		var ns = charme.plugin.nsResolver;
		xmlEval.setProperty('SelectionNamespaces',
				'xmlns:atm="' + ns('atm') + '" xmlns:os="' + ns('os') + '" xmlns="' + ns('atm') +
				'"');
		return xmlEval.selectSingleNode(xpath);
	}
	/**
	 * In some non ie browsers, XML is required to be evaluated from the HTML document
	 */
	if (typeof xmlEval.evaluate === 'undefined') {
		xmlEval = document;
	}
	//Other browsers
	var resultObj = xmlEval.evaluate(xpath, xmlDoc, charme.plugin.nsResolver,
		type ? type : XPathResult.ANY_TYPE, null);
	var resultVal = null;
	switch (type) {
		case XPathResult.NUMBER_TYPE:
			resultVal = resultObj.numberValue;
			break;
		case XPathResult.STRING_TYPE:
			resultVal = resultObj.stringValue;
			break;
		case XPathResult.BOOLEAN_TYPE:
			resultVal = resultObj.booleanValue;
			break;
		default:
			resultVal = resultObj;
			break;
	}
	return resultVal;
};

charme.plugin.request = {};

/**
 * Generate a request URL to fetch annotations for target
 * @param targetId
 * @returns {String}
 */
charme.plugin.request.fetchForTarget = function (targetId) {
    
        targetId = targetId === charme.common.ALL_TARGETS ? '' : targetId;
    
	return (charme.settings.REMOTE_BASE_URL.match(/\/$/) ? charme.settings.REMOTE_BASE_URL :
		charme.plugin.constants.REMOTE_BASE_URL + '/') + 'search/atom?target=' +
		encodeURIComponent(targetId) + '&status=submitted';
};

/**
 * A function that abstracts the browser-specific code necessary to process an XML document. Document is processed synchronously
 * @param xmlString
 * @returns {*}
 */
charme.plugin.parseXML = function (xmlString) {
	var xmlDoc;
	//Unfortunately, Internet explorer support for XPath is difficult. Need to force the response type, but only for IE.
	//SHOULD use feature detection, but in this case it needs to apply to all IE versions, and does not relate to a specific feature that can be easily detected (the response type needs to be set because the feature in question even exists to be detected)
	if (charme.common.isIE11orLess) {
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.loadXML(xmlString);
	} else {
		var parser = new DOMParser();
		xmlDoc = parser.parseFromString(xmlString, "text/xml");
	}

	return xmlDoc;
};

/**
 * Send a new AJAX request. Not using any framework to avoid creating external dependencies on integrators.
 * @param url
 * @param successCB
 * @param errorCB
 */
charme.plugin.ajax = function (url, successCB, errorCB) {
	var oReq;
	var successFunc = function(resp) {
		if(resp.target.status === 200) {
                    try {
                        var xmlDoc = charme.plugin.parseXML(oReq.responseText);
                        successCB.call(oReq, xmlDoc);
                    } catch(err) {
                        errorCB.call(oReq);
                    }
		}
                else
                    errorCB.call(oReq);
	};
	var errorFunc = function() {
		errorCB.call(oReq);
	};

	if(window.XMLHttpRequest) {
            oReq = new XMLHttpRequest();
            oReq.addEventListener("load", successFunc, false);
            oReq.addEventListener("error", errorFunc, false);
            oReq.open('GET', url, true);
	}

	//Unfortunately, Internet explorer support for XPath is difficult. Need to force the response type, but only for IE.
	//SHOULD use feature detection, but in this case it needs to apply to all IE versions, and does not relate to a specific feature that can be easily detected (the response type needs to be set because the feature in question even exists to be detected)
	if (charme.common.isIE11orLess) {
		//Internet Explorer, so set 'responseType' attribute in order to receive MS XML object. This is an unfortunate hack required to support xPath in a vaguely cross-browser manner
		oReq.responseType = 'msxml-document';
	} else {
		oReq.setRequestHeader('Accept', "application/atom+xml,application/xml");
	}
	oReq.send();
};

/**
 * Fetches the number of annotations that are defined against the given target
 * @param el
 * @param activeImgSrc
 * @param inactiveImgSrc
 */
charme.plugin.getAnnotationCountForTarget = function (el, activeImgSrc, inactiveImgSrc, noconnectionImgSrc, reloadImgSrc) {
    
	charme.plugin.ajax(charme.plugin.request.fetchForTarget(el.href), function (xmlDoc) {
		// Success callback
		var constants = charme.plugin.constants;
		var annoCount = 0;
		if (typeof XPathResult !== 'undefined') {
			annoCount = charme.plugin.xpathQuery(constants.XPATH_TOTAL_RESULTS, xmlDoc,
				XPathResult.NUMBER_TYPE);
		} else {
			//Internet explorer
			annoCount = charme.plugin.xpathQuery(constants.XPATH_TOTAL_RESULTS, xmlDoc
				/*,XPathResult.ANY_TYPE*/);
			if (typeof annoCount === 'object' && annoCount.text) {
				annoCount = parseInt(annoCount.text);
			}
		}
		if (annoCount > 0) {
			el.title = 'CHARMe annotations exist';
			el.style.background = 'url("' + activeImgSrc + '") no-repeat left top';
		} else {
			el.title = 'No CHARMe annotations';
			el.style.background = 'url("' + inactiveImgSrc + '") no-repeat left top';
		}
                
        var reloadTarget = document.getElementById('reload' + el.href);
        if(reloadTarget)
            reloadTarget.parentNode.removeChild(reloadTarget);
    
        // Show the annotation count next to the CHARMe icon - use the className 'charme-count' to hide the count in CSS file if desired
        var showCount = charme.plugin.getByClass('charme-count', charme.plugin.constants.MATCH_EXACT, el.parentNode);
        if(showCount.length > 0)
            showCount = showCount[0];
        else {
            showCount = document.createElement('span');
            showCount.className = 'charme-count';
            el.parentNode.insertBefore(showCount, el.nextSibling);
        }
        showCount.innerHTML = ' (' + annoCount + ')';

        charme.common.addEvent(el, 'click', charme.plugin.showPlugin);
	}, function () {
		el.title = 'CHARMe Plugin - Unable to fetch annotation data';
		el.style.background = 'url("' + noconnectionImgSrc + '") no-repeat left top';
                charme.common.addEvent(el, 'click', charme.plugin.alertError);
                
                var reloadTarget = document.getElementById('reload' + el.href);
                if(reloadTarget)
                    reloadTarget.parentNode.removeChild(reloadTarget);
                
                reloadTarget = document.createElement('img');
                reloadTarget.src = reloadImgSrc;
                reloadTarget.style.width = '18px';
                reloadTarget.style.height = '18px';
                reloadTarget.style.paddingLeft = '4px';
                reloadTarget.title = 'Reload annotations';
                reloadTarget.id = 'reload' + el.href;
                reloadTarget.className = 'charme-reload-icon';
                el.parentNode.insertBefore(reloadTarget, el.nextSibling);

                // Clear the showCount element
                var showCount = charme.plugin.getByClass('charme-count', charme.plugin.constants.MATCH_EXACT, el.parentNode);
                if(showCount.length > 0)
                    showCount[0].innerHTML = '';

                charme.common.addEvent(reloadTarget, 'click', function(e) {
                    var reloadTarget = document.getElementById('reload' + el.href);
                    reloadTarget.src = charme.settings.path + '/plugin/img/ajaxspinner.gif';
                    charme.common.removeEvent(el, 'click', charme.plugin.alertError);
                    charme.plugin.getAnnotationCountForTarget(el, activeImgSrc, inactiveImgSrc, noconnectionImgSrc, reloadImgSrc);
                });

		if (window.console) {
			window.console.error('CHARMe Plugin - Unable to fetch annotation data');
		} else {
			throw 'CHARMe Plugin - Unable to fetch annotation data';
		}
	});
};

charme.plugin.alertError = function(e) {
    alert('CHARMe Plugin - Unable to fetch annotation data');
    charme.plugin.stopBubble(e);
};

/**
 * Adds a click event to a passed in checkbox element
 * @param targetCheckbox
 */
charme.plugin.setSelectionEventOnTarget = function (checkbox, boxType) {
	if(boxType === 'all')
		charme.common.addEvent(checkbox, 'click', charme.plugin.setWholeTargetList);
	if(boxType === 'target')
		charme.common.addEvent(checkbox, 'click', charme.plugin.refreshSelectedTargetList);
};

// Select/unselect all targets
charme.plugin.setWholeTargetList = function(checkbox) {
	var els = charme.plugin.getByClass('charme-select', charme.plugin.constants.MATCH_EXACT);
	for(var i = 0 ; i < els.length; i++) {
            if(els[i].id !== charme.common.ALL_TARGETS) {
		els[i].checked = !checkbox.target.checked;
		els[i].click();
            }
	}
};

/**
 * Defines the function that executes when a checkbox on a target is clicked.
 * The event ensures that the charme.plugin.selectedTargets map is kept up-to-date
 * @param targetCheckbox
 */
charme.plugin.refreshSelectedTargetList = function(targetCheckbox) {
    var targetHref = targetCheckbox.target.id;

    var targetName = targetHref;//.substring(targetHref.lastIndexOf('/') + 1);
    var targetTypeLabel = targetCheckbox.target.name;
    //var targetTypeDesc = targetTypeLabel.replace(/-/g, " ");
    //targetTypeLabel = targetTypeLabel.replace(/-/g, "");
    
    var targetTypeDesc = targetTypeLabel.split('-');
    var tempArr = [];
    for(var i = 0; i < targetTypeDesc.length; i++) {
        var descFrag = targetTypeDesc[i];
        descFrag = descFrag[0].toUpperCase() + descFrag.substr(1).toLowerCase();
        tempArr.push(descFrag);
    }
    targetTypeLabel = tempArr.join('');
    targetTypeDesc = tempArr.join(' ');

    if(targetCheckbox.target.checked) {
        if(!(targetHref in charme.plugin.selectedTargets)) {
            // Add the target to the list
            if(targetHref === charme.common.ALL_TARGETS) {
                charme.plugin.selectedTargets[targetHref] = {
                    name: 'All Targets',
                    label: 'Alltypes',
                    desc: 'All types'
                };
            }
            else {
                charme.plugin.selectedTargets[targetHref] = {
                    name: targetName,
                    label: targetTypeLabel,
                    desc: targetTypeDesc
                };
                charme.plugin.numSelected++;
            }
        }
    }
    else {
        if(targetHref in charme.plugin.selectedTargets) {
            // Remove the target from the list
            delete charme.plugin.selectedTargets[targetHref];
            
            if(targetHref !== charme.common.ALL_TARGETS)
                charme.plugin.numSelected--;
        }
    }
    
    var showNumSelected = document.getElementById('showNumSelected');
    showNumSelected.innerHTML = charme.plugin.numSelected;
    
    var plugin = document.getElementById('charme-plugin-frame').contentWindow;
    plugin.postMessage('targetListChanged', '*');
};

charme.plugin.getSelectedTargets = function() {
    return charme.plugin.selectedTargets;
};

/**
 * Cross browser class selector. Defined in order to avoid add external dependencies on libraries such as JQuery.
 */
charme.plugin.getByClass = function (className, searchType, rootElement) {
	rootElement = rootElement || document;
	//Default to native function if it exists, and your search is exact (not partial)
	if(document.getElementsByClassName && searchType === charme.plugin.constants.MATCH_EXACT) {
		return rootElement.getElementsByClassName(className);
	} else {
		//Else, search exhaustively
		var elArray = [], regex;
		var tmp = rootElement.getElementsByTagName("*");

		if(searchType === charme.plugin.constants.MATCH_EXACT)
			regex = new RegExp("(^|\\s)" + className + "(\\s|$)");
		else if(searchType === charme.plugin.constants.MATCH_PARTIAL)
			regex = new RegExp(className);

		for(var i = 0; i < tmp.length; i++) {
			if(regex.test(tmp[i].className)) {
				elArray.push(tmp[i]);
			}
		}

		return elArray;
	}
};

//Function to trigger the rescan on a data provider's page
charme.plugin.rescanPage = function () {
    charme.plugin.markupTags(false, true);
}

/**
 * This function is used to create and refresh charme plugin entry points on the data provider screens.
 *
 * @param isFirstLoad
 * @param isRescan
 * @param targetId
 *
 * DESCRIPTION
 * -----------
 *
 * There are broadly three paths of execution through this function
 *
 * 1) Firstly, this function is invoked at first page load. In this case..
 *        -  The plugin elements, checkboxes etc are created and placed on the dataprovider's page
 *        -  Each plugin placeholders is initially set to the "scanning" mode ( spinning icons )
 *        -  for every target, the annotation count is fetched and the appropiate plugin icon is displayed.
 *
 *        This path is activated only when the function is invoked with "isFirstLoad" set to true
 *        e.g : charme.plugin.markupTags(true);
 *
 * 2) Secondly, this function is used to update the annotation count of a particular target id. In this case..
 *        -  Only the passed in target id's annotation count is refreshed
 *
 *         This path is activated only when function is invoked with "targetId" defined to a valid id of a target on the page
 *         e.g :  charme.plugin.markupTags(false, false, targetId);
 *
 * 3) Finally, this function can be invoked to rescan for updates on all targets on an ad-hoc basic. In this case..
 *        -  All current targets are rescanned for annotations
 *        -  If a new target (i.e latest additions since first page load ) is found, plugin placeholder/checkbox is created for it
 *        -  for every target, the annotation count is re-fetched.
 *        -  All existing checkbox selections are cleared
 *
 *         This path is activated only when function is invoked with  "isFirstLoad" set false and "isRescan" set to true
 *         e.g charme.plugin.markupTags(false, true);
 */

// Find CHARMe icon insertion points / refresh icon insertion point for specified targetId
charme.plugin.markupTags = function (isFirstLoad, isRescan, targetId) {
    var activeImage = new Image();
    activeImage.src = charme.settings.path + '/activebuttonsmall.png';
    var inactiveImage = new Image();
    inactiveImage.src = charme.settings.path + '/inactivebuttonsmall.png';
    var noConnectionImage = new Image();
    noConnectionImage.src = charme.settings.path + '/noconnectionbuttonsmall.png';
    var reScanImage = new Image();
    reScanImage.src = charme.settings.path + '/plugin/img/ajaxspinner.gif';
    var loadImage = new Image();
    loadImage.src = charme.settings.path + '/plugin/img/ajaxspinner.gif';
    var reloadImage = new Image();
    reloadImage.src = charme.settings.path + '/reloadbuttonsmall.png';
    
    if(isFirstLoad) {
        var selectAllContainer = document.getElementById('charme-placeholder');
        var selectAllBox = document.createElement('input');
        selectAllBox.type = 'checkbox';
        selectAllContainer.parentNode.insertBefore(selectAllBox, selectAllContainer);
        charme.plugin.setSelectionEventOnTarget(selectAllBox, 'all');

        var text = document.createElement('span');
        text.id='charme-select-all';
        text.innerHTML = charme.settings.SELECT_ALL_INNERHTML; //'Select/unselect all';
        selectAllContainer.parentNode.insertBefore(text, selectAllContainer);

        var selectCountText = document.createElement('span');
        selectCountText.id='charme-select-count';
        selectCountText.innerHTML = '';
        selectAllContainer.parentNode.insertBefore(selectCountText, selectAllContainer);
        
        var allTargetsContainer = document.getElementById('charme-placeholder-all-targets');
        var anchor = document.createElement('a');
        anchor.href = charme.common.ALL_TARGETS;
        anchor.className = 'charme-all-types';
        allTargetsContainer.appendChild(anchor, allTargetsContainer);
        
        text = document.createElement('span');
        text.id = 'charme-all-targets';
        text.innerHTML = charme.settings.ALL_TARGETS_INNERHTML; //'All targets ';
        allTargetsContainer.insertBefore(text, anchor);
    }
    
    var els = charme.plugin.getByClass('charme-', charme.plugin.constants.MATCH_PARTIAL);

    if(isRescan) {
        //Initially set all charme icon placeholders to "scanning" display
        for(var i = 0; i < els.length; i++) {
                    if(els[i].href) {
                charme.plugin.setRescanIconForTarget(els[i], reScanImage.src);
            }
        }
    }

    for(var i = 0; i < els.length; i++) {
        if(els[i].href) {
            if(isFirstLoad || isRescan || els[i].href === targetId || els[i].href === charme.common.ALL_TARGETS) {
                if(els[i].href === targetId || els[i].href === charme.common.ALL_TARGETS) {
                    els[i].style.background = 'url("' + loadImage.src + '") no-repeat left top';
                    els[i].style.backgroundSize = '18px 18px';
                }
                
                charme.plugin.getAnnotationCountForTarget(els[i], activeImage.src, inactiveImage.src, noConnectionImage.src, reloadImage.src);
            }

            if(isFirstLoad || isRescan) {
                els[i].style.display = 'inline-block';
                els[i].style.width = '36px';
                els[i].style.height = '26px';

                els[i].style.background = 'url("' + loadImage.src + '") no-repeat left top';
                els[i].style.backgroundSize = '18px 18px';
                els[i].style.backgroundPosition = '2px';
                els[i].style.marginLeft = '10px';
                els[i].style.marginRight = '-5px';

                // Insert checkboxes and attach selection events
                //if(els[i].href !== charme.common.ALL_TARGETS) {
                    //Create a checkbox only if its already not preset on this target.
                    if(charme.plugin.checkboxAbsent(els[i].href)) {
                        var targetCheckbox = document.createElement('input');
                        targetCheckbox.type = 'checkbox';
                        targetCheckbox.className = 'charme-select';
                        targetCheckbox.id = els[i].href;
                        targetCheckbox.name = charme.plugin.extractTargetType(els[i].className);
                        els[i].parentNode.insertBefore(targetCheckbox, els[i]);
                        charme.plugin.setSelectionEventOnTarget(targetCheckbox, 'target');
                        
                        if(els[i].href !== charme.common.ALL_TARGETS)
                            charme.plugin.numTags++;
                    }
                //}
            }
        }
    }

    //If this function is executing a rescan, clear all selected targets and and un-click all checkboxes
    if(isRescan) {

        //check why this doesnot work later : - http://stackoverflow.com/questions/1232040/empty-an-array-in-javascript
        //while(charme.plugin.selectedTargets.length > 0) {
        //    charme.plugin.selectedTargets.pop();
        //}

        charme.plugin.selectedTargets = {};
        charme.plugin.numSelected = 0;

        var targetCheckboxs = charme.plugin.getByClass('charme-select', charme.plugin.constants.MATCH_EXACT);
        for (var i = 0; i < targetCheckboxs.length; i++) {
            targetCheckboxs[i].checked = false;
        }
    }

    if(charme.settings.SHOW_SELECT_COUNT) {
        var selectCountText = document.getElementById('charme-select-count');
        selectCountText.innerHTML = ' (<span id="showNumSelected">' + charme.plugin.numSelected + '</span> of ' + charme.plugin.numTags + ' targets selected)';
    }
};

/**
 * This function searches for a named element of checkbox type, and if absent, returns true.
 * @param cbId
 */
charme.plugin.checkboxAbsent = function(cbId) {
    var cbElement =  document.getElementById(cbId);
    if (typeof(cbElement) != 'undefined' && cbElement != null && cbElement.type == 'checkbox')
    {
        return false;
    }
    else
    {
        return true;
    }
};

/**
 * Fetches the number of annotations that are defined against the given target
 * @param el
 * @param rescanImgSrc
 */
charme.plugin.setRescanIconForTarget = function (el, rescanImgSrc) {
    el.title = 'CHARMe annotations exist';
    el.style.background = 'url("' + rescanImgSrc + '") no-repeat left top';

    var showCount = charme.plugin.getByClass('charme-count', charme.plugin.constants.MATCH_EXACT, el.parentNode);
    if(showCount.length > 0)
        showCount = showCount[0];
    else {
        showCount = document.createElement('span');
        showCount.className = 'charme-count';
        el.parentNode.insertBefore(showCount, el.nextSibling);
    }
};


charme.plugin.extractTargetType = function(className) {
	var targetType = className.substring('charme-'.length);
	if(targetType.length > 0)
		return(targetType);
	else
		return('Type undefined');
};

/* ============================================================================================  */
/**
 * Function to capture messages fromm the Plugin Iframe
 */

function listenMessage(msg) {
	var _msg= msg.data;
	var n = _msg.lastIndexOf(':::');
	var targetId = _msg.substring(n + 3);

	charme.plugin.markupTags(false, false, targetId);
}

if (window.addEventListener) {
	window.addEventListener("message", listenMessage, false);
} else {
	window.attachEvent("onmessage", listenMessage);
}

/* ============================================================================================  */

/**
 * Creates the iFrame in which the plugin will be hosted. Should only be called once
 */
charme.plugin.loadPlugin = function () {
    /* Use an iframe to completely isolate plugin from javascript and css on the main site */
    
    // Don't use createElement here, because in IE11 you won't be able to use input fields (weird bug)
    //var plugin = document.createElement('iframe');
    //document.lastChild.appendChild(plugin);
    
    var plugin = document.getElementById('charme-placeholder');
    plugin.innerHTML += '<iframe id="charme-iframe" name="charme-iframe"></iframe>';
    plugin = plugin.lastChild;

    plugin.frameBorder = "no";
    plugin.id = 'charme-plugin-frame';
    plugin.style.backgroundColor = 'transparent';
    //plugin.style.minWidth = '1260px';
    plugin.style.display = 'none';
    plugin.style.margin = 'auto';
    plugin.style.position = 'fixed';
    plugin.style.left = '0';
    plugin.style.right = '0';
    plugin.style.bottom = '0';
    plugin.style.top = '0';
    //plugin.style.paddingTop = '50px';
    //plugin.style.paddingLeft = '25px';
    plugin.style.height = '100%';
    plugin.style.zIndex = 1000;
    plugin.allowTransparency = true;
    plugin.setAttribute('scrolling', 'no');

    plugin.style.paddingTop = '50px';
    plugin.style.paddingLeft = '25px';
    plugin.style.paddingRight = '25px';

    if(top.window.innerWidth <= charme.common.SMALL_WINDOW)
        plugin.style.width = plugin.style.minWidth = charme.common.SMALL_WIDTH + 'px';
    else if(top.window.innerWidth >= charme.common.LARGE_WINDOW)
        plugin.style.minWidth = charme.common.LARGE_WIDTH + 'px';
    else
        plugin.style.minWidth = top.window.innerWidth + 'px';
};

/**
 * A callback function used for hiding the plugin. Because the iFrame that the plugin is held in is created outside of the plugin itself (within the scope of the hosted environment), it must also be hidden from this scope. Using a callback avoids the plugin having to know anything about its hosted environment.
 */
charme.plugin.closeFunc = function (isOneTarget, targetId) {
	var plugin = document.getElementById('charme-plugin-frame');
	plugin.contentWindow.location.href = 'about:blank';
        charme.plugin.maximiseFunc(); // In case GUI was closed while minimised
	plugin.style.display = 'none';

        if(isOneTarget) {
            var targetCheckboxs = charme.plugin.getByClass('charme-select', charme.plugin.constants.MATCH_EXACT);
            targetCheckboxs[targetId].click();
        }

        charme.plugin.isOpenFlag = false;
        sessionStorage.isOpenFlag = 'no';
};

charme.plugin.minimiseFunc = function(topOffset) {
    var plugin = document.getElementById('charme-plugin-frame');
    plugin.style.margin = '0';
    plugin.style.height = '74px';
    plugin.style.width = plugin.style.minWidth = '450px';
    plugin.style.top = topOffset + 'px';
    if(parseInt(plugin.style.left) < 0) {
        var _plugin = document.getElementById('charme-placeholder').lastChild;
        plugin.style.left = '-' + _plugin.style.paddingLeft;
    }
};

charme.plugin.maximiseFunc = function() {
    var plugin = document.getElementById('charme-plugin-frame');
    plugin.style.height = '100%';

    if(window.innerWidth <= charme.common.SMALL_WINDOW) {
        plugin.style.minWidth = '1262px';
    }
    else {
        plugin.style.minWidth = '1368px';
        plugin.style.paddingTop = '50px';
        plugin.style.paddingLeft = '25px';
    }
};

/**
 * Registers the close and minimise function listeners with the plugin itself. The close buttons exist within the plugin, so the event will be fired from there.
 */
charme.plugin.loadFunc = function () {

	//Close listeners
	//this.contentWindow.charme.web.removeCloseListener(charme.plugin.closeFunc);
	this.contentWindow.charme.web.addCloseListener(charme.plugin.closeFunc);

	//Minimise & Maximise listeners
	//this.contentWindow.charme.web.removeMinimiseListener(charme.plugin.minimiseFunc);
	this.contentWindow.charme.web.addMinimiseListener(charme.plugin.minimiseFunc);

	//this.contentWindow.charme.web.removeMaximiseListener(charme.plugin.maximiseFunc);
	this.contentWindow.charme.web.addMaximiseListener(charme.plugin.maximiseFunc);

	charme.common.removeEvent(this, 'load', charme.plugin.loadFunc); // Remove the loadfunc. Only want it to load once
};

charme.plugin.stopBubble = function(e){
    /*
     * Prevent default behaviour for anchor onclick (ie following the link)
     */
    if (e && e.stopPropagation) { // Non-IE browsers
            e.preventDefault(); // Prevent default behaviour, but NOT BUBBLING - This is an important distinction, 
            // we don't want to prevent events firing further up the chain as this might interfere with data provider's site.
    } else { // IE versions <= 8
            if (window.event) {
                    window.event.returnValue = false; // Prevent default behaviour, but NOT BUBBLING
            }
            if (e) {
                    e.returnValue = false;
            }
    }
};
/**
 * Renders the plugin visible
 * @param e event object. This is used
 */
charme.plugin.showPlugin = function (e) {
        charme.plugin.stopBubble(e);

        if(charme.plugin.isOpenFlag)
            return;

	var plugin = document.getElementById('charme-plugin-frame');
	charme.common.addEvent(plugin, 'load', charme.plugin.loadFunc);
        
        //charme.plugin.stopBubble(e);
	var targetHref = '', targetType = '';
	if (typeof e.target === 'undefined') {
		targetHref = e.srcElement.href;
                //targetType = charme.plugin.extractTargetType(e.srcElement.className);
	} else {
		targetHref = e.target.href;
                //targetType = charme.plugin.extractTargetType(e.target.className);
	}
        
        // If data provider allows the plugin GUI to be dragged, insert script (first removing it if already present) and set 
        // option to allow dragging off screen. We remove the script first as dragiframe.js has no clear/removeHandle() method.
        var dragScript = document.getElementById("dragiframeScript");
        if(dragScript)
            dragScript.parentNode.removeChild(dragScript);
        
        var _plugin = document.getElementById('charme-placeholder');
        if(_plugin.className === 'charme-draggable') {
            dragScript = document.createElement('script');
            dragScript.id = 'dragiframeScript';
            dragScript.type = 'text/javascript';
            dragScript.src = scriptPath + '/plugin/js/vendor/dragiframe.js';
            document.getElementsByTagName('body')[0].appendChild(dragScript);

            if(dragScript.readyState) {
                dragScript.onreadystatechange = function () {
                    if (dragScript.readyState === "loaded" || dragScript.readyState === "complete") {
                        dragScript.onreadystatechange = null;
                        (function() {return dragIF_allowDragOffScreen(true);}());
                    }
                };
            }
            else
                dragScript.onload = function() {return dragIF_allowDragOffScreen(true);};
        }

        function _showPlugin() {
            charme.common.removeEvent(plugin, 'load', _showPlugin);
            plugin.style.display = 'block'; // Only show the iFrame once the content has loaded in order to minimize flicker
	}
	charme.common.addEvent(plugin, 'load', _showPlugin);
	plugin.contentWindow.location.href = charme.settings.path + '/plugin/plugin.html#/' +
            encodeURIComponent(encodeURIComponent(targetHref)) + '/init';
        
        charme.plugin.isOpenFlag = true;
        sessionStorage.isOpenFlag = 'yes';

    if (!(targetHref in charme.plugin.selectedTargets)) {
        var targetCheckboxs = charme.plugin.getByClass('charme-select', charme.plugin.constants.MATCH_EXACT);
        targetCheckboxs[targetHref].click();
    }
};

var scriptPath;
charme.plugin.preInit = function () {
    // If user opens plugin, then visits another page without closing plugin, then returns to page, the 
    // plugin window will have disappeared, and clicking the CHARMe icons will not bring it back, so we must 
    // force the page to reload. If the plugin was closed, no reload is necessary upon returning to the page.
    if(sessionStorage.isOpenFlag === 'yes') {
        sessionStorage.isOpenFlag = 'no';
        location.reload();
    }
    
	/**
	 * This is duplicated (unfortunately) from charme.common.js. The code below should not be used anywhere else.
	 */
	var scripts = document.getElementsByTagName('script');
	scriptPath = scripts[scripts.length - 1].src;//The last loaded script will be this one
	if (!/charme\.js$/.test(scriptPath)) {
		if (typeof console !== 'undefined' && console.error) {
			console.error('Unable to initialise CHARMe plugin. Error determining script path');
		}
		return;
	}
	scriptPath = scriptPath.substring(0, scriptPath.lastIndexOf('/'));

	/**
	 * Include other required source files
	 */
	var loadSettings = function () {
		var settingsScript = document.createElement('script');
		settingsScript.type = 'text/javascript';
		settingsScript.src = scriptPath + '/charme.settings.js';

                if(settingsScript.readyState) {
                    settingsScript.onreadystatechange = function () {
                        if (settingsScript.readyState === "loaded" || settingsScript.readyState === "complete") {
                            settingsScript.onreadystatechange = null;
                            charme.plugin.init();
                        }
                    };
                }
                else
                    settingsScript.onload = charme.plugin.init;
                
		document.getElementsByTagName('body')[0].appendChild(settingsScript);
                
                /*// If data provider allows the plugin GUI to be dragged, insert script and set option to allow dragging off screen
                var plugin = document.getElementById('charme-placeholder');
                if(plugin.className === 'charme-draggable') {
                    var dragScript = document.createElement('script');
                    dragScript.type = 'text/javascript';
                    dragScript.src = scriptPath + '/plugin/js/vendor/dragiframe.js';
                    document.getElementsByTagName('body')[0].appendChild(dragScript);

                    if(dragScript.readyState) {
                        dragScript.onreadystatechange = function () {
                            if (dragScript.readyState === "loaded" || dragScript.readyState === "complete") {
                                dragScript.onreadystatechange = null;
                                (function() {return dragIF_allowDragOffScreen(true);}());
                            }
                        };
                    }
                    else
                        dragScript.onload = function() {return dragIF_allowDragOffScreen(true);};
                }*/
	};

	var loadCommon = function () {
		var commonScript = document.createElement('script');
		commonScript.type = 'text/javascript';
		commonScript.src = scriptPath + '/charme.common.js';
                
                if(commonScript.readyState) {
                    commonScript.onreadystatechange = function () {
                        if (commonScript.readyState === "loaded" || commonScript.readyState === "complete") {
                            commonScript.onreadystatechange = null;
                            loadSettings();
                        }
                    };
                }
                else
                    commonScript.onload = loadSettings;
                
		document.getElementsByTagName('body')[0].appendChild(commonScript);
	};

	loadCommon();
};

/**
 * Will execute on window load (most init code should go in here)
 */
charme.plugin.init = function () {
	charme.plugin.markupTags(true);
	charme.plugin.loadPlugin();
};

charme.plugin.preInit();

// master
