/**
 * charme.web.js
 * 
 * Functions relevant to the plugin frontend (eg. layout, user actions, etc.)
 * 
 * Note: main.js and charme.logic.js should be included in that order.
 * 
 */
if (!charme)
	var charme= {};
charme.web = {};

/**
 * Parses parameters that are passed to this page as URL query string. Is executed automatically on page load, 
 * and will return parameters in associative array with structure ["paramName":"paramValue"]
 */
charme.web.params = 
	(function(a) {
		if (a === "") return {};
		var b = {};
		for (var i = 0; i < a.length; ++i)
		{
			var p=a[i].split('=');
			if (p.length != 2) continue;
			b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
		}
		return b;
	})(window.location.search.substr(1).split('&'));

/**
 * If plugin is inside an iframe (which it always will be, unless in dev mode), then
 * including page will provide a callback to the plugin to be called when plugin is closed.
 * This is in order to allow the containing iframe to be hidden etc. without the plugin itself 
 * having to make any assumptions about the including page.
 */
charme.web.closeCallback = {};
charme.web.setCloseCallback = function(closeCallback){
	charme.web.closeCallback = closeCallback;
};

charme.web.afterLoginSuccess = {};
/**
 * Allows the including page to attach a callback on successful user login
 * @param callback
 */
charme.web.setAfterLoginSuccess = function(callback){
	charme.web.afterLoginSuccess = callback;
};

/**
 * Allows the including page to attach a callback on user logout
 * @param callback
 */
charme.web.afterLogout = {};
charme.web.setAfterLogout = function(callback){
	charme.web.afterLogout = callback;
};

charme.web.setResizeFunction = function(func){
	//$('#dialogHolder').on('resize', func);
};

/**
 * Takes a given targetURI and converts it into a form suitable for display in the plugin title. This will probably depend somewhat upon the type 
 * @param uri
 */
charme.web.titleFromURI = function(uri){
	var parser = document.createElement('a');
	parser.href = uri;
	return parser.pathname + parser.search;
};

/**
 * Returns a plugin title for the current target. eg. The dataset name, that is displayed in the plugin title bar
 */
charme.web.pluginTitleFromTarget = function(){
	return charme.web.titleFromURI(charme.web.params.targetId);
};

/**
 * Shortens a string to a maximum of the given length. If it is longer than this length, it is suffixed with an ellipses.
 * @param uri
 * @param length
 * @returns
 */
charme.web.truncateURI=function(uri, length){
	uri = $.trim(uri);
	if (uri.length <= length)
		return uri;
	else
		return uri.substring(0, length).trim(this) + "...";
};

/**
 * Anything to do with 'fetching' here is a temporary measure so that code can keep track of whether all ajax callouts have returned.
 * Should be replaced at some point with a promises model.
 * TODO: Replace with promises model
 */
charme.web.fetchCount= 0;
charme.web.loggedIn=false;

/**
 * Generate some HTML with the annotators name and email address.
 * @param annotation
 * @returns {String}
 */
charme.web.printAuthor = function(annotation){
	var html = '';
	if (annotation.annotatedBy){
		if (annotation.annotatedBy.email){
			html+=' | <a href="mailto:' + annotation.annotatedBy.email + '">' + (annotation.annotatedBy.name.length > 0 ? annotation.annotatedBy.name : annotation.annotatedBy.email)  + '</a>';
		}
		else if (annotation.annotatedBy.name) {
			html+=' | ' + annotation.annotatedBy.name;
		}
	}
	return html;
};
/**
 * Called for each annotation returned from the CHARMe node. Populates the on screen HTML elements with the data from the returned annotations.
 * @param annotation
 */
