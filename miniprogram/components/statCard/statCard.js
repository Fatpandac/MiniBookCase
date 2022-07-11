Component({
  properties: {
    cardName: {
      type: String,
      value: '卡片名字',
    },
    btnList: {
      type: Array,
      value: ['年', '月', '周'],
    },
    idx: {
      type: Number,
      value: 0,
    },
  },

  data: {},

  methods: {
    switchType(e) {
      const { idx } = e.currentTarget.dataset;

      this.setData({
        idx,
      });
      this.triggerEvent('switch', {
        idx,
        name: this.data.btnList[idx],
      });
    },
  },
});
