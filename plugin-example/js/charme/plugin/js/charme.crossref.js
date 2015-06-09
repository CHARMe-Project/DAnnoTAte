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

charme.crossref = {};

charme.crossref.constants = {
	XPATH_TITLE: '//title',
	XPATH_SUBTITLE: '//subtitle',
	XPATH_DOI:'//doi_data//doi',
	XPATH_AUTHORS: '//contributors/person_name',
	XPATH_AUTHOR_SNAME: 'surname',
	XPATH_AUTHOR_GNAME: 'given_name',
	XPATH_JOURNAL: '//journal//full_title',
	XPATH_VOLUME: '//journal_issue/issue',
	XPATH_ISSUE: '//journal_issue/journal_volume/volume',
	XPATH_YEAR: '//publication_date/year',
	XPATH_PUBLISHER: '//publisher_name',
	XPATH_PAGE_FIRST: '//journal/journal_article/pages/first_page',
	XPATH_PAGE_LAST: '//journal/journal_article/pages/last_page',

	CITE_CHICAGO_AUTH_1: '{surname}, {givenName}',
	CITE_CHICAGO_AUTH_OTHERS: '{authors[, {givenName} {surname}]}',
	CITE_CHICAGO_AUTH_LAST: ' and {givenName} {surname}',
	CITE_CHICAGO_FMT: ' "{title}"<em>{( )journal}</em>{( )volume}, {(no. )issue} ({publisher}{( )year}){(: )pages}'
};

/**
 * Parses an XML document (text or DOM object) and returns a javascript object with the following structure:
 *
 * charme.crossref.MetaData = {
 *    doi: '',
 *    title: '',
 *    authors: [{
 *			givenName: '',
 *			surname: ''
 *    }],
 * }
 */
