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

//Test
var jsonoa = {};
jsonoa.types = {};
jsonoa.core = {};
jsonoa.graph = {};
jsonoa.constants = {
	ID:'@id',
	PREF_LABEL:'http://www.w3.org/2004/02/skos/core#prefLabel',
	NAME: 'http://xmlns.com/foaf/0.1/name',
	GRAPH: '@graph'
};

jsonoa.util = {};

jsonoa.util.arraysEqual = function(arr1, arr2){
	return !(arr2 < arr1 || arr1 < arr2);
};
jsonoa.util.isWrapped = function(obj){
	return (obj.node);
};

/**
 * Tests whether a given value is a jsonoa graph node, or a primitive type
 * @param test
 * @returns
 */
jsonoa.util.isNode = function(test){
	//Check value is not null, and then check that it has an @id attribute
	return test && test['@id'] ? true : false;
};

jsonoa.core.registry = [];

/**
 * Wraps a json-ld node with some accessor functions.
 * @param The description object of the new node type.
 * @returns {typeDef}
 */
jsonoa.core.wrapNode = function(typeDesc){
	/**
	 * An object is returned that wraps the underlying node, providing accessor and mutator methods for modification.
	 * ALL node objects returned by this library are wrapped with the object structure below. Returned object has a runtime type defined by its jsono.types type. (eg. jsonoa.types.Annotation).
	 * This means that operations such as (node instanceof jsonoa.types.Annotation) will evaluate to true.
	 */
	var typeDef = function(){
		//Fields
		this.ID='@id';
		this.TYPE_ATTR_NAME='@type';
		this.node = undefined;
		this.template = typeDesc.template;
		this.graph = [];
		this.types = [];

		this._init = function(){
			//Do a deep copy, don't want to modify the underlying template
			this.node = $.extend(true, {}, this.template);
			this.types = this.node['@type'];
		};
		
		this._isInit = function(){
			if (!this.node){
				throw 'Registered node type not initialised.(' + typeDesc.template + ')';
			}
		};
		
		//Constructor - Copy all constants across
		for (var key in typeDesc.constants){
			this[key]=typeDesc.constants[key];
		}
		
		this._wrapValue = function(attrVal){
			if (jsonoa.util.isNode(attrVal)){
				var linkedNode = this.graph.getNode(attrVal['@id']);
				if (!linkedNode){
					//Basically, node is unknown, but return the node wrapped in a stub object to allow for get/set functionality
					var stub = this.graph.createNode({template: jsonoa.core.Stub, id: attrVal['@id'], wrappedData: attrVal, graphLess: true});
					return stub;
				}
				return linkedNode ? linkedNode : attrVal;
			} else {
				return attrVal;
			}
		};

		this.hasType = function(type){
			var types = this.getValues('@type');
			return types.indexOf(type) >= 0;
		};

		//Accessor Methods
		this.getValue=function(attr){
			this._isInit();
			
			var attrVal = this.node[attr];
			if (attrVal instanceof Array){
				attrVal = attrVal[0];
			}
                        
			return this._wrapValue(attrVal);
				
		};
		this.getValues=function(attr){
			this._isInit();
			var attrVal = this.node[attr];
			if (typeof attrVal==='undefined')
				return [];
			else if (attrVal instanceof Array){
				var wrappedArr = [];
				for (var i=0; i < attrVal.length; i++){
					wrappedArr.push(this._wrapValue(attrVal[i]));
				}
				return wrappedArr;
			} else {
				return [this._wrapValue(attrVal)];
			}
		};
		this.setValue=function(attr,value){
			this._isInit();
			if (value instanceof Array){
				throw 'Type exception, cannot set value to an array type. Use addValue function instead.';
			}
            if (typeof this.template[attr] !== 'undefined' )
            {
                //Validate value against template
                if (typeof this.node[attr] !== 'object' && this.template[attr]!=='?'){
                    throw 'Field (' + attr + ') is defined as constant in type template';
                }
                if (typeof value !== typeof this.node[attr] && !(this.node[attr] instanceof Array)){
                    throw 'Type exception, cannot set field (' + attr + ') with type ' + (typeof this.node[attr]) + ' to value of type ' + (typeof value);
                }

            }
			if (jsonoa.util.isWrapped(value)){
				value = (this.graph.createStub(value.node[value.ID])).node;
			}
			if (this.node[attr] instanceof Array && !(value instanceof Array)){
				this.node[attr] = [value];
			} else {
				this.node[attr] = value;
			}
		};
		this.addValue=function(attr,value){
			this._isInit();
			if (typeof this.node[attr] !== 'object' && this.template[attr]!=='?'){
				throw 'Field (' + attr + ') is defined as constant in type template';
			}
			if (!(this.node[attr] instanceof Array)){
				throw 'Field (' + attr + ') is not defined as an array type in template';
			}
			else{
				if (jsonoa.util.isWrapped(value)){
					value = (this.graph.createStub(value.node[value.ID])).node;
				}
				this.node[attr].push(value);
			}
		};		
		this._checkRequiredFields = function(){
			for (var prop in this.node){
				var val = this.node[prop];
				if (jsonoa.util.isNode(val)){
					if (val['@id']==='?'){
						throw 'Required field ' + prop + ' missing';
					}
				}else if (val==='?'){
					throw 'Required field ' + prop + ' missing';
				}
			}
		};
		
		this.toJSON=function(){
			this._isInit();
			this._checkRequiredFields();
			return JSON.stringify(this.node);
		};
	};
	
	var types = typeDesc.template['@type'];
	if (!types){
		if (jsonoa.core.Stub)
			throw 'Registered node type must specify an @type attribute';
		types = [];
	}
	if (!(types instanceof Array)){
		types = [types];
	}
	jsonoa.core.registry.push({'matchTypes': types.sort(), 'typeDef': typeDef});
	
	return typeDef;
};