charme.web.processAnnotation = function(annotation){
	var promise = new Promise( function(resolver){
		/**
		 * DIRTY HACK.
		 * This is intended to fetch DOI annotation metadata. This will not be necessary once this data is stored in the triplestore
		 * 
		 */
		if (annotation.body && annotation.body.citingEntity){
			var doiTxt = annotation.body.citingEntity.substring(charme.logic.constants.DOI_PREFIX.length, annotation.body.citingEntity.length);
			var criteria = {};
			criteria[charme.logic.constants.CROSSREF_CRITERIA_DOI]=doiTxt;
			/**
			 * Performs a callout to fetch publications metadata based on DOI
			 */
			charme.logic.fetchCrossRefMetaData(criteria).then(function(metaData){
				var url = annotation.body.citingEntity ? annotation.body.citingEntity : annotation.body.getId();
				var shortUrl = charme.web.truncateURI(url, 40);
				var html = 
					'<li class="annotation-row" id="annotation-row-' + annotation.getInternalId() + '">                           ' +
					'   ' + metaData + '                                                                                          ' +
					'	<a href="' + url + '">' + shortUrl + '</a>                                                                ' +
					'<span class="muted pull-right author">22/11/2013 16:16pm ' + charme.web.printAuthor(annotation) + '</span>   ' +
					'</li>                                                                                                        ';
				var htmlObj = $(html);
				$('#ref-list:last').append(htmlObj);
				$('#no-ref-annos').hide();
				$('#ref-loading').hide();
				resolver.fulfilled();
			}, function(resp){
				var url = annotation.body.citingEntity ? annotation.body.citingEntity : annotation.body.getId();
				var shortUrl = charme.web.truncateURI(url, 40);
				var html = 
					'<li class="annotation-row" id="annotation-row-' + annotation.getInternalId() + '">                           ' +
					'   <span class="text-warning">Unable to retrieve metadata</span>                                            ' +
					'	<a href="' + url + '">' + shortUrl + '</a>                                                                ' +
					'<span class="muted pull-right author">22/11/2013 16:16pm ' + charme.web.printAuthor(annotation) + '</span>   ' +
					'</li>                                                                                                        ';
				var htmlObj = $(html);
				$('#ref-list:last').append(htmlObj);
				$('#no-ref-annos').hide();
				$('#ref-loading').hide();
				resolver.reject();
			});
		}
		/**
		 * Specific behaviour based on the returned type of the annotation (Text, Publication, URL, etc.) 
		 */
		else if (annotation.body.text){
			htmlStr = 
				'<li class="annotation-row" id="annotation-row-' + annotation.getInternalId() + '">  ' +
				'	' + annotation.body.text + '                                                    ' +
				'<span class="muted pull-right author">22/11/2013 16:16pm  ' + charme.web.printAuthor(annotation) + '</span> ' +
				'</li>                                                                               ';
			htmlObj = $(htmlStr);
			$('#text-list:last').append(htmlObj);
			$('#no-text-annos').hide();
			$('#text-loading').hide();
			resolver.fulfilled();
		} 
		else if (annotation.body instanceof OA.OARefBody){
			htmlStr = 
				'<li class="annotation-row" id="annotation-row-' + annotation.getInternalId() + '">                           ' +
				'	<a href="' + annotation.body.getId() + '">' + charme.web.truncateURI(annotation.body.getId(), 40) + '</a> ' +
				'<span class="muted pull-right author">22/11/2013 16:16pm  ' + charme.web.printAuthor(annotation) + '</span> ' +
				'</li>                                                                                                        ';
			htmlObj = $(htmlStr);
			$('#ref-list:last').append(htmlObj);
			$('#no-ref-annos').hide();
			$('#ref-loading').hide();
			resolver.fulfilled();
		} 
		else {
			htmlStr = 
				'<li class="annotation-row" id="annotation-row-' + annotation.getInternalId() + '">                           ' +
				'	<a href="' + annotation.body.getId() + '">' + charme.web.truncateURI(annotation.body.getId(), 40) + '</a> ' +
				'<span class="muted pull-right author">22/11/2013 16:16pm  ' + charme.web.printAuthor(annotation) + '</span> ' +
				'</li>                                                                                                        ';
			htmlObj = $(htmlStr);
			$('#link-list:last').append(htmlObj);
			$('#no-link-annos').hide();
			$('#link-loading').hide();
			resolver.fulfilled();
		}
	});
	return promise;
};

/**
 * Retrieve and show all annotations with a given state (eg. submitted, retired, etc.)
 * Parameters:
 *		state: Return all annotations that match this state
 *		targetId (optional): The id of a target on which to filter the results
 */
