const app = getApp();

Component({
  properties: {
    books: {
      type: Array,
      value: [],
    },
    cateList: {
      type: Array,
      value: [],
    },
    enable: {
      type: Boolean,
      value: true,
    },
  },

  data: {
    show: false,
    scrollPos: 0,
    cateText: '全部书籍',
  },

  observers: {
    books(e) {
      if (e.length <= 0) return;
      const cateList = this.data.cateList.map((item) => {
        if (item.text === '全部书籍') {
          item.count = e.length;
        } else if (item.text === '在读') {
          item.count = e.filter((el) => el.status === 2).length;
        } else if (item.text === '已读') {
          item.count = e.filter((el) => el.status === 1).length;
        } else {
          item.count = e.filter((el) => el.cate === item.text).length;
        }

        return item;
      });

      this.setData({
        cateList,
      });
    },
  },

  lifetimes: {
    attached() {
      this.setData({
        titleInfo: app.globalData.titleInfo,
      });
    },
  },

  methods: {
    showCate() {
      if (!this.data.enable) return;

      this.setData({
        cateList: this.data.cateList.map((item) => {
          item.isChoose = false;

          return item;
        }),
        show: !this.data.show,
        onEdit: false,
      });
    },

    renameCate(e) {
      const { cate, newCateName, index } = e.detail;
      const { cateText, cateList, books } = this.data;

      cateList[index].text = newCateName;
      books.map((item) => {
        if (item.cate === cate) {
          item.cate = newCateName;
        }

        return item;
      });

      this.triggerEvent('change', {
        books,
        cateList,
      });

      this.setData({
        onEdit: !this.data.onEdit,
      });

      // 修改的不是当前分类则退出
      if (cateText !== cate) return;
      this.setData({
        cateText: newCateName,
      });
    },

    switchCate(e) {
      const { cate } = e.detail;

      const books = this.data.books.map((item) => {
        if (cate === '全部书籍') {
          item.display = true;
        } else if (cate === '在读') {
          item.display = item.status === 2;
        } else if (cate === '已读') {
          item.display = item.status === 1;
        } else {
          item.display = item.cate === cate;
        }

        return item;
      });

      this.setData({
        show: !this.data.show,
        cateText: cate,
      });

      this.triggerEvent('change', {
        books,
        cateList: this.data.cateList,
      });
    },

    chooseCate(e) {
      const { index } = e.detail;
      const cateList = this.data.cateList;

      if ([0, 1, 2].indexOf(index) < 0) {
        cateList[index].isChoose = !cateList[index].isChoose;

        this.setData({
          cateList,
        });
      }
    },

    editCate() {
      this.setData({
        onEdit: !this.data.onEdit,
      });
    },

    quitEdit() {
      const cateList = this.data.cateList.map((item) => {
        item.isChoose = false;

        return item;
      });
      this.setData({
        onEdit: !this.data.onEdit,
        cateList,
      });
    },

    addCate() {
      const that = this;
      const cateList = this.data.cateList;

      wx.showModal({
        title: '新建分类',
        editable: true,
        success(e) {
          if (!e.confirm) return;

          const cate = e.content.trim();
          if (/^\s+$/.test(cate) || cate.length === 0) {
            wx.showModal({
              title: '创建分类失败',
              content: '分类名不能为空，请重新输入',
              success(e) {
                if (!e.confirm) return;

                that.addCate();
              },
            });
          } else {
            const haveSameCate = cateList.map((item) => item.text).indexOf(cate) >= 0;

            if (haveSameCate) {
              wx.showToast({
                title: '已存在该分类',
                icon: 'error',
                duration: 1000,
              });

              return;
            }

            const cateItem = {
              text: cate,
              count: 0,
            };

            cateList.push(cateItem);

            that.triggerEvent('change', {
              books: that.data.books,
              cateList,
            });

            that.setData({
              cateList,
              onEdit: false,
            });

            setTimeout(() => {
              that.setData({
                scrollPos: 10000,
              });
            }, 100);
          }
        },
      });
    },

    delCate() {
      const that = this;
      const books = this.data.books;
      const cateList = this.data.cateList;
      const cateText = this.data.cateText;
      const delCateList = cateList.filter((item) => item.isChoose).map((item) => item.text);
      const deletedCateList = cateList.filter((item) => !item.isChoose);

      // 没有选中删除对象就直接退出
      if (delCateList.length === 0) return;

      const maxCountItemDelCate = cateList
        .map((item) => {
          if (item.isChoose) {
            return item.count;
          }
          return 0;
        })
        .reduce((a, b) => a + b);
      if (maxCountItemDelCate) {
        wx.showModal({
          content: '是否删除这些分类',
          confirmColor: '#EC6C74',
          success(res) {
            if (!res.confirm) return;

            books.map((item) => {
              if (delCateList.indexOf(item.cate) >= 0) {
                delete item.cate;
              }

              return item;
            });

            that.triggerEvent('change', {
              books,
              cateList: deletedCateList,
            });

            that.setData({
              onEdit: !that.data.onEdit,
              show: !that.data.show,
            });

            // 删除的不是当前分类直接结束
            if (delCateList.indexOf(cateText) < 0) return;

            that.setData({
              cateText: cateList[0].text,
              books: books.map((item) => {
                item.display = true;

                return item;
              }),
            });
          },
        });
      } else {
        books.map((item) => {
          if (delCateList.indexOf(item.cate) >= 0) {
            delete item.cate;
          }

          return item;
        });

        this.triggerEvent('change', {
          books,
          cateList: deletedCateList,
        });

        this.setData({
          onEdit: !this.data.onEdit,
          show: !this.data.show,
        });

        // 删除的不是当前分类直接结束
        if (delCateList.indexOf(cateText) < 0) return;

        this.setData({
          cateText: cateList[0].text,
          books: books.map((item) => {
            item.display = true;

            return item;
          }),
        });
      }
    },
  },
});
