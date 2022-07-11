Component({
  properties: {
    extStyle: {
      type: String,
      value: '',
    },
    cateList: {
      type: Array,
      value: [],
    },
    onEdit: {
      type: Boolean,
      value: false,
    },
    showAll: {
      type: Number,
      value: true,
    },
    scrollPos: {
      type: Number,
      value: 0,
    },
  },

  data: {},

  methods: {
    tapCateItem(e) {
      const { cate, index } = e.currentTarget.dataset;

      this.triggerEvent('choose', {
        cate,
        index,
      });
    },

    renameCate(e) {
      const that = this;
      const cateList = this.data.cateList;
      const { cate, index } = e.currentTarget.dataset;

      wx.showModal({
        title: '新分类名',
        editable: true,
        success(e) {
          if (!e.confirm) return;

          const newCateName = e.content;
          if (/^\s+$/.test(newCateName) || newCateName.length === 0) {
            wx.showModal({
              title: '修改分类失败',
              content: '分类名不能为空，请重新输入',
              success(e) {
                if (!e.confirm) return;

                that.renameCate({
                  currentTarget: {
                    dataset: {
                      cate,
                      index,
                    },
                  },
                });
              },
            });
          } else {
            const cateTextList = cateList.map((item) => item.text);

            if (cateTextList.indexOf(newCateName) >= 0) {
              wx.showToast({
                title: '已存在该分类',
                icon: 'error',
                duration: 1000,
              });

              return;
            }

            that.triggerEvent('rename', {
              cate,
              index,
              newCateName,
            });
          }
        },
      });
    },
  },
});