charme.crossref.MetaData = function(xmlDoc) {
	this.journal='';
	this.volume='';
	this.doi='';
	this.title='';
	this.year='';
	this.issue='';
	this.pages='';
	this.publisher='';
	
	if (typeof xmlDoc === 'string'){
		xmlDoc = $.parseXML(xmlDoc);
	}
	var xmlEval = xmlDoc;
	if (typeof xmlEval.evaluate === 'undefined'){
		xmlEval = document;
	}
	//First, check that a DOI exists in the response
	var doiNode = xmlEval.evaluate(charme.crossref.constants.XPATH_DOI, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (doiNode === null){
		throw "The provided DOI did not match any records";
	}
	this.doi=$.trim(doiNode.textContent);
	this.title=$.trim(xmlEval.evaluate(charme.crossref.constants.XPATH_TITLE, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/\s\s*/, ' '));
	var subTitle = xmlEval.evaluate(charme.crossref.constants.XPATH_SUBTITLE, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (subTitle!==null){
		subTitle=$.trim(subTitle.textContent.replace(/\s\s*/, ' '));
		if (subTitle.length > 0){
			this.title+=': ' + subTitle;
		}
	}
	
	this.year=$.trim(xmlEval.evaluate(charme.crossref.constants.XPATH_YEAR, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/\s\s*/, ' '));

	/*
	 * Journal-specific fields 
	 */
	var journal = xmlEval.evaluate(charme.crossref.constants.XPATH_JOURNAL, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (journal!==null){
		this.journal=$.trim(journal.textContent.replace(/\s\s*/, ' '));
		this.volume=$.trim(xmlEval.evaluate(charme.crossref.constants.XPATH_VOLUME, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/\s\s*/, ' '));
		this.issue=$.trim(xmlEval.evaluate(charme.crossref.constants.XPATH_ISSUE, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext().textContent.replace(/\s\s*/, ' '));
	} else {
		var publisher = xmlEval.evaluate(charme.crossref.constants.XPATH_PUBLISHER, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext();
		if (publisher!==null){
			this.publisher = $.trim(publisher.textContent.replace(/\s\s*/, ' '));
		}
	}
	
	this.pages='';
	var startPage = xmlEval.evaluate(charme.crossref.constants.XPATH_PAGE_FIRST, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (startPage!==null){
		this.pages+=startPage.textContent.replace(/\s\s*/, ' ');
	}

	var endPage = xmlEval.evaluate(charme.crossref.constants.XPATH_PAGE_LAST, xmlDoc, null, XPathResult.ANY_TYPE, null).iterateNext();
	if (endPage!==null){
		this.pages+= '-' + endPage.textContent.replace(/\s\s*/, ' ');
	}

	this.authors=(function (){
		var authorData = [];
		var xmlAuthors = xmlEval.evaluate(charme.crossref.constants.XPATH_AUTHORS, xmlDoc, null, XPathResult.ANY_TYPE, null);
		var author = xmlAuthors.iterateNext();
		while(author){
			var a = {};
			a.givenName = xmlEval.evaluate(charme.crossref.constants.XPATH_AUTHOR_GNAME, author, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			a.surname = xmlEval.evaluate(charme.crossref.constants.XPATH_AUTHOR_SNAME, author, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
			authorData.push(a);
			author = xmlAuthors.iterateNext();
		}
		return authorData;
	})();
};

charme.crossref.chicagoStyle = function(metaData){
	var auths = metaData.authors;
	var fmtText = '';
	if (auths.length > 0){
		fmtText += charme.crossref.format(auths[0], charme.crossref.constants.CITE_CHICAGO_AUTH_1);
		if (auths.length > 1){
			if (auths.length > 2){
				fmtText += charme.crossref.format({'authors': auths.slice(1, -1)}, charme.crossref.constants.CITE_CHICAGO_AUTH_OTHERS);
			}
			fmtText += charme.crossref.format(auths[auths.length-1], charme.crossref.constants.CITE_CHICAGO_AUTH_LAST);
		}
	}

	fmtText+= charme.crossref.format(metaData, charme.crossref.constants.CITE_CHICAGO_FMT);
	return fmtText;
};

//'${authors[${surname}, ${name}]}'
/*
 * A formatter function that prints the values of the properties of an object in the specified format
 * The format string can be anything, where the value of a given property will be substitued for {propertyName}.
 * An array property can be specified with {propertyName[]}. Within the [] you can specify a subformat with the same formatting
 * rules, which will be applied to the properties on each of the array elements. Additionally, a sequence may be defined following an array substitution
 * that will be substituted after each array element EXCEPT the last one. Using {propertyName[]}(substitution)
 * eg.
 * var fmt = '{field1}, {field2}, {arrField[{prop1}, {prop2}](; )}, {field2} {field3}';
 * var obj = {
		field1: 'Value of field 1',
		field2: 'Value of field 2',
		field3: 'Value of field 3',
		something: 'Something',
		arrField: [{prop1:'Arr1 Prop 1', prop2:'Arr1 Prop2', arrProp:[{rProp1:'Value of rProp1', rProp2:'Value of rProp2'}]}, {prop1:'Arr2 Prop 1', prop2:'Arr2 Prop2'}]
	};
 * Current limitations:
 *    - Can not handle complex object types, except as array elements
 *    - Will not substitute a property multiple times
 *    - Will only handle array substitutions 1 level deep.
 */
charme.crossref.format = function(metaData, style){
	var text=style;
	var regex, regexArr;
	$.each(metaData, function(key, val){
		if ($.isArray(val)){
			regex = new RegExp('\\{' + key + '\\[([^\\[\\]]*)\\](\\(([^\\(\\)]*)\\))?\\}');
			if (!regex.test(style)){
				return;
			}
			regexArr = regex.exec(style);
			var elTerm = typeof regexArr[3] === 'undefined' ? '' : regexArr[3];
			var subStyle = regexArr[1]; // If this matches multiple times, it doesn't matter. Just take the first one, .replace will apply it to all matches anyway
			text = text.replace(regex, (function(){
				//Execute the regex, and return the 2nd element. The 2nd element is the 
				var res = '';
				$(val).each(function(ix, el){
					res+=charme.crossref.format(el, subStyle);
					if (ix < (val.length-1)){
						res+=elTerm;
					}
				});
				return res;
			})());
		} else {
			regex = new RegExp('\\{(\\(([^\\(\\)]*)\\))?' + key + '\\}');
			regexArr = regex.exec(style);
			var condTerm = (val.length === 0 || regexArr === null || typeof regexArr[2] === 'undefined') ? '' : regexArr[2];
			text = text.replace(regex, condTerm + val);
		}
	});
	return text;

};