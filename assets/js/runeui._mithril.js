﻿window.helpers = window.helpers || {};
window.mithril = window.mithril || {};

// MITHRIL HELPERS
// ----------------------------------------------------------------------------------------------------

// base 2-way binding helper
mithril.createInput = function(container, field, config, readonly, decode) {
    // container: for example 'mpd.vm.data.conf'
    // field: for example 'port or audio_mixer'
    // config: jQuery function to run after the item is in the DOM
    var attributes = {
        config: config,
        onchange: m.withAttr('value', function(value) { container[field] = value; }),
        value: (decode) ? helpers.decodeHtmlEntity(container[field]) : container[field]
    };

    if (readonly) {
        attributes.readonly = true;
    }

    return attributes;
};

mithril.createInputchecked = function(container, field, config) {
    // container: for example 'mpd.vm.data.conf'
    // field: for example 'port or audio_mixer'
    // config: jQuery function to run after the item is in the DOM
    return {
        config: config,
        onchange: m.withAttr('checked', function(value) {
            container[field] = value;
        }),
        checked: (function() {
            return container[field];
        }())
    };
};

mithril.createLabel = function(id, text) {
    return m('label.col-sm-2.control-label', { 'for': id }, text);
};

mithril.createYesNo = function(id, container, field, config, yestext, notext) {
    var yes = (yestext) ? yestext : 'ON';
    var no = (notext) ? notext : 'OFF';
    return m('label.switch-light.well', [
        m('input[id="' + id + '"][type="checkbox"]', mithril.createInputchecked(container, field)),
        m('span', [m('span', no), m('span', yes)]),
        m('a.btn.btn-primary')
    ]);
};

// createSelectYesNo('the-field', mpd.vm.data, 'the-field', selectpicker)
mithril.createSelectYesNo = function(id, container, field, config) {
    return m('select[data-style="btn-default btn-lg"][id="' + id + '"]',
        mithril.createInput(container, field), [
            m('option[value="true"]', 'enabled'),
            m('option[value="false"]', 'disabled')
        ]);
};

// createSelect('the-field', mpd.vm.data, 'list-field-with-oprions', selectpicker)
// createSelect('ao', mpd.vm.data, 'ao', 'acards', 'name', 'extlabel', selectpicker)
mithril.createSelect = function(id, container, field, list, valueField, displayField, config, decode) {
    return m('select[data-style="btn-default btn-lg"][id="' + id + '"]',
        mithril.createInput(container, field, helpers.selectpicker, decode), [
            container[list].map(function(item, index) {
                return m('option', { value: item[valueField] }, helpers.decodeHtmlEntity(item[displayField]));
            })
        ]);
};




mithril.showModal = function (module) {
    m.module(document.getElementById('dialog'), module);
}

// MITHRIL BASE CLASES FOR RUNE MODULES

// base view model
mithril.getViewModel = function(baseurl) {
    var vm = {};

    // properties of all our viewmodels
    var urlPrefix = '/api';
    vm.selector = baseurl;
    vm.url = urlPrefix + baseurl;
    vm.validate = function() {
        return true;
    };

    vm.onload = function (status) {
        return status;
    };

    // initialize the view model
    vm.init = function(id) {
        this.id = id;
        // property 'data' is defined on VM in teh call below
        data.getData(this, vm.onload);
        navigation.vm.navigate(baseurl); //this.url.replace(baseurl, ''));
    };
    
    // methods of all of view models
    vm.save = function(field) {
        if (vm.validate()) {
            if (field) {
                var d = {};
                d[field] = vm.data[field];
                data.postData(vm.url, d);
                console.log(d);
            } else {
                data.postData(vm.url, vm.data);
                console.log(vm.data);
            }

        } else {
            // validation failed
            alert('validation failed');
        }
    };

    vm.cancel = function(field) {
        if (field) {
            vm.data[field] = JSON.parse(JSON.stringify(vm.originalData[field]));
        } else {
            vm.data = JSON.parse(JSON.stringify(vm.originalData)); // we need a clone of this object
        }
    };
    
    vm.refresh = function() {
        vm.data = data.getData(this);
    };

    return vm;
};

// base controller
mithril.getController = function(vm) {
    var controller = function() {
        this.id = m.route.param('id');
        //TODO: Test this line below at some point:
        //    m.redraw.strategy("diff")

        vm.init(this.id);

        this.onunload = function () {
           // if (!confirm('Are you sure you want to leave this page?')) { e.preventDefault(); }
        };
    };
    return controller;
};

mithril.RuneModule = function(url) {
    var module = {};
    module.vm = new mithril.getViewModel(url);
    module.controller = new mithril.getController(module.vm);
    return module;
};