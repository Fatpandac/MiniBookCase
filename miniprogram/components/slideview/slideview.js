/* eslint-disable */
const globalThis = this;
const self = this;
module.exports = require('../_commons/0.js')([
  {
    ids: [19],
    modules: {
      13(t, e, n) {
        t.exports = n(134);
      },
      134(t, e) {
        Component({
          options: {
            addGlobalClass: !0,
            multipleSlots: !0,
          },
          properties: {
            extClass: {
              type: String,
              value: '',
            },
            buttons: {
              type: Array,
              value: [],
              observer() {
                this.addClassNameForButton();
              },
            },
            disable: {
              type: Boolean,
              value: !1,
            },
            icon: {
              type: Boolean,
              value: !1,
            },
            show: {
              type: Boolean,
              value: !1,
            },
            duration: {
              type: Number,
              value: 350,
            },
            throttle: {
              type: Number,
              value: 40,
            },
            rebounce: {
              type: Number,
              value: 0,
            },
          },
          data: {
            size: null,
          },
          ready() {
            this.updateRight(), this.addClassNameForButton();
          },
          methods: {
            updateRight() {
              const t = this;
              const e = this.data;
              wx.createSelectorQuery()
                .in(this)
                .select('.left')
                .boundingClientRect(function (n) {
                  wx.createSelectorQuery()
                    .in(t)
                    .selectAll('.btn')
                    .boundingClientRect(function (o) {
                      t.setData({
                        size: {
                          buttons: o,
                          button: n,
                          show: e.show,
                          disable: e.disable,
                          throttle: e.throttle,
                          rebounce: e.rebounce,
                        },
                      });
                    })
                    .exec();
                })
                .exec();
            },
            addClassNameForButton() {
              const t = this.data;
              const e = t.buttons;
              const n = t.icon;
              e.forEach(function (t) {
                n
                  ? (t.className = '')
                  : t.type === 'warn'
                  ? (t.className = 'weui-slideview__btn-group_warn')
                  : (t.className = 'weui-slideview__btn-group_default');
              }),
                this.setData({
                  buttons: e,
                });
            },
            buttonTapByWxs(t) {
              this.triggerEvent('buttontap', t, {});
            },
            hide() {
              this.triggerEvent('hide', {}, {});
            },
            show() {
              this.triggerEvent('show', {}, {});
            },
            transitionEnd() {},
          },
        });
      },
    },
    entries: [[13, 0]],
  },
]);
