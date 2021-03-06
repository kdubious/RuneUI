﻿window.helpers = window.helpers || {};
window.mithril = window.mithril || {};
window.data = window.data || {};
window.modal = window.modal || {};

modal.turnoff = {
    vm: (function (info) {

        var vm = {};

        vm.off = function () {
            data.postData('/api/system', { poweroff: true });
        };

        vm.reboot = function () {
            data.postData('/api/system', { reboot: true });
        };

        vm.init = function () {
            $('#dialog').modal('show');
        };

        return vm;

    }()),
    controller: function () {
        modal.turnoff.vm.init();
    },
    view: function (ctrl) {
        return [m('.modal-dialog.modal-sm', [
                m('.modal-content', [
                    m('.modal-header', [
                        m('button.close[aria-hidden="true"][data-dismiss="modal"][type="button"]', '×'),
                        m('h4.modal-title[id="poweroff-modal-label"]', 'Turn off the player')
                    ]),
                    m('.modal-body.txtmid', [
                        m('button.btn.btn-primary.btn-lg.btn-block[data-dismiss="modal"][id="syscmd-poweroff"]', { onclick: modal.turnoff.vm.off }, [m('i.fa.fa-power-off.sx'), ' Power off']),
                        m('button.btn.btn-primary.btn-lg.btn-block[data-dismiss="modal"][id="syscmd-reboot"]', { onclick: modal.turnoff.vm.reboot }, [m('i.fa.fa-refresh.sx'), ' Reboot'])
                    ]),
                    m('.modal-footer', [
                        m('button.btn.btn-default.btn-lg[aria-hidden="true"][data-dismiss="modal"]', 'Cancel')
                    ])
                ])
        ])
        ];
    }
};

modal.resetmpd = {
    vm: (function (info) {

        var vm = {};

        vm.reset = function () {
            data.postData('/api/mpd', { reset: true });
        };

        vm.init = function () {
            $('#dialog').modal('show');
        };

        return vm;

    }()),
    controller: function () {
        modal.resetmpd.vm.init();
    },
    view: function (ctrl) {
        console.log('in resetmpd.view()');
        return [m('.modal-dialog',
            [m('.modal-content', [
                m('.modal-header', [
                    m('button.close[aria-hidden="true"][data-dismiss="modal"][type="button"]', '×'), m('h3.modal-title[id="mpd-config-defaults-label"]', 'Reset the configuration')
                ]),
                m('.modal-body',
                    [
                        m('p', ['You are going to reset the configuration to the default original values.', m('br'), ' You will lose any modification.'])
                    ]
                ),
                m('.modal-footer',
                    [' ', m('input[name="reset"][type="hidden"][value="1"]'),
                        m('button.btn.btn-default.btn-lg[aria-hidden="true"][data-dismiss="modal"]', 'Cancel'),
                        m('button.btn.btn-primary.btn-lg[data-dismiss="modal"]', { onclick: modal.resetmpd.vm.reset }, 'Continue')
                    ]
                )
            ])
            ])
        ];
    }
};

modal.removeSource = {
    vm: (function (info) {

        var vm = {};

        vm.remove = function () {
            console.log('reset');
            data.postData('/api/sources', {
                'source-umount': true,
                mount: source.vm.data.mount
            });
            m.route('/sources');
        };

        vm.init = function () {
            $('#dialog').modal('show');
        };

        return vm;

    }()),
    controller: function () {
        modal.removeSource.vm.init();
    },
    view: function () {
        return [
            m(".modal-dialog", [
                m(".modal-content", [
                    m(".modal-header", [
                        m("button.close[aria-hidden='true'][data-dismiss='modal'][type='button']", "×"),
                        m("h3.modal-title[id='source-delete-modal-label']", "Remove the mount")
                    ]),
                    m(".modal-body", [
                        m("p", "Are you sure you want to delete this mount?")
                    ]),
                    m(".modal-footer", [
                        m("button.btn.btn-default.btn-lg[aria-hidden='true'][data-dismiss='modal']", "Cancel"),
                        m("button.btn.btn-primary.btn-lg[data-dismiss='modal']", { onclick: modal.removeSource.vm.remove }, "Remove"),
                        m("input[name='mount[id]'][type='hidden'][value='']")
                    ])
                ])
            ])
        ];
    }
};

modal.unmountUSB = {
    vm: (function () {

        var vm = {};

        vm.current = m.prop('');

        vm.unmount = function () {
            data.postData('/api/sources', { 'usb-umount': vm.current() });
        };

        vm.init = function () {
            $('#dialog').modal('show');
        };

        return vm;

    }()),
    controller: function () {
        modal.unmountUSB.vm.init();
    },
    view: function (ctrl) {
        return [
            m(".modal-dialog", [
                m(".modal-content", [
                    m(".modal-header", [
                        m("button.close[aria-hidden='true'][data-dismiss='modal'][type='button']", "×"),
                        m("h4.modal-title[id='umount-modal-label']", "Safe USB unmount")
                    ]),
                    m(".modal-body", [
                        m("p", "Mount point:"),
                        m("pre", [m("span[id='usb-umount-name']", modal.unmountUSB.vm.current())]),
                        m("p", "Do you really want to safe unmount it?"),
                        m("input.form-control[id='usb-umount'][name='usb-umount'][type='hidden']", { value: modal.unmountUSB.vm.current() })
                    ]),
                    m(".modal-footer", [
                        m("button.btn.btn-default.btn-lg[aria-hidden='true'][data-dismiss='modal'][type='button']", "Cancel"),
                        m("button.btn.btn-primary.btn-lg[data-dismiss='modal']", { onclick: modal.unmountUSB.vm.unmount }, [m("i.fa.fa-times.sx"), "Unmount"])
                    ])
                ])
            ])
        ];
    }
};

modal.error = {
    vm: (function (info) {

        var vm = {};
      

        vm.showError = function (error) {
            vm.error = error;
        };

        vm.init = function () {
            vm.error = '';
            $('#dialog').modal('show');
        };

        return vm;

    }()),
    controller: function () {
        modal.error.vm.init();
    },
    view: function (ctrl) {
        return [m('.modal-dialog',
            [m('.modal-content', [
                m('.modal-header', [
                    m('button.close[aria-hidden="true"][data-dismiss="modal"][type="button"]', '×'), m('h3.modal-title[id="mpd-config-defaults-label"]', 'Reset the configuration')
                ]),
                m('.modal-body',
                    [
                        m('p', modal.error.vm.error)
                    ]
                ),
                m('.modal-footer',
                    [' ', m('input[name="reset"][type="hidden"][value="1"]'),
                        m('button.btn.btn-default.btn-lg[aria-hidden="true"][data-dismiss="modal"]', 'Close')
                    ]
                )
            ])
            ])
        ];
    }
};