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

charme.oauth = {};
charme.oauth.init = function(){
	//Token params are passed to the page in the hash. This was in order to avoid interfering with data providers existing parameter handling.
	var params = charme.common.parameterise(window.location.hash.substring(1));
	var today = new Date();
	var expiryDate = new Date(today.getTime() + parseInt(params.expires_in));
	//var expiryDate = new Date(today.getTime() + 30000);
	//1: Construct message to send back to other window
	var msg = {
		//Token
		token: params.access_token,
		//Token Expiry
		expiry: expiryDate
	};
	
	if (!msg.token || msg.token===''){
		msg.error = "Can't login: Unable to retrieve authentication token";
	}

	//var msgStr = JSON.stringify(msg);
	//THIS NEEDS TO BE SORTED OUT LATER FOR SECURITY REASONS.
	//var originStr = window.location.protocol + '//' + window.location.host;

        //2: Send message back to opening window with the token
	//var msgStr = JSON.stringify(msg);
        charme.oauth.tokenMsg = JSON.stringify(msg);
        charme.oauth.originStr = window.location.protocol + '//' + window.location.host;

        if(charme.common.isIE11orLess) {
            charme.oauth.sendMessage(charme.oauth.tokenMsg, charme.oauth.originStr);
            window.close();
        }
        // If browser not IE, we use postMessage, with a handshake procedure to verify that window.opener - where we  
        // send the login token - is what it should be, and not a rogue entity that could intercept our token
        else {
            window.addEventListener('message', charme.oauth.handshake, false);
            charme.oauth.sendMessage('charme-handshake-request', charme.oauth.originStr);
        }
};

charme.oauth.sendMessage = function(msgStr, originStr) {
    if (window.opener){
            //If internet explorer, use broken method
            if (charme.common.isIE11orLess)
                    window.opener.charme.web.postMessageProxy(msgStr, originStr);
            else // Else use HTML5 standard method
                    window.opener.postMessage(msgStr, originStr);
            //window.close();
    }
    else{
            if (console.log){
                    console.log('Error communicating with opening client');
            }
    }
};

charme.oauth.handshake = function(evt) {
    if(evt.origin === window.location.protocol + '//' + window.location.host && evt.data) {
        if(evt.data === 'charme-handshake-established') {
            charme.oauth.sendMessage(charme.oauth.tokenMsg, charme.oauth.originStr);
            window.close();
        }
    }
};

/**
 * Will execute immediately (should rarely be used)
 */
charme.common.addEvent(window, 'load', charme.oauth.init);