charme.web.showAnnotations=function(state, targetId){
	$('#annotations-error').hide();
	
	$('#no-text-annos').hide();
	$('#text-loading').show();
	$('#no-ref-annos').hide();
	$('#ref-loading').show();
	$('#no-link-annos').hide();
	$('#link-loading').show();
	//Make a call to the lower-level charme.logic function that makes the ajax call to fetch the annotations
	charme.logic.fetchAnnotationsForTarget(targetId).then(
		function(graph){
			var promises = [];
			$.each(graph.annotations, function(i, annotation){
				promises.push(charme.web.processAnnotation(annotation));
			});
			var clearMessages = function(){
				var txtLoading = $('#text-loading');
				var refLoading = $('#ref-loading');
				var linkLoading = $('#link-loading');
				
				if (txtLoading.is(":visible") ){
					txtLoading.hide();
					$('#no-text-annos').show();
				}
				if (refLoading.is(":visible") ){
					refLoading.hide();
					$('#no-ref-annos').show();
				}
				if (linkLoading.is(":visible") ){
					linkLoading.hide();
					$('#no-link-annos').show();
				}
			};
			
			Promise.every.apply(null, promises).then(clearMessages);
		},
		function(){
			$('#annotations-error').show();
			$('#text-loading').hide();
			$('#no-text-annos').show();
			$('#ref-loading').hide();
			$('#no-ref-annos').show();
			$('#link-loading').hide();			
			$('#no-link-annos').show();		
		},
		targetId
	);
};

/**
 * Clear all of the annotation rows from the table.
 */
charme.web.clearAnnotations=function(){
	$('.annotation-row').remove();
	$('#no-text-annos').show();
	$('#no-ref-annos').show();
	$('#no-link-annos').show();	
};

/**
 * Create a new annotation by saving the form, populating an annotation object, and serializing this into an ajax call
 */
charme.web.saveAnnotation=function(){
	var bodyObj = {};
	var doiVal = '';
	var form = $('#annotation-form')[0];
	
	//Clear all errors
	$('.alert').hide();
	
	//Create a new Annotation object
	var annotation = new OA.OAnnotation();
	//Fetch the the id from the form that was auto-generated.
	annotation.setId(charme.logic.constants.ATN_ID_PREFIX + 'annoID');
	
	//Create and populate a Target object.
	var target = new OA.OATarget();
	target.setId(charme.web.params.targetId);
	annotation.target = target;
	
	if (charme.web.params.loggedInEmail && charme.web.params.loggedInEmail.length > 0){
		annotation.annotatedBy = new OA.OAPerson();
		annotation.annotatedBy.setId(charme.logic.constants.BODY_ID_PREFIX + charme.logic.generateGUID());
		annotation.annotatedBy.email=charme.web.params.loggedInEmail;
		annotation.annotatedBy.name=charme.web.params.loggedInName;
	}
		
	//The JSON-LD graph created will depend somewhat upon the type of annotation being created. This is abstracted in the js code by providing different types of
	//Annotation Body objects, depending on the type required.
	var typeSelect = $('#AnnoType');

	if (typeSelect.val()=='text'){
		bodyObj = OA.createTextBody();
		bodyObj.setId(charme.logic.constants.BODY_ID_PREFIX + 'bodyID');
		bodyObj.text=form.elements.bodyContentText.value;
		annotation.body = bodyObj;
	} else if (typeSelect.val() == 'url'){
		doiVal = form.elements.bodyContentURL.value;
		if (!doiVal.match('^' + charme.logic.regExpEscape(charme.logic.constants.URL_PREFIX))){
			doiVal = charme.logic.constants.URL_PREFIX + doiVal;
		}
		bodyObj = new OA.OABody();
		bodyObj.setId(doiVal);
		annotation.body = bodyObj;
	} else if (typeSelect.val() == 'cito'){
		doiVal = form.elements.bodyContentDOI.value;
		if (!doiVal.match('^' + charme.logic.regExpEscape(charme.logic.constants.DOI_PREFIX))){
			doiVal = charme.logic.constants.DOI_PREFIX + doiVal;
		}
		bodyObj = new OA.OARefBody();
		bodyObj.citedEntity=target.getId();
		bodyObj.citingEntity=doiVal;
		bodyObj.setId(doiVal);
		annotation.body = bodyObj;
	}
	//Call to the charme.logic library to make the AJAX callout to the web service.
	charme.logic.createAnnotation(annotation, 
			function(){
				//Success callback
				$('#newAnnotation').addClass('hide');
				$('#dialogHolder').removeClass('hide');
				charme.web.clearAnnotations();
				charme.web.showAnnotations('submitted', annotation.target.getId());
			}, 
			function(){
				charme.web.clearAnnotations();
				charme.web.showAnnotations('submitted', annotation.target.getId());
				//Error callback
				$('#create-error').show();
			}
	);
	return false;
};
/**
 * Event handler fired when tabs are clicked. This will clear the annotations on the page, and issue an AJAX fetch for all annotations with the selected status
 */
