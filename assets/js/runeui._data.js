﻿window.helpers = window.helpers || {};
window.data = window.data || {};

// base data loading function
data.getData = function(vm, onload) {
    var url = vm.url;
    if (vm.id) {
        url += '/' + vm.id;
    }
    helpers.toggleLoader('open');
    var loaderClose = function() {
        helpers.toggleLoader('close');
        if (onload) {
            onload(true);
        }
    };
    var loaderCloseFail = function(errormsg) {
        console.log('FAIL: ' + errormsg);
        error.vm.showError(errormsg, vm.selector);
        if (onload) {
            onload(false);
        }
    };
    // the standard Mithril syntax expects our service to return [], but ours returns {}
    m.request({
        method: 'GET',
        url: url,
        unwrapError: function (response) {
            return response.errormsg;
        }
    }).then(function (response) {
        vm.data = response;
        vm.originalData = JSON.parse(JSON.stringify(response)); // we need a clone of this object
    }).then(loaderClose, loaderCloseFail);
    
};

// base data saving function
data.postData = function(url, data) {
    console.log(url);
    console.log(data);
    helpers.toggleLoader('open', 'blocking');
    var loaderClose = function() {
        helpers.toggleLoader('close', 'blocking');
    };
    var loaderCloseFail = function() {
        console.log('FAIL');
    };
    m.request({
        method: 'POST',
        url: url,
        data: data,
        unwrapSuccess: function(response) {
            return response;
        },
        unwrapError: function(response) {
            return response.errormsg;
        },
        // PHP errors are not wrapped in Proper JSON,. breaking Mitrhil
        deserialize: function (value) {
            return value;
        }
    }).then(loaderClose, loaderCloseFail);
};
