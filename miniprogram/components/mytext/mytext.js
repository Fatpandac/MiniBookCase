/**
 * 长文本内容展开与收起
 * @param {String} content  长文本内容
 * @param {Number} maxline  最多展示行数[只允许 1-5 的正整数]
 * @param {String} position  展开收起按钮位置[可选值为 left right]
 * @param {Boolean} foldable  点击长文本是否展开收起
 */

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    index: {
      type: Number,
    },
    content: {
      type: String,
      observer() {
        if (this.data.onReady) {
          setTimeout(() => this.checkFold(), 10);
        }
      },
    },
    maxline: {
      type: Number,
      value: 1,
      observer(value) {
        if (!/^[1-5]$/.test(value)) {
          throw new Error(`Maxline field value can only be digits (1-5), Error value: ${value}`);
        } else if (this.data.onReady) {
          setTimeout(() => this.checkFold(), 10);
        }
      },
    },
    position: {
      type: String,
      value: 'left',
    },
    foldable: {
      type: Boolean,
      value: true,
    },
    onFold: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    showFold: false,
    onReady: false,
  },
  lifetimes: {
    ready() {
      this.checkFold();
      this.data.onReady = true;
    },
  },
  methods: {
    checkFold() {
      const index = this.data.index;
      const query = wx.createSelectorQuery().in(this);
      query
        .selectAll('.showArea, .hideArea')
        .boundingClientRect((res) => {
          const showFold = Math.round(res[0].height) < Math.round(res[1].height);
          this.setData({
            showFold,
          });
          this.triggerEvent('hiddenBtn', {
            showFold,
            index,
          });
        })
        .exec();
    },
    handleFold() {
      const index = this.data.index;
      this.setData({
        onFold: !this.data.onFold,
      });
      this.triggerEvent('showFoldTap', {
        index,
      });
    },
  },
});