jsonoa.core._createBasicNode = function(){
	return {'@id': '?'};
};

/**
 * Defines a basic node type for graphs, and some functions for accessing the graph. A graph is first instantiated via
 * var graph = new jsonoa.core.Graph(). It can then be built programatically by adding nodes to it, via createNode, or a node
 * structure can be loaded from a string or json object source via Graph.load()
 */
jsonoa.core.Graph = function(){
	this.nodes = [];
	this.idMap = [];
	
	/**
	 * Creates a new node of the requested type. The wrapped node will be returned, and also saved into the graph. The 'wrappedData' is the basic json-ld node underlying it (not required for new nodes)
	 * options:
	 *  id (required): An identifier for the new node
	 *  wrappedData (optional): If representing existing data, the data to wrap
	 * 	template (optional): If creating from scratch, a template to follow
	 * 	graphLess (optional: Create the node, but don't add it to the graph.
	 */
	this.createNode = function(options){
		var node;
                
		/*if (options.type){
			node = (new options.type()).TEMPLATE;
		} else{*/
		node = new jsonoa.core.Stub();
		if (options.type) {
			node.template = (new options.type()).TEMPLATE;
		}

		/*}*/
		node._init();
		
		if (options.wrappedData){
			node.node = options.wrappedData;
		}
		
		node.node['@id']=options.id;
		
		node.graph = this;
		if (!options.graphLess){
			this.nodes.push(node);
			this.idMap[options.id]=node;
		}
		return node;
	};
	
	this.createStub = function(id){
		return this.createNode({type: jsonoa.core.Stub, id: id, graphLess: true});
	};
	
	/**
	 * Returns a node with the given ID
	 */
	this.getNode = function(id){
		return this.idMap[id];
	};
	
	/**
	 * Returns all nodes of the requested type
	 */
	this.getNodesOfType = function(type){
		var wrappedNodes = [];
		for (var i=0; i<this.nodes.length; i++){
			var thisNode = this.nodes[i];
			if (thisNode.hasType(type)){
				wrappedNodes.push(thisNode);
			}
		}
		return wrappedNodes;
	};
	
	this.getAnnotations = function(){
		return this.getNodesOfType(jsonoa.types.Annotation.TYPE);
	};
	
	//Traverse the graph, decorate nodes with utility functions and identifiers, then stitch them together.
	this.load = function(graphSrc, ignoreErrors){
		var parentGraph = this;
		return new Promise(function(resolver) {
			var graph;
			if (typeof graphSrc === 'string'){
				//JSON-ify
				graph = JSON.parse(graphSrc);
			} else if (typeof graphSrc === 'object'){
				graph = graphSrc;
			} else {
				throw 'Unknown graph type';
			}
			(new jsonld.JsonLdProcessor()).flatten(graph, {}).then(function(data){
				var graphArr = [];
				if (data['@graph']){
					graphArr = data['@graph'];
				} else {
					graphArr = data;
				}
				for (var i=0; i < graphArr.length;i++){
					var node = graphArr[i];
					if (jsonoa.util._hasTypeAttribute(node)){
						var nodeTypes = node['@type'];
						var unknownType = nodeTypes.length === 0;
						if (!(nodeTypes instanceof Array)){
							nodeTypes = [nodeTypes];
						}
						for(var j=0; j<nodeTypes.length && !unknownType; j++) {
                                                    unknownType = !jsonoa.util.isKnownType(nodeTypes[j]);
						
                                                    if (unknownType){
                                                        if (typeof console !== 'undefined') {
                                                            console.log('Unknown node type: ' + nodeTypes[j]);
                                                        }
                                                    }
                                                }
						parentGraph.createNode({id: node['@id'], wrappedData:node });
					}
					
				}
				resolver.resolve(parentGraph);
			});
		});
	};
	
	this.toJSON = function(){
		var graphString = '{"@graph": [';
		var nodeStringArr=[];
		for (var i=0; i < this.nodes.length; i++){
			nodeStringArr.push(this.nodes[i].toJSON());
		}
		graphString+=nodeStringArr.join(',');
		graphString+=']}';
		return graphString;
	};
};

/**
 * Given a string representation of a known type, return the type definition from jsonoa.types.
 * @param type
 * @returns {*}
 */
jsonoa.util.templateFromType = function(type){
	for (var nodeType in jsonoa.types){
		var nodeTypeSpec = jsonoa.types[nodeType];
		if (nodeTypeSpec.TYPE===type) {
			return nodeTypeSpec;
		}
	}
	return null;
};

/**
 * Given a string type, will return true if the type is defined in jsonoa.types.js. Otherwise, false.
 * @param typeToTest A string representation of a jsonoa node type (defined in jsonoa.types.js)
 * @returns {boolean}
 */
jsonoa.util.isKnownType = function(typeToTest){
	for (var type in jsonoa.types){
		var typeObj = jsonoa.types[type];
		if (typeof typeObj.TYPE!=='undefined'){
			if (typeObj.TYPE instanceof Array && typeObj.TYPE.indexOf(typeToTest) >=0){
				return true;
			} else if (typeObj.TYPE===typeToTest) {
				return true;
			}
		}
	}
	return false;
};

jsonoa.util._hasTypeAttribute = function(node){
	return node['@type'] ? true : false;
};

jsonoa.types.Common = new function(){
	this.ID = '@id';
	this.TYPE = '@type';
	this.VALUE = '@value';
};

jsonoa.core.Stub = jsonoa.core.wrapNode({
	template:
	{
		"@id": "?"
	},
	constants: {
	}
});
