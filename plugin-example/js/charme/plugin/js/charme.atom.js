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

charme.atom = {};
charme.atom.XPath = function(){
		this.NS_OPENSEARCH_URI		= 'http://a9.com/-/spec/opensearch/1.1/';

		/*
		 * Paths to elements in the XML Document
		 */
		this.XPATH_BASE				= '//atm:feed';
		this.XPATH_ID				= this.XPATH_BASE + '/atm:id';

		//Paging links
		this.XPATH_FIRST			= this.XPATH_BASE + '/atm:link[@rel="first"]';
		this.XPATH_FIRST_HREF		= this.XPATH_FIRST + '/@href';
		this.XPATH_NEXT				= this.XPATH_BASE + '/atm:link[@rel="next"]';
		this.XPATH_NEXT_HREF		= this.XPATH_NEXT + '/@href';
		this.XPATH_PREVIOUS			= this.XPATH_BASE + '/atm:link[@rel="previous"]';
		this.XPATH_PREVIOUS_HREF	= this.XPATH_PREVIOUS + '/@href';
		this.XPATH_LAST				= this.XPATH_BASE + '/atm:link[@rel="last"]';
		this.XPATH_LAST_HREF		= this.XPATH_LAST + '/@href';
		
		//Results metadata
		this.XPATH_TOTAL_RESULTS	= this.XPATH_BASE + '/os:totalResults';
		this.XPATH_START_INDEX		= this.XPATH_BASE + '/os:startIndex';
		this.XPATH_INDEX_PER_PAGE	= this.XPATH_BASE + '/os:indexPerPage';
		
		//Entries
		this.XPATH_ENTRY_BASE		= '//atm:entry';
		this.XPATH_ENTRIES			= this.XPATH_BASE + this.XPATH_ENTRY_BASE;
		this.XPATH_ENTRY_ID			= 'atm:id';
		this.XPATH_ENTRY_TITLE		= 'atm:title';
		this.XPATH_ENTRY_UPDATED	= 'atm:updated';
		this.XPATH_ENTRY_CONTENT	= 'atm:content';		
};

charme.atom.nsResolver = function(prefix){
	var ns = {
			'atm' : 'http://www.w3.org/2005/Atom',
			'os': 'http://a9.com/-/spec/opensearch/1.1/'
	};
	return ns[prefix] || null;
};

/**
 * A 'coercible' type. This function will take an XML node as an input, and populate itself. This is used by charme.xml.wrapDoc
 */
charme.atom.entry = function(atomDoc){
	var xpathConst = new charme.atom.XPath();
	
	this.id = atomDoc.asString(xpathConst.XPATH_ENTRY_ID);
	this.title = atomDoc.asString(xpathConst.XPATH_ENTRY_TITLE);
	this.updated = atomDoc.asString(xpathConst.XPATH_ENTRY_UPDATED);
	this.content = atomDoc.asString(xpathConst.XPATH_ENTRY_CONTENT);
};

charme.atom.Result = function(xmlDoc){
		/*
		 * Init
		 */
		var xpathConst = new charme.atom.XPath();
		
		var atomDoc = charme.xml.evaluate(xmlDoc, charme.atom.nsResolver);
		
		/*
		 * Attributes 
		 */
		this.id=atomDoc.asString(xpathConst.XPATH_ID);
		this.first = {
				href: atomDoc.asString(xpathConst.XPATH_FIRST_HREF)
		};
		this.next = {
				href: atomDoc.asString(xpathConst.XPATH_NEXT_HREF)
		};
		this.previous = {
				href: atomDoc.asString(xpathConst.XPATH_PREVIOUS_HREF)
		};
		this.last = {
				href: atomDoc.asString(xpathConst.XPATH_LAST_HREF)
		};
		this.totalResults = atomDoc.asNumber(xpathConst.XPATH_TOTAL_RESULTS);
		this.startIndex = atomDoc.asNumber(xpathConst.XPATH_START_INDEX);
		this.indexPerPage = atomDoc.asNumber(xpathConst.XPATH_INDEX_PER_PAGE);
		this.entries = atomDoc.asComplexList(xpathConst.XPATH_ENTRIES, charme.atom.entry);
};