charme.web.changeTab=function(e){
	var el = e.currentTarget;
	var state = el.id.substring(4);
	el = $(el);
	$('#state-tabs .active').removeClass('active');
	el.addClass('active');
	//clear all alerts when changing tab
	$('.alert').hide();
	charme.web.clearAnnotations();
	charme.web.showAnnotations(state);
};

/**
 * Change the state of the selected annotation. This issues a new ajax call to the necessary web service.
 */
charme.web.advanceState=function(annotationId, newState){
	charme.logic.advanceState(annotationId, newState,
		function(){
			$('#tab-' + newState).click();
		},
		function(){
			$('#state-error').show();
		}
	);
};

/**
 * When creating a new annotation, select the type of annotation to be created. On the UI, this changes the type of input field presented for the body. 
 * In the code, this affects how the Annotation object is initialized in charme.web.saveAnnotation
 */
charme.web.changeType=function(e){
	var type = e.currentTarget.value;
	if (type=='cito'){
		$('#AnnoBodyCito').show();
		$('#AnnoBodyText').hide();
		$('#AnnoBodyURL').hide();
	} else if (type=='text'){
		$('#AnnoBodyText').show();
		$('#AnnoBodyCito').hide();
		$('#AnnoBodyURL').hide();
	} else if (type=='url'){
		$('#AnnoBodyURL').show();
		$('#AnnoBodyCito').hide();
		$('#AnnoBodyText').hide();
	}
};

/**
 * This function will perform an asynchronous lookup of metadata based on provided DOI, and display it on screen.
 * @param e
 * @returns {Boolean}
 */
charme.web.doiSearch=function(e){
	var doiElement = $('#AnnoBodyCitoInput');
	var doi = $.trim(doiElement.val());

	var annoBodyCito = $('#AnnoBodyCito');
	annoBodyCito.removeClass('error');
	annoBodyCito.removeClass('success');
	doiElement.popover('destroy');
	
	if (doi.length===0){
		annoBodyCito.addClass('error');
		doiElement.attr('data-content', 'Please enter a DOI before searching');
		doiElement.popover('show');
		return true;
	} else {
		var criteria = {};
		criteria[charme.logic.constants.CROSSREF_CRITERIA_DOI] = doi;
		//Call to the charme.logic library function for fetching metadata
		charme.logic.fetchCrossRefMetaData(criteria).then(
			function(data){
				//var fmtText = charme.crossref.chicagoStyle(data);
				//Disabling this for now. Instead, going to use the crossref citation formatter for wider support. If metadata is needed in XML format in the future, then this can be restored.
				var fmtText = data;
				$('#BibTextHolder').html(fmtText);
				$('#AnnoBodyBib').removeClass('hide');
				annoBodyCito.addClass('success');
			}, function(){
				annoBodyCito.addClass('error');
				doiElement.attr('data-content', 'Error retrieving publication metadata');
				doiElement.popover('show');
			});
	}
};

/**
 * Clears the select2 multi-select box. Select2 is 3rd party component that allows for powerful combo boxes with multi-select that are in keeping with the Bootstrap look and feel.
 */
charme.web.clearSelect2 = function (){
	$('.select2-search-choice').remove();
	$('.FacetBox').val('');
};

/**
 * Called when the user logs in. Of course currently there is no authentication taking place, so this just changes some on screen elements.
 */
charme.web.doLogin = function() {
	var emailEl = $('#emailAddress');
	emailEl.popover('destroy');
	var userEl = $('#userName');
	userEl.popover('destroy');
	var email = emailEl.val();
	var name = userEl.val();
	
	if (!$.trim(email)){
		$('#emailAddressGroup').addClass('error');
		emailEl.attr('data-content', 'Please enter an email address');
		emailEl.popover('show');
		emailEl.on('click', function(){
			$('#emailAddressGroup').removeClass('error');
			emailEl.popover('destroy');
		});
		return;
	}

	if (!$.trim(name)){
		$('#userNameGroup').addClass('error');
		userEl.attr('data-content', 'Please enter your name');
		userEl.popover('show');
		userEl.on('click', function(){
			$('#userNameGroup').removeClass('error');
			userEl.popover('destroy');
		});
		return;
	}
	
	
	$('#SignIn').addClass('hide');
	$('#dialogHolder').removeClass('hide');
	$('#loginDialog').addClass('hide');
	$('#AccountDetails').removeClass('hide');
	charme.web.params.loggedInEmail = email;
	charme.web.params.loggedInName = name;
	$('#AccountDropDown').html(email);
	$('#newAnnotationButton').removeAttr('disabled');
	$('#newAnnotationButton').addClass('btn-primary');
	if (typeof charme.web.afterLoginSuccess === 'function'){
		charme.web.afterLoginSuccess(email, name);
	}
	
	$('#emailAddressGroup').removeClass('error');
	$('#userNameGroup').removeClass('error');
};

