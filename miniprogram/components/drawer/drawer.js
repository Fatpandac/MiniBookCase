const app = getApp();
const device = app.globalData.device;
let touchCancelBarStartY = 0;

const { moveAnimation } = require('../../animation/moveAnimation');
const {
  hideBackgroundAnimation,
  showBackgroundAnimation,
} = require('../../animation/backgroundAnimation');

Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer(show) {
        if (show) {
          this.setData({
            inputCardAnimation: moveAnimation(0, 1, 'y', 300),
            backgroundAnimation: showBackgroundAnimation(0, 0),
          });
        } else {
          this.setData({
            inputCardAnimation: moveAnimation(device.windowHeight + 200, 1, 'y', 300),
            backgroundAnimation: hideBackgroundAnimation(device.windowHeight + 200, 0),
          });
        }
      },
    },
    height: {
      type: String,
      value: '70vh',
    },
    showbar: {
      type: Boolean,
      value: true,
    },
    enableMove: {
      type: Boolean,
      value: true,
    },
  },

  data: {},

  methods: {
    touchStart(e) {
      touchCancelBarStartY = e.changedTouches[0].clientY;
    },

    touchMove(e) {
      const touchMoveDistance = touchCancelBarStartY - e.changedTouches[0].clientY;
      const isMoveDown = touchMoveDistance < 0;

      if (!this.data.showbar || !this.data.enableMove) return;

      if (isMoveDown) {
        this.setData({
          moveDistance: touchMoveDistance,
        });
      }
    },

    touchEnd(e) {
      const touchCancelBarEndY = e.changedTouches[0].clientY;
      const relativeDistance = touchCancelBarEndY - touchCancelBarStartY;
      const isCancelActionToCloseInfo = relativeDistance > 250;

      if (!this.data.showbar || !this.data.enableMove) return;

      if (isCancelActionToCloseInfo) {
        this.setData({
          book: null,
          showInputCard: false,
          inputCardAnimation: moveAnimation(device.windowHeight + 200, 1, 'y', 300),
          backgroundAnimation: hideBackgroundAnimation(device.windowHeight + 200, 0),
        });
        setTimeout(() => {
          this.setData({
            moveDistance: 0,
          });
          this.triggerEvent('change', {});
        }, 300);
      } else {
        this.setData({
          moveDistance: 0,
        });
      }
    },
  },
});
