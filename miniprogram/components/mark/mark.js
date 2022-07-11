const { moveAnimation } = require('../../animation/moveAnimation');

Component({
  properties: {
    status: {
      type: Number,
      observer(status) {
        const { color, isHidden } = this.processStyle(status);
        const preIsHidden = this.data.isHidden;

        this.setData({
          markAnimation: preIsHidden ? null : moveAnimation(-100, 0, 'y'),
        });

        setTimeout(() => {
          this.setData({
            color,
            isHidden,
            markAnimation: isHidden ? null : moveAnimation(0, 1, 'y'),
          });
        }, 300 * !preIsHidden);
      },
    },
  },

  data: {},

  methods: {
    processStyle(status) {
      let color = null;
      let isHidden = true;

      if (status === 2) {
        color = '#00da09';
        isHidden = false;
      } else if (status === 1) {
        color = 'gold';
        isHidden = false;
      }

      return {
        color,
        isHidden,
      };
    },
  },
});
