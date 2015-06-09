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

charme.xml={};

charme.xml.evaluate = function(xml, nsResolver, xmlEval){
	var xmlDoc;
	if (typeof xml === 'string'){
        if(typeof XPathResult !== 'undefined')
        { 
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(xml, "text/xml");
        }
        else // Internet Explorer
        {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(xml); 
			xmlDoc.setProperty('SelectionLanguage', 'XPath');
			var ns = nsResolver;
			xmlDoc.setProperty('SelectionNamespaces', 'xmlns:atm="' + ns('atm') + '" xmlns:os="' + ns('os') + '" xmlns="' + ns('atm') + '"');
        }
	} else 
		xmlDoc = xml;
	if (typeof xmlEval==='undefined'){
		xmlEval = xmlDoc;
	}
	return new charme.xml.wrapDoc(xmlDoc, xmlEval, nsResolver);
};

charme.xml.wrapDoc = function(xmlDoc, xmlEval, nsResolver){
	this.asString = function(xpath){
		if(typeof XPathResult !== 'undefined'){
			return xmlEval.evaluate(xpath, xmlDoc, nsResolver, XPathResult.STRING_TYPE, null).stringValue;	
		} else {
			return xmlDoc.selectSingleNode(xpath).text;
		}
	};
	this.asNumber = function(xpath){
		if(typeof XPathResult !== 'undefined'){
			return xmlEval.evaluate(xpath, xmlDoc, nsResolver, XPathResult.NUMBER_TYPE, null).numberValue;
		} else {
			return parseInt(xmlDoc.selectSingleNode(xpath).text);
		}
	};
	/**
	 * This function will return a list of complex objects. The second parameter defines the type of 
	 * objects returned in the list. A coercible type is simple any user defined type that knows how to populate itself if passed an XML node.
	 */
	this.asComplexList = function(xpath, coercibleType){
		var resultList = [];
		var resultDoc;
		if(typeof XPathResult !== 'undefined'){
			resultDoc = xmlEval.evaluate(xpath, xmlDoc, nsResolver, XPathResult.ANY_TYPE, null);
			var nextNode = null;
			while((nextNode = resultDoc.iterateNext())){
				var atomDoc = charme.xml.evaluate(nextNode, charme.atom.nsResolver, xmlDoc);
				resultList.push(new coercibleType(atomDoc));
			}
		} else {
			resultDoc = xmlEval.selectNodes(xpath);
			for (var i=0; i < resultDoc.length; i++){
				var atomDoc = charme.xml.evaluate(resultDoc[i], charme.atom.nsResolver, xmlDoc);
				resultList.push(new coercibleType(atomDoc));
			}
		}
		return resultList;
	};
};