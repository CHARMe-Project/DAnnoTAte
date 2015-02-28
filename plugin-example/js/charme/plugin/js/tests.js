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

//Tests that do not generate any requests to remote sites
//This is to make Webstorm happy basically
if (typeof module === 'undefined'){
	var module = function(){};
}
module(' Non-network Tests');
	asyncTest( "UT-003: Parse JSON-LD response for listing all nodes", function () {
		var graphSrc = 
			'{																			' +
			'	"@graph": [																' +
			'		{																	' +
			'			"@id": "http://localhost/bodyID",								' +
			'			"@type": [														' +
			'				"http://www.w3.org/2011/content#ContentAsText",				' +
			'				"http://purl.org/dc/dcmitype/Text"							' +
			'			],																' +
			'			"http://purl.org/dc/elements/1.1/format": "text/plain",			' +
			'			"http://www.w3.org/2011/content#chars": "hello there!"			' +
			'		},																	' +
			'		{																	' +
			'			"@id": "http://localhost/annoID",								' +
			'			"@type": "http://www.w3.org/ns/oa#Annotation",					' +
			'			"http://www.w3.org/ns/oa#hasBody": {							' +
			'				"@id": "http://localhost/bodyID"							' +
			'			},																' +
			'			"http://www.w3.org/ns/oa#hasTarget": {							' +
			'				"@id": "http://one.remote.host.io/ca960608.dm3"				' +
			'			},																' +
			'			"http://www.w3.org/ns/oa#motivatedBy": {		' +
			'				"@id": "http://www.w3.org/ns/oa/linking"	' +
			'			}																' +
			'		},																	' +
			'		{																	' +
			'			"@id": "http://one.remote.host.io/ca960608.dm3",				' +
			'			"http://purl.org/dc/elements/1.1/format": "html/text"			' +
			'		}																	' +
			'	]																		' +
			'}																			';
		var graph = new jsonoa.core.Graph();
		graph.load(graphSrc).then(function (annoGraph){
			var annotations = annoGraph.getAnnotations();
			equal(annotations.length, 1);
			var anno = annotations[0];
			deepEqual(anno.getValue(jsonoa.types.Common.ID), 'http://localhost/annoID');
			var body = anno.getValue(jsonoa.types.Annotation.BODY);
			ok(body.hasType(jsonoa.types.Text.TEXT) || body.hasType(jsonoa.types.Text.CONTENT_AS_TEXT));
			deepEqual(body.getValue(jsonoa.types.Common.ID), 'http://localhost/bodyID');
			deepEqual(body.getValue(jsonoa.types.Text.CONTENT_CHARS), 'hello there!');
			deepEqual(anno.getValues(jsonoa.types.Annotation.MOTIVATED_BY)[0].getValue(jsonoa.types.Common.ID), 'http://www.w3.org/ns/oa/linking');
			var target = anno.getValue(jsonoa.types.Annotation.TARGET);
			deepEqual(target.getValue(jsonoa.types.Common.ID), 'http://one.remote.host.io/ca960608.dm3');
			start();
		}, function(msg){ok( false, msg ); start();});
	});
	
	asyncTest( "UT-004: Parse JSON-LD response for listing all nodes (second run)", function () {
		var graphSrc = 
			'{ "@graph": [ { "@id": "http://charme-dev.cems.rl.ac.uk/resource/b302b85fdd054db9a7fae83ec7df17d1", "@type": "http://www.w3.org/ns/oa#Annotation", "http://www.w3.org/ns/oa#hasBody": { "@id": "http://charme-dev.cems.rl.ac.uk/resource/dcb638111c094e83a2bfe6888e5d8bfe" }, "http://www.w3.org/ns/oa#hasTarget": { "@id": "http://dx.doi.org/10.1029/00EO00172" } }, { "@id": "http://charme-dev.cems.rl.ac.uk/resource/4bd253eef1cc4dbd8a1fe204e9dd4e30", "@type": "http://www.w3.org/ns/oa#Annotation", "http://www.w3.org/ns/oa#hasBody": { "@id": "http://charme-dev.cems.rl.ac.uk/resource/fdc1cd457b4743c3b670caf94f5531f2" }, "http://www.w3.org/ns/oa#hasTarget": { "@id": "http://dx.doi.org/10.1029/00EO00172" } }, { "@id": "http://charme-dev.cems.rl.ac.uk/resource/9a011320e88c4043a4d344bfe7c6d408", "@type": "http://www.w3.org/ns/oa#Annotation", "http://www.w3.org/ns/oa#hasBody": { "@id": "http://charme-dev.cems.rl.ac.uk/resource/f9aa92e9f98b45ab95867dcb5f5ac4ba" }, "http://www.w3.org/ns/oa#hasTarget": { "@id": "http://dx.doi.org/10.1029/00EO00172" } }, { "@id": "http://charme-dev.cems.rl.ac.uk/resource/a34ec911104443f6af05a06957401aff", "@type": "http://www.w3.org/ns/oa#Annotation", "http://www.w3.org/ns/oa#hasBody": { "@id": "http://charme-dev.cems.rl.ac.uk/resource/fb307faaa2f942d5884ccefca7b167dc" }, "http://www.w3.org/ns/oa#hasTarget": { "@id": "http://dx.doi.org/10.1029/00EO00172" } }, { "@id": "http://charme-dev.cems.rl.ac.uk/resource/a704ff53429a40068f8fb72cdbb62e69", "@type": "http://www.w3.org/ns/oa#Annotation", "http://www.w3.org/ns/oa#hasBody": { "@id": "http://charme-dev.cems.rl.ac.uk/resource/b822aa74f7f94e0d9b18621261721c98" }, "http://www.w3.org/ns/oa#hasTarget": { "@id": "http://dx.doi.org/10.1029/00EO00172" } }, { "@id": "http://charme-dev.cems.rl.ac.uk/resource/0d664faf886c4cc9a665fb128b6d2c93", "@type": "http://www.w3.org/ns/oa#Annotation", "http://www.w3.org/ns/oa#hasBody": { "@id": "http://charme-dev.cems.rl.ac.uk/resource/9bf1ba86f3b445a28c063ea847fda726" }, "http://www.w3.org/ns/oa#hasTarget": { "@id": "http://dx.doi.org/10.1029/00EO00172" } }, { "@id": "http://charme-dev.cems.rl.ac.uk/resource/6e6cde860779494ba716d3d285391532", "@type": "http://www.w3.org/ns/oa#Annotation", "http://www.w3.org/ns/oa#hasBody": { "@id": "http://charme-dev.cems.rl.ac.uk/resource/1b14df2bef85422b851fc34b03525eb6" }, "http://www.w3.org/ns/oa#hasTarget": { "@id": "http://dx.doi.org/10.1029/00EO00172" } } ] }';

		var graph = new jsonoa.core.Graph();
		
		graph.load(graphSrc).then(function(annoGraph){
			var annotations = annoGraph.getAnnotations();
			equal(annotations.length, 7);
			var anno = annoGraph.getNode('http://charme-dev.cems.rl.ac.uk/resource/b302b85fdd054db9a7fae83ec7df17d1');
			deepEqual(anno.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/b302b85fdd054db9a7fae83ec7df17d1');
			var body = anno.getValue(jsonoa.types.Annotation.BODY);
			deepEqual(body.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/dcb638111c094e83a2bfe6888e5d8bfe');
			var target = anno.getValue(jsonoa.types.Annotation.TARGET);
			deepEqual(target.getValue(jsonoa.types.Common.ID), 'http://dx.doi.org/10.1029/00EO00172');
			
			var anno2 = annoGraph.getNode('http://charme-dev.cems.rl.ac.uk/resource/9a011320e88c4043a4d344bfe7c6d408');
			deepEqual(anno2.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/9a011320e88c4043a4d344bfe7c6d408');
			var body2 = anno2.getValue(jsonoa.types.Annotation.BODY);
			deepEqual(body2.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/f9aa92e9f98b45ab95867dcb5f5ac4ba');
			deepEqual(anno2.getValue(jsonoa.types.Annotation.TARGET).getValue(jsonoa.types.Common.ID), 'http://dx.doi.org/10.1029/00EO00172');
			
			var anno3 = annoGraph.getNode('http://charme-dev.cems.rl.ac.uk/resource/0d664faf886c4cc9a665fb128b6d2c93');
			deepEqual(anno3.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/0d664faf886c4cc9a665fb128b6d2c93');
			var body3 = anno3.getValue(jsonoa.types.Annotation.BODY);
			deepEqual(body3.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/9bf1ba86f3b445a28c063ea847fda726');
			deepEqual(anno3.getValue(jsonoa.types.Annotation.TARGET).getValue(jsonoa.types.Common.ID), 'http://dx.doi.org/10.1029/00EO00172');
			start();
		}, function(msg){ok( false, msg ); start();});
	});
	
	asyncTest( "UT-006: Parse JSON-LD for single free-text metadata", function () {
		var graphSrc =
			'{																						' +
			'		"@graph": [																		' +
			'			{																			' +
			'				"@id": "http://localhost/bodyID",										' +
			'				"@type": [																' +
			'					"http://www.w3.org/2011/content#ContentAsText",						' +
			'					"http://purl.org/dc/dcmitype/Text"									' +
			'				],																		' +
			'				"http://purl.org/dc/elements/1.1/format": "text/plain",					' +
			'				"http://www.w3.org/2011/content#chars": "Basic free text metadata"		' +
			'			},																			' +
			'			{																			' +
			'				"@id": "http://localhost/freeTextAnnoId",								' +
			'				"@type": ["http://www.w3.org/ns/oa#Annotation"],						' +
			'				"http://www.w3.org/ns/oa#hasBody": {									' +
			'					"@id": "http://localhost/bodyID"									' +
			'				},																		' +
			'				"http://www.w3.org/ns/oa#hasTarget": {									' +
			'					"@id": "http://one.remote.host.io/ca960608.dm3"						' +
			'				},																		' +
			'				"http://www.w3.org/ns/oa/motivatedBy": {				' +
			'					"@id": "http://www.w3.org/ns/oa/linking"			' +
			'				}																		' +			
			'			},																			' +
			'			{																			' +
			'				"@id": "http://one.remote.host.io/ca960608.dm3",						' +
			'				"http://purl.org/dc/elements/1.1/format": "html/text"					' +
			'			}																			' +
			'		]																				' +
			'}																						';
		var graph = new jsonoa.core.Graph();
		graph.load(graphSrc).then(function(annoGraph){
			var annotations = annoGraph.getAnnotations();
			equal(annotations.length, 1);
			var annotation = annotations[0];
			deepEqual(annotation.getValue(jsonoa.types.Common.ID), 'http://localhost/freeTextAnnoId');
			var body = annotation.getValue(jsonoa.types.Annotation.BODY);
			ok(body.hasType(jsonoa.types.Text.CONTENT_AS_TEXT) || body.hasType(jsonoa.types.Text.TEXT));
			deepEqual(body.getValue(jsonoa.types.Text.CONTENT_CHARS), 'Basic free text metadata');
			start();
		}, function(msg){ok( false, msg ); start();});
	});

	asyncTest( "UT-009: Parse JSON-LD response for single citation", function () {
		expect(8);
		var graphSrc = 
				'[																								' +
				'	{																							' +
				'		"@id": "http://charme-dev.cems.rl.ac.uk/resource/302b85fdd054db9a7fae83ec7df17b8",		' +
				'		"@type": "http://www.w3.org/ns/oa#Annotation",											' +
				'		"http://www.w3.org/ns/oa#hasBody": {													' +
				'			"@id": "http://charme-dev.cems.rl.ac.uk/resource/cb638111c094e83a2bfe6888e5d8bff"	' +
				'		},																						' +
				'		"http://www.w3.org/ns/oa#hasTarget": {													' +
				'			"@id": "http://dataprovider.org/datasets/sst"										' +
				'		},																						' +
				'		"http://www.w3.org/ns/oa/motivatedBy": {								' +
				'			"@id": "http://www.w3.org/ns/oa/linking"							' +
				'		}																						' +
				'	},																							' + 
				'	{																							' +
				'		"@id": "http://charme-dev.cems.rl.ac.uk/resource/cb638111c094e83a2bfe6888e5d8bff",		' +
				'		"@type": ["http://purl.org/spar/cito/CitationAct"],										' +
				'		"http://purl.org/spar/cito/hasCitationEvent": {											' +
				'			"@id": "http://purl.org/spar/cito/citesAsDataSource"								' +
				'		},																						' +
				'		"http://purl.org/spar/cito/hasCitedEntity": {											' +
				'			"@id": "http://dataprovider.org/datasets/sst"										' +
				'		},																						' +
				'		"http://purl.org/spar/cito/hasCitingEntity": {											' +
				'			"@id": "http://dx.doi.org/12345.678910"												' +
				'		}																						' +
				'	}																							' +
				']																								';
		var graph = new jsonoa.core.Graph();
		graph.load(graphSrc).then(function(annoGraph){
			var annotations = annoGraph.getAnnotations();
			equal(annotations.length, 1);
			var anno = annotations[0];
			deepEqual(anno.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/302b85fdd054db9a7fae83ec7df17b8');
			var body = anno.getValue(jsonoa.types.Annotation.BODY);
			ok(body.hasType(jsonoa.types.CitationAct.TYPE));
			deepEqual(body.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/cb638111c094e83a2bfe6888e5d8bff');
			deepEqual(anno.getValue(jsonoa.types.Annotation.TARGET).getValue(jsonoa.types.Common.ID), 'http://dataprovider.org/datasets/sst');
			deepEqual(body.getValue(jsonoa.types.CitationAct.CITED_ENTITY).getValue(jsonoa.types.Common.ID), 'http://dataprovider.org/datasets/sst');
			deepEqual(body.getValue(jsonoa.types.CitationAct.CITING_ENTITY).getValue(jsonoa.types.Common.ID), 'http://dx.doi.org/12345.678910');
			deepEqual(body.getValues(body.TYPE_ATTR_NAME), ['http://purl.org/spar/cito/CitationAct']);
			start();
		}, function(msg){ok( false, msg ); start();});
	});
	
	test( "UT-010: Create a publication annotation and marshall to JSON", function () {
		var jsonSrc = 
			'{"@graph":[																															' +
			'	{																																	' +
			'		"@id":"http://localhost/annoID",																								' +
			'		"@type":["http://www.w3.org/ns/oa#Annotation"],																					' +
			'		"http://www.w3.org/ns/oa#motivatedBy":[{"@id":"http://www.w3.org/ns/oa/linking"}],				' +
			'		"http://www.w3.org/ns/oa#hasBody":[{"@id":"http://dx.doi.org/10.1890/13-0133.1"}],												' +
			'		"http://www.w3.org/ns/oa#hasTarget":{"@id":"http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG"}			' +
			'	},																																	' +
			'	{																																	' +
			'		"@id":"http://dx.doi.org/10.1890/13-0133.1",																					' +
			'		"@type":["http://purl.org/spar/cito/CitationAct"],																				' +
			'		"http://purl.org/spar/cito/hasCitationEvent":{"@id":"http://purl.org/spar/cito/citesAsDataSource"},								' +
			'		"http://purl.org/spar/cito/hasCitedEntity":{"@id":"http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG"},	' +
			'		"http://purl.org/spar/cito/hasCitingEntity":{"@id":"http://dx.doi.org/10.1890/13-0133.1"}										' +
			'	},																																	' +
			'	{																																	' +
			'		"@id":"http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG",												' +
			'		"@type": ["http://purl.org/dc/dcmitype/Dataset"]																					' +
			'	}																																	' +
			']																																		' +
			'}																																		';
		var graph = new jsonoa.core.Graph();
		var anno = graph.createNode({type: jsonoa.types.Annotation, id: 'http://localhost/annoID'});
		var body = graph.createNode({type: jsonoa.types.CitationAct, id: 'http://dx.doi.org/10.1890/13-0133.1'});
		body.setValue(jsonoa.types.CitationAct.CITED_ENTITY, graph.createStub('http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG'));
		body.setValue(jsonoa.types.CitationAct.CITING_ENTITY, graph.createStub('http://dx.doi.org/10.1890/13-0133.1'));
		anno.setValue(jsonoa.types.Annotation.BODY, body);
		anno.setValue(jsonoa.types.Annotation.MOTIVATED_BY, graph.createStub('http://www.w3.org/ns/oa/linking'));
		var target = graph.createNode({type: jsonoa.types.Dataset, id: 'http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG'});
		anno.setValue(jsonoa.types.Annotation.TARGET, target);
		var graphJSON = graph.toJSON();
		deepEqual(graphJSON.replace(/\s/g,''), jsonSrc.replace(/\s/g,''));
	});
	
	test( "UT-022: Create a text annotation and marshall to JSON", function () {
		var jsonSrc = 
			'{"@graph": [{																				' +
			'	"@id": "http://charme-dev.cems.rl.ac.uk/resource/5b3496263a454e1db06fc5088bb43cf4",		' +
			'	"@type": ["http://www.w3.org/ns/oa#Annotation"],										' +
			'	"http://www.w3.org/ns/oa#motivatedBy":[													' +
			'		"http://www.w3.org/ns/oa/linking"													' +
			'	],																						' +
			'	"http://www.w3.org/ns/oa#hasBody": [{													' +
			'		"@id": "http://charme-dev.cems.rl.ac.uk/resource/03e8f39d7e2648729cb0cab6e032c3ce"	' +
			'	}],																						' +
			'	"http://www.w3.org/ns/oa#hasTarget": {													' +
			'		"@id": "http://badc.nerc.ac.uk/view/badc.nerc.ac.uk__ATOM__dataent_namblex"			' +
			'	}																						' +
			'},																							' +
			'{																							' +
			'	"@id": "http://charme-dev.cems.rl.ac.uk/resource/03e8f39d7e2648729cb0cab6e032c3ce",		' +
			'	"@type": [																				' +
			'		"http://purl.org/dc/dcmitype/Text",													' +
			'		"http://www.w3.org/2011/content#ContentAsText"										' +
			'	],																						' +
			'	"http://purl.org/dc/elements/1.1/format": "text/plain",									' +
			'	"http://www.w3.org/2011/content#chars": "This is based on Envisat data"					' +
			'},																							' +
			'{																							' +
			'	"@id":"http://badc.nerc.ac.uk/view/badc.nerc.ac.uk__ATOM__dataent_namblex",				' +
			'	"@type": ["http://purl.org/dc/dcmitype/Dataset"]										' +
			'}																							' +
			']}																							';
		var graph = new jsonoa.core.Graph();
		var anno = graph.createNode({type: jsonoa.types.Annotation, id: 'http://charme-dev.cems.rl.ac.uk/resource/5b3496263a454e1db06fc5088bb43cf4'});
		var body = graph.createNode({type: jsonoa.types.Text, id: 'http://charme-dev.cems.rl.ac.uk/resource/03e8f39d7e2648729cb0cab6e032c3ce'});
		body.setValue(jsonoa.types.Text.CONTENT_CHARS, 'This is based on Envisat data');
		anno.setValue(jsonoa.types.Annotation.BODY, body);
		anno.setValue(jsonoa.types.Annotation.MOTIVATED_BY, 'http://www.w3.org/ns/oa/linking')
		var target = graph.createNode({type: jsonoa.types.Dataset, id: 'http://badc.nerc.ac.uk/view/badc.nerc.ac.uk__ATOM__dataent_namblex'});
		anno.setValue(jsonoa.types.Annotation.TARGET, target);
		try {
			var graphJSON = graph.toJSON();
			deepEqual(graphJSON.replace(/\s/g,''), jsonSrc.replace(/\s/g,''));
		} catch (e){
			ok(e==='Required field http://www.w3.org/ns/oa#annotatedBy missing', 'Required Field Missing Error');
		}
	});
	
	test( "UT-023: Create an annotation with both text and publication and marshall to JSON", function () {
		var jsonSrc = 
			'{"@graph": [{																					' +
			'	"@id": "http://charme-dev.cems.rl.ac.uk/resource/5b3496263a454e1db06fc5088bb43cf4",			' +
			'	"@type": ["http://www.w3.org/ns/oa#Annotation"],											' +
			'	"http://www.w3.org/ns/oa#motivatedBy": [													' +
			'		"http://www.w3.org/ns/oa/linking"														' +
			'	],																							' +
			'	"http://www.w3.org/ns/oa#hasBody": [														' +
			'		{"@id": "http://charme-dev.cems.rl.ac.uk/resource/03e8f39d7e2648729cb0cab6e032c3ce"},	' +
			'		{"@id": "http://dx.doi.org/10.1890/13-0133.1"}											' +
			'	],																							' +
			'	"http://www.w3.org/ns/oa#hasTarget": {														' +
			'		"@id": "http://badc.nerc.ac.uk/view/badc.nerc.ac.uk__ATOM__dataent_namblex"				' +
			'	}																							' +
			'},																								' +
			'{																								' +
			'	"@id": "http://charme-dev.cems.rl.ac.uk/resource/03e8f39d7e2648729cb0cab6e032c3ce",			' +
			'	"@type": [																					' +
			'		"http://purl.org/dc/dcmitype/Text",														' +
			'		"http://www.w3.org/2011/content#ContentAsText"											' +
			'	],																							' +
			'	"http://purl.org/dc/elements/1.1/format": "text/plain",										' +
			'	"http://www.w3.org/2011/content#chars": "This is based on Envisat data"						' +
			'},																								' +
			'{																																	' +
			'	"@id":"http://dx.doi.org/10.1890/13-0133.1",																					' +
			'	"@type":["http://purl.org/spar/cito/CitationAct"],																				' +
			'	"http://purl.org/spar/cito/hasCitationEvent":{"@id":"http://purl.org/spar/cito/citesAsDataSource"},								' +
			'	"http://purl.org/spar/cito/hasCitedEntity":{"@id":"http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG"},	' +
			'	"http://purl.org/spar/cito/hasCitingEntity":{"@id":"http://dx.doi.org/10.1890/13-0133.1"}										' +
			'},																																	' +			
			'{																								' +
			'	"@id":"http://badc.nerc.ac.uk/view/badc.nerc.ac.uk__ATOM__dataent_namblex",					' +
			'	"@type": ["http://purl.org/dc/dcmitype/Dataset"]											' +
			'}																								' +
			']}																								';
		var graph = new jsonoa.core.Graph();
		var anno = graph.createNode({type: jsonoa.types.Annotation, id: 'http://charme-dev.cems.rl.ac.uk/resource/5b3496263a454e1db06fc5088bb43cf4'});
		var textBody = graph.createNode({type: jsonoa.types.Text, id: 'http://charme-dev.cems.rl.ac.uk/resource/03e8f39d7e2648729cb0cab6e032c3ce'});
		textBody.setValue(jsonoa.types.Text.CONTENT_CHARS, 'This is based on Envisat data');
		anno.addValue(jsonoa.types.Annotation.BODY, textBody);
		var pubBody = graph.createNode({type: jsonoa.types.CitationAct, id: 'http://dx.doi.org/10.1890/13-0133.1'});
		pubBody.setValue(jsonoa.types.CitationAct.CITED_ENTITY, graph.createStub('http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG'));
		pubBody.setValue(jsonoa.types.CitationAct.CITING_ENTITY, graph.createStub('http://dx.doi.org/10.1890/13-0133.1'));
		anno.addValue(jsonoa.types.Annotation.BODY, pubBody);
		anno.setValue(jsonoa.types.Annotation.MOTIVATED_BY, 'http://www.w3.org/ns/oa/linking')
		var target = graph.createNode({type: jsonoa.types.Dataset, id: 'http://badc.nerc.ac.uk/view/badc.nerc.ac.uk__ATOM__dataent_namblex'});
		anno.setValue(jsonoa.types.Annotation.TARGET, target);
		try {
			var graphJSON = graph.toJSON();
			deepEqual(graphJSON.replace(/\s/g,''), jsonSrc.replace(/\s/g,''));
		} catch (e){
			ok(e==='Required field http://www.w3.org/ns/oa#annotatedBy missing', 'Required Field Missing Error');
		}
	});	

	asyncTest( "UT-026: Parse atom feed", function(){
		expect(6);
		
		var reqUrl = 'testData/charmetest.atom';
		$.ajax({
			url: reqUrl
		}).then(
			function(xmlResp){
				var result = new charme.atom.Result(xmlResp);
				deepEqual(result.id, 'http://charme-dev.cems.rl.ac.uk:8027/searchatom');
				deepEqual(result.first.href, 'http://charme-dev.cems.rl.ac.uk:8027/search/atom/?&startIndex=1&status=submitted');
				deepEqual(result.next.href, 'http://charme-dev.cems.rl.ac.uk:8027/search/atom/?&startIndex=11&status=submitted');
				deepEqual(result.previous.href, 'http://charme-dev.cems.rl.ac.uk:8027/search/atom/?&startIndex=1&status=submitted');
				deepEqual(result.last.href, 'http://charme-dev.cems.rl.ac.uk:8027/search/atom/?&startIndex=181&status=submitted');
				equal(result.entries.length, 10);
				start();
			}, function(e){
				ok( false, e );
				start();
		});
	});
	asyncTest( "UT-027: Parse annotation from atom feed", function(){
		expect(13);
		var reqUrl = 'testData/simpleatomtest.atom';
		$.ajax({
			url: reqUrl
		}).then(
			function(xmlResp){
				var result = new charme.atom.Result(xmlResp);
				deepEqual(result.id, 'http://charme-dev.cems.rl.ac.uk:8027/searchatom');
				deepEqual(result.first.href, 'http://charme-dev.cems.rl.ac.uk:8027/search/atom/?&startIndex=1&status=submitted');
				deepEqual(result.next.href, 'http://charme-dev.cems.rl.ac.uk:8027/search/atom/?&startIndex=11&status=submitted');
				deepEqual(result.previous.href, 'http://charme-dev.cems.rl.ac.uk:8027/search/atom/?&startIndex=1&status=submitted');
				deepEqual(result.last.href, 'http://charme-dev.cems.rl.ac.uk:8027/search/atom/?&startIndex=181&status=submitted');
				equal(result.entries.length, 1);
				var firstEntry = result.entries[0]; // Read first annotation
				var content = firstEntry.content;
				var graph = new jsonoa.core.Graph();
				graph.load(content).then(function(annoGraph){
					var annotations = annoGraph.getAnnotations();
					equal(annotations.length, 1);
					var anno = annotations[0]; 
					deepEqual(anno.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/5e5d38442a7945f889f3afe1ed0ce7b1');
					var body = anno.getValue(jsonoa.types.Annotation.BODY);
					ok(body.hasType(jsonoa.types.Text.CONTENT_AS_TEXT) || body.hasType(jsonoa.types.Text.TEXT));
					deepEqual(body.getValue(jsonoa.types.Common.ID), 'http://charme-dev.cems.rl.ac.uk/resource/c9379314d849485095c89241ca3ca49c');
					var target = anno.getValue(jsonoa.types.Annotation.TARGET);
					deepEqual(target.getValue(jsonoa.types.Common.ID), 'http://localhost:8090/DAV/NASA/Chlorophyl/2002/MY1DMM_CHLORA_2002-10.JPEG');
					deepEqual(anno.getValue(anno.TYPE_ATTR_NAME), 'http://www.w3.org/ns/oa#Annotation');
					deepEqual(anno.getValues(anno.TYPE_ATTR_NAME), ['http://www.w3.org/ns/oa#Annotation']);
					start();
				});
				
			}, function(e){																		
				ok( false, e );
				start();
		});
	});
test( "UT-028: URI validation.", function () {
	var validURIs = [
		'http://www.google.com',
		'http://www.guardian.co.uk',
		'doi://10.2.3/1232',
		'ftp://something.or.other',
		'http://something'
	];

	var invalidURIs = [
		'http:/www.google.com',
		'sdfdsfdsfsddssdf',
		'http://www google.com',
		'doi:something'
	];

	for (var index in validURIs){
		ok(charme.logic.validURI(validURIs[index]));
	}

	for (var index in invalidURIs){
		equal(charme.logic.validURI(invalidURIs[index]), false);
	}
});

	test( "UT-JOA-005: Test TEMPLATE checking", function () {
		var graph = new jsonoa.core.Graph();
		var anno = graph.createNode({type: jsonoa.types.Annotation, id: 'http://localhost/annoID'});
		anno.setValue(anno.TYPE_ATTR_NAME, 'http://www.w3.org/ns/oa#Annotation');
		
		var target = graph.createNode({type: jsonoa.types.Dataset, id: 'http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG'});
		anno.setValue(jsonoa.types.Annotation.TARGET, target);
		var body = graph.createNode({type: jsonoa.types.CitationAct, id: 'http://localhost/bodyID'});
		body.setValue(jsonoa.types.CitationAct.CITED_ENTITY, target);
		body.setValue(jsonoa.types.CitationAct.CITING_ENTITY, graph.createStub('http://dx.doi.org/10.1890/13-0133.1'));
		anno.setValue(jsonoa.types.Annotation.BODY, body);
		var person = graph.createNode({type: jsonoa.types.Person, id: 'http://localhost/804eaa65d370'});
		try {
			person.setValue(person.MBOX, 'mailto:akhenry@gmail.com');
			ok(false, "Type enforcement failed");
		} catch(e){
			ok(true, "Type enforcement succeeded");
		}
	});

test( "UT-JOA-006: Set multiple types, and test for typiness.", function () {
	expect(4);
	var graph = new jsonoa.core.Graph();
	var anno = graph.createNode({type: jsonoa.types.Annotation, id: 'http://localhost/annoID'});
	var target = graph.createNode({type: jsonoa.types.Dataset, id: 'http://localhost:8090/DAV/NASA/Chlorophyl/2003/MY1DMM_CHLORA_2003-03.JPEG'});
	anno.setValue(jsonoa.types.Annotation.TARGET, target);
	//Add a second type to target

	var body = graph.createNode({type: jsonoa.types.CitationAct, id: 'http://localhost/bodyID'});
	body.setValue(jsonoa.types.CitationAct.CITED_ENTITY, target);
	body.setValue(jsonoa.types.CitationAct.CITING_ENTITY, graph.createStub('http://dx.doi.org/10.1890/13-0133.1'));
	anno.addValue(jsonoa.types.Annotation.BODY, body);

	var textBody = graph.createNode({type: jsonoa.types.Text, id: 'http://localhost/bodyID'});
	textBody.setValue(jsonoa.types.Text.CONTENT_CHARS, 'Hello!');
	anno.addValue(jsonoa.types.Annotation.BODY, textBody);

	ok(body.hasType(jsonoa.types.CitationAct.TYPE), 'Has citation type');
	ok(textBody.hasType(jsonoa.types.Text.CONTENT_AS_TEXT), 'Has content as text type');
	ok(textBody.hasType(jsonoa.types.Text.TEXT), 'Has text type');
	ok(anno.hasType(jsonoa.types.Annotation.TYPE), 'Has annotation type');
});

