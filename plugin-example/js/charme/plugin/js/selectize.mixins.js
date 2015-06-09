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

// Mixins to insert our code into selectize.js:
// The Selectize API doesn't (yet) provide any onFocus/onBlur methods, so we 
// must insert our code directly into the selectize.js onFocus/onBlur functions
var selectizeMixins = {};

selectizeMixins.addToOnFocus = function(label, codeToInsert) {
    if(!Selectize.prototype.focusFuncs)
        Selectize.prototype.focusFuncs = {};
    
    if(codeToInsert)
        Selectize.prototype.focusFuncs[label] = codeToInsert;    
};
selectizeMixins.addToOnBlur = function(label, codeToInsert) {
    if(!Selectize.prototype.blurFuncs)
        Selectize.prototype.blurFuncs = {};
    
    if(codeToInsert)
        Selectize.prototype.blurFuncs[label] = codeToInsert;    
};

selectizeMixins.removeFromOnFocus = function(label, codeToDelete) {
    if(Selectize.prototype.focusFuncs[label] === codeToDelete)
        delete Selectize.prototype.focusFuncs[label];
};
selectizeMixins.removeFromOnBlur = function(label, codeToDelete) {
    if(Selectize.prototype.blurFuncs[label] === codeToDelete)
        delete Selectize.prototype.blurFuncs[label];
};

var cachedOnFocus = Selectize.prototype.onFocus;
Selectize.prototype.onFocus = (function() {
    return function() {
        var currentLabel = this.$dropdown[0].parentElement.parentElement.id;
        for(var label in this.focusFuncs) {
            if(label === currentLabel)
                this.focusFuncs[label]();
        }
        
        cachedOnFocus.apply(this, arguments);
    };
}());
var cachedOnBlur = Selectize.prototype.onBlur;
Selectize.prototype.onBlur = (function() {
    return function() {
        var currentLabel = this.$dropdown[0].parentElement.parentElement.id;
        for(var label in this.blurFuncs) {
            if(label === currentLabel)
                this.blurFuncs[label]();
        }

        cachedOnBlur.apply(this, arguments);
    };
}());