charme.web.doLogout = function(){
	document.location.href = location.href.split('?')[0];
	charme.web.afterLogout();
	document.location.reload();
};

/**
 * Define behaviour of html elements through progressive enhancement.
 * TODO: This function is way too long. The application is getting too complex for all behaviour to be defined in a single function. Suggest migrating to an extablished framework like angular.js
 */
charme.web.behaviour = function(){
	$('#DatasetName').html(charme.web.pluginTitleFromTarget());
	$('#newAnnotationButton').click(
			function(){
				$('#create-error').hide();
				$('#annotation-form')[0].reset();
				$('#dialogHolder').addClass('hide');
				$('#BibTextHolder').html('');
				$('#AnnoBodyBib').addClass('hide');
				var annoBodyCito = $('#AnnoBodyCito');
				annoBodyCito.removeClass('success');
				annoBodyCito.removeClass('error');
				$('#AnnoType').change();
				$('#newAnnotation').removeClass('hide');
				charme.web.clearSelect2();
			}
	);
	
	$('#CancelButton').click(
			function(){
				$('#newAnnotation').addClass('hide');
				$('#dialogHolder').removeClass('hide');
			}
	); 
	
	$('#annotation-form').submit( function(){
		return false;
	});
	
	$('#DoneButton').on('click', function (){ 
		if (charme.web.closeCallback){
			charme.web.closeCallback();
		}
	});
	
	$('#CloseCross').on('click', function(){
		if (charme.web.closeCallback){
			charme.web.closeCallback();
		}
	});
		
	$('#newAnnotation-CloseCross').on('click', function(){
		$('#newAnnotation').addClass('hide');
		$('#dialogHolder').removeClass('hide');
	});

	$('#login-CloseCross').on('click', function(){
		$('#loginDialog').addClass('hide');
		$('#dialogHolder').removeClass('hide');
	});
	
	$('#SaveButton').on('click', charme.web.saveAnnotation);
	
	$('#AnnoType').change(charme.web.changeType);
	$('#AnnoType').change();

	$('#DOISearchButton').on('click', charme.web.doiSearch);
	$('#AnnoBodyCitoInput').on('change', function(){
				$('#BibTextHolder').html('');
				$('#AnnoBodyBib').addClass('hide');
				var annoBodyCito = $('#AnnoBodyCito');
				annoBodyCito.removeClass('success');
				annoBodyCito.removeClass('error');
	});
	var facetBoxen = $(".FacetBox");
	if (facetBoxen.select2){
		facetBoxen.select2({placeholder: 'Click to select categories'});
	}
	
	if (charme.web.loggedIn){
		$("#SignIn").addClass('hide');
		$('#dialogHolder').removeClass('hide');
		$('#loginDialog').addClass('hide');
		$('#AccountDetails').removeClass('hide');
		$('#newAnnotationButton').removeAttr('disabled');
		$('#newAnnotationButton').addClass('btn-primary');
		$('#AccountDropDown').html(charme.web.params.loggedInEmail);
	} else {
		$("#SignIn").removeClass("hide");
	}
	
	$("#SignIn").on('click', function() {
		$('#dialogHolder').addClass('hide');
		$('#loginDialog').removeClass('hide');
		
	});
	
	$("#LoginBtn").on('click', charme.web.doLogin);
	
	$('#LoginCancel').on('click',
			function(){
				$('#dialogHolder').removeClass('hide');
				$('#loginDialog').addClass('hide');
			}
	);
	
	$('#LogoutButton').on('click', charme.web.doLogout);
}; 

/**
 * An initialization function that is called when the DOM document is rendered, and ready.
 */
charme.web.init=function(){
	charme.web.loggedIn = charme.web.params.loggedInEmail && (charme.web.params.loggedInEmail !== '');
	var targetId = charme.web.params.targetId;
	$("#dialogHolder").show();
	if (targetId){
		charme.web.showAnnotations('submitted', targetId);
	}

	charme.web.behaviour();
};

$(document).ready(function(){
	charme.web.init();
});