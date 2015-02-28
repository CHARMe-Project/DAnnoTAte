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

if(typeof charme==='undefined')
    var charme = {};

if(!charme.settings)
    charme.settings = {};


// Site-specific settings:

/*
 * Settings for the CHARMe Plugin to work (see the Integration Guide document):
 * charme.settings.REMOTE_BASE_URL = 
 * charme.settings.AUTH_BASE_URL = Base URL of auth provider. Typically the same as the Node.
 * charme.settings.AUTH_CLIENT_ID = The client ID is used to identify the integrator's site where a CHARMe Node is supporting multiple data providers.
 * charme.settings.AUTH_PATH = The path relative to AUTH_BASE_URL where the authorization service is hosted.
 * charme.settings.AUTH_RESPONSE_TYPE = What the authorization service should do upon successful authorization. Only 'token' is supported for now.
 *
 */
charme.settings.REMOTE_BASE_URL='https://charme-test.cems.rl.ac.uk/'
charme.settings.AUTH_BASE_URL=charme.settings.REMOTE_BASE_URL;
charme.settings.AUTH_CLIENT_ID='12345';
charme.settings.AUTH_PATH='/oauth2/authorize';
charme.settings.AUTH_RESPONSE_TYPE='token';

/*
 * Customisable display settings:
 * charme.settings.COMMENT_LENGTH = The maximum number of characters allowed in the 'Comments' field when creating an annotation.
 * charme.settings.SELECT_ALL_INNERHTML = The HTML to insert after the 'select all' checkbox.
 * charme.settings.ALL_TARGETS_INNERHTML = The HTML to insert before the 'all targets' checkbox.
 * charme.settings.SHOW_SELECT_COUNT = Whether to show the number of targets selected (e.g. '4 of 12 targets selected').
 *
 * HTML:
 * - use '<br/>' for line breaks (e.g. charme.settings.SELECT_ALL_INNERHTML='Select/unselect all<br/>';)
 * - use '&nbsp;' for extra spaces (e.g. charme.settings.SELECT_ALL_INNERHTML=' &nbsp;&nbsp;Select/unselect all';)
 *
 */
charme.settings.COMMENT_LENGTH=500;
charme.settings.SELECT_ALL_INNERHTML='Select/unselect all';
charme.settings.ALL_TARGETS_INNERHTML='All targets ';
charme.settings.SHOW_SELECT_COUNT=true;
