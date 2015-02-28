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

charme.web.app.directive('targetTypeKeywords', function($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {targetTypesToShow: '@'},
        link: function ($scope, element, attrs, $ngModel) {
            var optgroups = [];
            var options = [];
            var el = $(element).selectize()[0].selectize;
            
            $scope.$on($scope.targetTypesToShow, function(event, categories) {
                angular.forEach(categories, function (cat) {
                    optgroups.push({value: cat.name, label: cat.name});
                    // Could just use el.addOptionGroup here instead, and have no optgroups array at all, but we might perhaps want to have this array in future
                    //el.addOptionGroup(cat.name, {label: cat.name});

                        angular.forEach(cat.keywords, function (kword) {
                            if(kword.hasOwnProperty('desc')) {
                                options.push({text: kword.desc, value: kword.uri, optgroup: cat.name, $order: kword.desc});
                            }
                            else if(kword.hasOwnProperty('label')) {
                                if(kword.label instanceof Array)
                                    options.push({text: kword.label[0].trim(), value: kword.uri, optgroup: cat.name, $order: kword.label[0].trim()});
                                else if(kword.label !== undefined)
                                    options.push({text: kword.label.trim(), value: kword.uri, optgroup: cat.name, $order: kword.label.trim()});
                            }
                        });
                });
                
                // $timeout used to avoid 'apply already in progress' error
                $timeout(function() {
                    for(var i = 0; i < optgroups.length; i++) {
                        el.addOptionGroup(optgroups[i].value, {label: optgroups[i].label});
                    }
                    el.load(function(func) {
                        func(options);
                    });
                });

                function applyChange() {
                    var selectedOptions = [];
                    var values = el.getValue();
                    angular.forEach(options, function (option) {
                            if (values.indexOf(option.value) >= 0) {
                                    selectedOptions.push(option);
                            }
                    });
                    $ngModel.$setViewValue(selectedOptions);
                };
                el.on('change', function () {
                    $timeout(function() {
                        $scope.$apply(applyChange);
                    });
                });

                $scope.$on('newTargetTypes', function(event, newTargetTypes) {
                    // $timeout used to avoid 'apply already in progress' error
                    $timeout(function() {
                        el.clear();
                        el.refreshItems();
                        angular.forEach(newTargetTypes, function(value) {
                            el.addItem(value);
                        });
                    });
                });

                $scope.$on('reset', function() {
                    // $timeout used to avoid 'apply already in progress' error
                    $timeout(function() {
                        el.clear();  // Input box reset here with .clear(), view value reset in the controller
                    });
                });

                //Load initial values
                if ($ngModel.$modelValue instanceof Array){
                    angular.forEach($ngModel.$modelValue, function(value){
                        el.addItem(value.value);
                    });
                }
            });
        }
    };
}).directive('citingTypeKeywords', function($timeout) {
    return {
            restrict: 'A',
            require: '?ngModel',
            scope: {citingTypesToShow: '@'},
            link: function ($scope, element, attrs, $ngModel) {
                var optgroups = [];
                var options = [];
                var el = $(element).selectize()[0].selectize;

                $scope.$on($scope.citingTypesToShow, function(event, categories) {
                    angular.forEach(categories, function (cat) {
                        optgroups.push({value: cat.name, label: cat.name});
                        // Could just use el.addOptionGroup here instead, and have no optgroups array at all, but we might perhaps want to have this array in future
                        //el.addOptionGroup(cat.name, {label: cat.name});

                        angular.forEach(cat.keywords, function (kword) {
                            if(kword.hasOwnProperty('desc')) {
                                    options.push({text: kword.desc, value: kword.uri, optgroup: cat.name, $order: kword.desc});
                            }
                            else if(kword.hasOwnProperty('label')) {
                                    if(kword.label instanceof Array)
                                            options.push({text: kword.label[0].trim(), value: kword.uri, optgroup: cat.name, $order: kword.label[0].trim()});
                                    else if(kword.label !== undefined)
                                            options.push({text: kword.label.trim(), value: kword.uri, optgroup: cat.name, $order: kword.label.trim()});
                            }
                        });
                    });

                    // $timeout used to avoid 'apply already in progress' error
                    $timeout(function() {
                        for(var i = 0; i < optgroups.length; i++) {
                                el.addOptionGroup(optgroups[i].value, {label: optgroups[i].label});
                        }
                        el.load(function(func) {
                                func(options);
                        });
                    });

                    function applyChange() {
                        var selectedOptions = [];
                        var values = el.getValue();
                        angular.forEach(options, function (option) {
                                if (values.indexOf(option.value) >= 0) {
                                        selectedOptions.push(option);
                                }
                        });
                        $ngModel.$setViewValue(selectedOptions);
                    };
                    el.on('change', function () {
                        $timeout(function() {
                                $scope.$apply(applyChange);
                        });
                    });

                    $scope.$on('newCitingTypes', function(event, newCitingTypes) {
                        // $timeout used to avoid 'apply already in progress' error
                        $timeout(function() {
                                el.clear();
                                el.refreshItems();
                                angular.forEach(newCitingTypes, function(value) {
                                        el.addItem(value);
                                });
                        });
                    });

                    $scope.$on('reset', function() {
                        // $timeout used to avoid 'apply already in progress' error
                        $timeout(function() {
                                el.clear();  // Input box reset here with .clear(), view value reset in the controller
                        });
                    });

                    //Load initial values
                    if ($ngModel.$modelValue instanceof Array){
                        angular.forEach($ngModel.$modelValue, function(value){
                                el.addItem(value.value);
                        });
                    }
                });
            }
	};
}).directive('domainKeywords', function ($timeout) {
    return {
            restrict: 'A',
            require: '?ngModel',
            scope: {keywordsToShow: '@'},
            link: function ($scope, element, attrs, $ngModel) {
                var optgroups = [];
                var options = [];
                var el = $(element).selectize({
                    maxOptions: null,
                    onItemAdd: function(value) {
                        var updatedObj = $.extend({}, this.options[value], {text: this.options[value].textShort});
                        this.updateOption(value, updatedObj);
                    },
                    onItemRemove: function(value) {
                        var updatedObj = $.extend({}, this.options[value], {text: this.options[value].textLong});
                        this.updateOption(value, updatedObj);
                    }
                })[0].selectize;
            
                $scope.$on($scope.keywordsToShow, function(event, categories){
                    angular.forEach(categories, function (cat) {
                            optgroups.push({value: cat.name, label: cat.name + ' Keywords'});
                            // Could just use el.addOptionGroup here instead, and have no optgroups array at all, but we might perhaps want to have this array in future
                            //el.addOptionGroup(cat.name, {label: cat.name + ' Keywords'});
                            
                            angular.forEach(cat.keywords, function (kword) {
                                    if(kword.hasOwnProperty('desc')) {
                                        options.push({text: kword.desc, textLong: kword.desc, textShort: charme.logic.shortDomainLabel(kword.desc), value: kword.uri, optgroup: cat.name, $order: kword.desc});
                                    }
                                    else if(kword.hasOwnProperty('label')) {
                                        if(kword.label instanceof Array)
                                            options.push({text: kword.label[0], textLong: kword.label[0], textShort: charme.logic.shortDomainLabel(kword.label[0]), value: kword.uri, optgroup: cat.name, $order: kword.label[0].trim()});
                                        else
                                            options.push({text: kword.label, textLong: kword.label, textShort: charme.logic.shortDomainLabel(kword.label), value: kword.uri, optgroup: cat.name, $order: kword.label.trim()});
                                    }
                            });
                    });
                    
                    // $timeout used to avoid 'apply already in progress' error
                    $timeout(function() {
                        for(var i = 0; i < optgroups.length; i++) {
                            el.addOptionGroup(optgroups[i].value, {label: optgroups[i].label});
                        }
                        el.load(function(func) {
                            func(options);
                        });
                    });
                    
                    function applyChange() {
                            var selectedOptions = [];
                            var values = el.getValue();
                            angular.forEach(options, function (option) {
                                    if (values.indexOf(option.value) >= 0) {
                                            selectedOptions.push(option);
                                    }
                            });
                            $ngModel.$setViewValue(selectedOptions);
                    };
                    el.on('change', function () {
                        $timeout(function() {
                            $scope.$apply(applyChange);
                        });
                    });
                    
                    $scope.$on('newDomains', function(event, newDomains) {
                        // $timeout used to avoid 'apply already in progress' error
                        $timeout(function() {
                            //el.clear();
                            $timeout(function() {
                                // Input box reset here, view value reset in the controller
                                // Don't simply use el.clear(), as we must invoke our onItemRemove() function for each selected item
                                var items = el.getValue();
                                angular.forEach(items, function(item) {
                                    $timeout(function() {
                                        el.removeItem(item);
                                    });
                                });
                                
                                $timeout(function() { // $timeout, $timeout, everywhere...
                                    el.refreshItems();
                                    angular.forEach(newDomains, function(value) {
                                        el.addItem(value);
                                    });
                                });
                            });
                        });
                    });

                    $scope.$on('reset', function() {
                        // $timeout used to avoid 'apply already in progress' error
                        $timeout(function() {
                            // Input box reset here, view value reset in the controller
                            // Don't simply use el.clear(), as we must invoke our onItemRemove() function for each selected item
                            var items = el.getValue();
                            angular.forEach(items, function(item) {
                                $timeout(function() {
                                    el.removeItem(item);
                                });
                            });
                        });
                    });

                    //Load initial values
                    //Modified to load values on change
                    $scope.$parent.$watch(attrs.ngModel, function(){
                            $timeout(function(){
                                    if ($ngModel.$modelValue instanceof Array){
                                            angular.forEach($ngModel.$modelValue, function(value){
                                                    el.addItem(value.value);
                                            });
                                    }
                            });
                    });
                });
            }
    };
}).directive('motivationKeywords', function ($timeout) {
    return {
            restrict: 'A',
            require: '?ngModel',
            scope: {motivationsToShow: '@'},
            link: function ($scope, element, attrs, $ngModel) {
                var optgroups = [];
                var options = [];
                var el = $(element).selectize()[0].selectize;
                
                $scope.$on($scope.motivationsToShow, function(event, categories){
                    angular.forEach(categories, function (cat) {
                            optgroups.push({value: cat.name, label: cat.name});
                            // Could just use el.addOptionGroup here instead, and have no optgroups array at all, but we might perhaps want to have this array in future
                            //el.addOptionGroup(cat.name, {label: cat.name});
                            
                            angular.forEach(cat.keywords, function (kword) {
                                    if(kword.hasOwnProperty('desc')) {
                                        options.push({text: kword.desc, value: kword.uri, optgroup: cat.name, $order: kword.desc});
                                    }
                                    else if(kword.hasOwnProperty('label')) {
                                        if(kword.label instanceof Array)
                                            options.push({text: kword.label[0].trim(), value: kword.uri, optgroup: cat.name, $order: kword.label[0].trim()});
                                        else if(kword.label !== undefined)
                                            options.push({text: kword.label.trim(), value: kword.uri, optgroup: cat.name, $order: kword.label.trim()});
                                    }
                            });
                    });
                    
                    // $timeout used to avoid 'apply already in progress' error
                    $timeout(function() {
                        for(var i = 0; i < optgroups.length; i++) {
                            el.addOptionGroup(optgroups[i].value, {label: optgroups[i].label});
                        }
                        el.load(function(func) {
                            func(options);
                        });
                    });

                    function applyChange() {
                            var selectedOptions = [];
                            var values = el.getValue();
                            angular.forEach(options, function (option) {
                                    if (values.indexOf(option.value) >= 0) {
                                            selectedOptions.push(option);
                                    }
                            });
                            $ngModel.$setViewValue(selectedOptions);
                    };

                    el.on('change', function () {
                        $timeout(function() {
                            $scope.$apply(applyChange);
                        });
                    });

                    $scope.$on('newMotivations', function(event, newMotivations) {
                        // $timeout used to avoid 'apply already in progress' error due to el.on('change') function
                        $timeout(function() {
                            el.clear();
                            el.refreshItems();
                            angular.forEach(newMotivations, function(value) {
                                el.addItem(value);
                            });
                        });
                    });

                    $scope.$on('reset', function() {
                        // $timeout used to avoid 'apply already in progress' error due to el.on('change') function
                        $timeout(function() {
                            el.clear();  // Input box reset here with .clear(), view value reset in the controller
                        });
                    });

                    //Load initial values
                    //Modified to load values on change
                    $scope.$parent.$watch(attrs.ngModel, function(){
                            $timeout(function(){
                                    if ($ngModel.$modelValue instanceof Array){
                                            angular.forEach($ngModel.$modelValue, function(value){
                                                    el.addItem(value.value);
                                            });
                                    }
                            });
                    });
                });
            }
    };
})

.directive('validatedUri', function() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function ($scope, element, attrs, input) {
			$scope.$watch(attrs.ngModel, function() {
				input.$setValidity('validURI', !(input.$viewValue) || (input.$viewValue.length===0) || charme.logic.validURI(input.$viewValue));
			});
		}
	};
})

.directive('confirmBox', function() {
    return {
        restrict: 'A',
        scope: {
            content: '=',
            confirmFunc: '&onConfirm',
            cancelFunc: '&onCancel'
        },
        templateUrl: 'templates/confirmbox.html'
    };
});

