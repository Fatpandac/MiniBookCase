const { moveAnimation } = require('../../animation/moveAnimation');

Component({
  properties: {
    scrollPos: {
      type: Number,
      observer(scrollPos) {
        if (scrollPos > 200 && !this._isShow) {
          this._isShow = true;
          this.setData({
            toppingAnimation: moveAnimation(0, 1, 'y', 500),
          });
        } else if (scrollPos > 10 && scrollPos < 200 && this._isShow) {
          this._isShow = false;
          this.setData({
            toppingAnimation: moveAnimation(400, 0, 'y', 500),
          });
        }
      },
    },
  },

  data: {},

  methods: {
    topping() {
      this.triggerEvent('tap', null, null);
      setTimeout(() => {
        this.setData({
          toppingAnimation: moveAnimation(150, 0, 'y'),
        });
      }, 500);
    },
  },
});
