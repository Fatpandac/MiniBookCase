const app = getApp();

// 导入动画
const { scaleAnimation } = require('../../animation/scaleAnimation');
const { rotateAnimation } = require('../../animation/rotateAnimation');
const { moveAnimation } = require('../../animation/moveAnimation');

// 导入数据库接口
const { getUserData, updateUserData } = require('../../utils/dataBase');

// 导入 API 接口
const { searchBook } = require('../../utils/searchBook');

Page({
  data: {
    // 系统主题
    theme: app.globalData.theme,
    // 微信胶囊位置信息
    titleInfo: {},
    // 是否展示简介
    introEx: false,
    // 是否处于选择状态
    choice: false,
    /*
    inSearch ->
    0: 未在搜索状态
    1: 在搜索状态并且有结果
    2: 在搜索状态并且没有结果
    */
    inSearch: 0,
    // 控制 scrollview 移动点
    scrollTop: 0,
    // 滑动 scrollview 距离
    scrollPos: 0,
    // 是否展示录入框
    showInputCard: false,
    // 是否展示修改书籍卡片
    showModifyBookCard: false,
    // 是否展示修改笔记卡片
    showModifyNoteCard: false,
    // 是否可以移动 darwer
    enableMoveDarwer: true,
    // 输入的搜索书籍内容
    searchBookName: '',
    // 详细展示的书籍
    book: null,
    // 所有录入的书籍
    books: [],
    // 全部分类
    cateList: [],
    // 展示的书籍序号
    transformIdx: null,
    // 是否启动下拉刷新
    refreshing: false,
    // 是否可点击切换分类
    enableCate: true,
    // 书籍详情页面顶部文字透明度
    detailsTopTextOpacity: 0,
  },

  onLoad() {
    const topAnimation = moveAnimation(0, 1, 'y');

    this.setData({
      titleInfo: app.globalData.titleInfo,
    });

    // 获取用户数据
    getUserData()
      .then((res) => {
        if (res.isNewUser) {
          this.setData({
            cateList: res.cateList,
            topAnimation,
          });
        } else {
          const { books, cateList } = res;
          this.setData({
            books,
            cateList,
          });

          // 进入应用显示书籍卡片动画
          books.map((item) => (item.animation = moveAnimation(0, 1, 'y')));
          setTimeout(() => {
            this.setData({
              books,
              topAnimation,
            });
          }, 100);
        }

        return null;
      })
      .catch(() => {
        this.setData({
          topAnimation,
        });
        wx.showToast({
          title: '请求数据失败',
          icon: 'error',
          duration: 2000,
        });
      });
  },

  onShow() {
    // 获取 notes, cate 组件
    this.notesComp = this.selectComponent('#notes');
    this.cateComp = this.selectComponent('#cate');

    // 获取系统主题信息
    wx.onThemeChange((res) => {
      this.setData({
        theme: res.theme,
      });
    });

    // 设置左滑菜单
    this.setData({
      slideButtons: [
        {
          extClass: 'no_sign',
          text: '不标记',
        },
        {
          extClass: 'readed_btn',
          text: '已读',
        },
        {
          extClass: 'reading_btn',
          text: '在读',
        },
      ],
    });
  },

  // 新建 cate
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
          updateUserData({
            books: that.data.books,
            cateList,
          })
            .then(() => {
              that.setData({
                cateList,
              });

              return null;
            })
            .catch(() => {
              wx.showToast({
                title: '上传数据失败',
                icon: 'error',
                duration: 1000,
              });
            });
        }
      },
    });
  },

  // 添加到 cate
  addIntoCate(e) {
    const { cate } = e.detail;
    const nowCate = this.cateComp.data.cateText;
    let books = this.data.books;

    books.map((item) => {
      if (item.isChecked) {
        item.cate = cate;
      }

      return item;
    });

    if (['全部书籍', '已读', '在读'].indexOf(nowCate) < 0) {
      books = this._displayByCate(books, nowCate);
    }

    updateUserData({
      books,
    })
      .then(() => {
        this.setData({
          books,
          showChooseCate: !this.data.showChooseCate,
        });
        this.topsuccess();

        return null;
      })
      .catch(() => {
        wx.showToast({
          title: '上传数据失败',
          icon: 'error',
          duration: 1000,
        });
      });
  },

  // 选择 cate
  chooseCate() {
    const cateList = this.cateComp.data.cateList;
    this.setData({
      showChooseCate: !this.data.showChooseCate,
      cateList,
    });
  },

  cateChooseDone() {
    this.setData({
      showChooseCate: !this.data.showChooseCate,
    });
  },

  // cate books 更新
  cateChangeBooks(e) {
    const { books, cateList } = e.detail;

    cateList.map((item) => {
      item.isChoose = false;

      return item;
    });

    updateUserData({
      books,
      cateList,
    })
      .then(() => {
        this.setData({
          books,
          cateList,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          title: '上传数据失败',
          icon: 'error',
          duration: 1000,
        });
      });
  },

  _displayByCate(books, cate) {
    books.map((item) => {
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

    return books;
  },

  // 展示 cate
  showCate() {
    this.cateComp.showCate();
  },

  switchMoveDarwer() {
    this.setData({
      enableMoveDarwer: !this.data.enableMoveDarwer,
    });
  },

  // 修改 note
  modifyNote(e) {
    const { modifyNoteIdx } = e.detail;

    this.setData({
      showModifyNoteCard: true,
      modifyNoteIdx,
    });
  },

  // 确认修改 note
  subModifyNote(e) {
    const { desc, line, page } = e.detail.value;
    const note = {
      desc,
      page,
      line,
      date: parseInt(new Date().getTime() / 1000, 10),
    };
    const { books, book } = this.data;

    // 检查内容是否合规
    if (!this.notesComp._checkNoteInRule(note)) return;

    book.notes[this.data.modifyNoteIdx] = note;
    books[this.data.transformIdx].notes = book.notes;

    updateUserData({
      books,
      cateList: this.data.cateList,
    })
      .then(() => {
        this.setData({
          books,
          book,
          showModifyNoteCard: false,
          modifyNoteIdx: null,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          title: '上传数据失败',
          icon: 'error',
          duration: 1000,
        });
      });
  },

  // 取消修改 note
  cancelModifyNote() {
    this.setData({
      showModifyNoteCard: false,
      modifyNoteIdx: null,
    });
  },

  // 上传 note 事件
  updateNote(e) {
    const index = this.data.transformIdx;
    const { updateBook } = e.detail;
    const books = this.data.books;
    let book = books[index];
    book = updateBook;
    books[index] = updateBook;

    updateUserData({
      books,
      cateList: this.data.cateList,
    })
      .then(() => {
        this.setData({
          books,
          book,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          title: '上传数据失败',
          icon: 'error',
          duration: 1000,
        });
      });
  },

  // 左滑点击事件
  async slideButtonTap(e) {
    const choose = e.detail.index;
    const { index } = e.currentTarget.dataset;
    const cateList = this.data.cateList;
    const cate = this.cateComp.data.cateText;
    const books = this.data.books;

    books[index].status = choose;
    books[index].showSlide = false;

    if (['在读', '已读'].indexOf(cate) >= 0) {
      books.map((item) => {
        if (cate === '在读') {
          if (item.status !== 2) {
            item.display = false;
          }
        } else if (cate === '已读') {
          if (item.status !== 1) {
            item.display = false;
          }
        }

        return item;
      });
    }

    cateList.map((item) => {
      if (item.text === '全部书籍') {
        item.count = books.length;
      } else if (item.text === '在读') {
        item.count = books.filter((el) => el.status === 2).length;
      } else if (item.text === '已读') {
        item.count = books.filter((el) => el.status === 1).length;
      } else {
        item.count = books.filter((el) => el.cate === item.text).length;
      }

      return item;
    });

    // 如果选择不合法则退出
    if ([0, 1, 2].indexOf(choose) < 0) return;

    updateUserData({
      books,
      cateList,
    })
      .then(() => {
        this.setData({
          books,
          cateList,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          title: '上传数据失败',
          icon: 'error',
          duration: 1000,
        });
      });
  },

  async closeOtherSlide(e) {
    const showIndex = e.currentTarget.dataset.index;
    const books = this.data.books;

    books.map((item, index) => {
      item.showSlide = index === showIndex;

      return item;
    });

    this.setData({
      books,
    });
  },

  closeThisSlide(e) {
    const showIndex = e.currentTarget.dataset.index;
    const books = this.data.books;

    if (books[showIndex].showSlide) {
      books[showIndex].showSlide = false;
    }

    this.setData({
      books,
    });
  },

  closeAllSlideview() {
    const books = this.data.books;

    books.map((item) => {
      item.showSlide = false;

      return item;
    });

    this.setData({
      books,
    });
  },

  // 监听滑动 scrollview
  listenScroll(e) {
    this.setData({
      scrollPos: e.detail.scrollTop,
    });
  },

  // 实现书籍详情页面动态显示文字
  listenDetailsScroll() {
    const query = wx.createSelectorQuery();
    query
      .select('#book_name')
      .boundingClientRect((rect) => {
        this.setData({
          detailsTopTextOpacity:
            rect.top < this.data.titleInfo.bottom + 10
              ? Math.abs((this.data.titleInfo.bottom + 10 - rect.top) / rect.height)
              : 0,
        });
      })
      .exec();
  },

  // 返回顶层按钮响应事件
  topping() {
    this.setData({
      scrollIndexTop: 0,
    });
  },

  // 书本列表下拉刷新事件
  refreshBooks() {
    // 处于选择或是搜索状态下时无法进行刷新
    if (this.data.choice || this.data.inSearch !== 0) {
      this.setData({
        refreshing: false,
      });

      return;
    }

    // 在刷新则退出
    if (this._refreshing) return;

    this._refreshing = true;
    wx.vibrateShort({
      type: 'medium',
    });
    getUserData()
      .then((res) => {
        if (res.isNewUser) return null;
        const cate = this.cateComp.data.cateText;
        const { cateList } = res;
        let books = res.books;

        books = this._displayByCate(books, cate);
        books.map((item, index, self) => {
          item.animation = moveAnimation(-20 * (self.length - index - 1), 0.2, 'y', 500);

          return item;
        });

        this.setData({
          books,
          cateList,
          refreshing: false,
        });

        // 进入应用显示书籍卡片动画
        books.map((item) => (item.animation = moveAnimation(0, 1, 'y')));
        setTimeout(() => {
          this.setData({
            books,
            refreshing: false,
          });
        }, 500);

        return null;
      })
      .catch(() => {
        this.setData({
          refreshing: false,
        });
        wx.showToast({
          title: '请求数据失败',
          icon: 'error',
          duration: 2000,
        });
      });
    this._refreshing = false;
  },

  // 点击圆圈事件
  circle(e) {
    const key = e.currentTarget.dataset.key;
    const books = this.data.books;
    books[key].isChecked = !books[key].isChecked;
    this.setData({
      books,
    });
  },

  // 添加书籍事件
  searchBookByISBN(isbn) {
    searchBook(isbn)
      .then((res) =>
        this.setData({
          book: res.book,
          showInputCard: true,
        })
      )
      .catch(() => {
        wx.showToast({
          title: '未找到该书籍',
          icon: 'error',
          duration: 2000,
        });
      });
  },

  chooseAddOrOpen(choose, sameBook, isbn) {
    const addBook = choose.tapIndex === 0;
    const openBook = choose.tapIndex === 1;
    if (addBook) {
      this.searchBookByISBN(isbn);
    } else if (openBook) {
      const book = sameBook.pop();
      this.setData({
        book,
        transformIdx: book.index,
        scrollTop: null,
        click: true,
      });
    }
  },

  haveSameBookChoose(sameBook, isbn) {
    wx.showActionSheet({
      alertText: '已经有相同书籍',
      itemList: ['继续添加', '打开该书'],
    })
      .then((choose) => {
        this.chooseAddOrOpen(choose, sameBook, isbn);

        return null;
      })
      .catch(() => {});
  },

  _checkHaveSameBook(isbn) {
    const sameBook = this.data.books
      .map((item, index) => {
        item.index = index;

        return item;
      })
      .filter((item) => item.isbn === isbn);

    return {
      haveSameBook: sameBook.length > 0,
      sameBook,
    };
  },

  addBookByInput() {
    wx.showModal({
      title: '请输入书本的 ISBN 码',
      editable: true,
      placeholderText: '输入 ISBN 码',
    })
      .then((e) => {
        if (e.cancel) return null;

        const isbn = e.content;
        const { haveSameBook, sameBook } = this._checkHaveSameBook(isbn);

        if (haveSameBook) {
          this.haveSameBookChoose(sameBook, isbn);
        } else {
          this.searchBookByISBN(isbn);
        }

        return null;
      })
      .catch(() => {});
  },

  addBook() {
    const that = this;
    this.closeAllSlideview();
    wx.scanCode()
      .then((res) => {
        const isbn = res.result;
        const { haveSameBook, sameBook } = that._checkHaveSameBook(isbn);

        if (haveSameBook) {
          this.haveSameBookChoose(sameBook, isbn);
        } else {
          this.searchBookByISBN(isbn);
        }

        return null;
      })
      .catch((e) => {
        if (e.errMsg === 'scanCode:fail cancel') return;

        wx.showModal({
          content: '扫码失败，请尝试手动输入',
          success(e) {
            if (e.cancel) return;

            that.addBookByInput();
          },
        });
      });
  },

  // 取消书籍添加事件
  cancelBookInfo() {
    this.setData({
      book: null,
      showInputCard: false,
    });
  },

  // 确认书籍添加事件
  submitBook(e) {
    const books = this.data.books;
    const book = this.data.book;
    const cate = this.cateComp.data.cateText;

    // 将编辑信息赋值到对应属性中
    book.author = e.detail.value.author;
    book.name = e.detail.value.name;
    book.desc = e.detail.value.desc;
    book.position = e.detail.value.position;
    book.display = true;
    book.showSlide = false;
    book.notes = [];
    book.cate = cate;
    book.date = parseInt(new Date().getTime() / 1000, 10);
    books.push(book);

    updateUserData({
      books,
      cateList: this.data.cateList,
    })
      .then(() => {
        this.setData({
          books,
          book: null,
          scrollIndexTop: 0,
          showInputCard: false,
          toppingAnimation: moveAnimation(400, 0, 'y', 500),
        });
        setTimeout(() => {
          this._onSubmit = false;
        }, 1000);

        return null;
      })
      .catch(() => {
        this.setData({
          book: null,
          showInputCard: false,
        });
        wx.showToast({
          title: '上传数据失败',
          icon: 'error',
          duration: 1000,
        });
        setTimeout(() => {
          this._onSubmit = false;
        }, 1000);
      });
  },

  subBookInfo(e) {
    if (!this._onSubmit) {
      this._onSubmit = true;
      this.submitBook(e);
    }
  },

  // 点击书籍事件
  bookInformation(e) {
    const index = e.currentTarget.dataset.key;
    const books = this.data.books;
    const haveBookOnShowSlide = books.filter((item) => item.showSlide).length;
    if (!haveBookOnShowSlide) {
      const book = books[index];
      this.setData({
        scrollTop: null,
        click: true,
        topAnimation: moveAnimation(-400, 0, 'y'),
        book,
        transformIdx: index,
      });
      wx.hideTabBar({
        animation: true,
      });
    } else {
      this.setData({
        books: this.data.books.map((item) => {
          item.showSlide = false;

          return item;
        }),
      });
    }
  },

  // 进入修改书籍
  gotoModifyBook() {
    this.setData({
      showModifyBookCard: true,
    });
  },

  // 退出修改书籍
  cancelBookModify() {
    this.setData({
      showModifyBookCard: false,
      book: this.data.book,
    });
  },

  // 确认书籍修改
  subBookModify(e) {
    const modifyValue = e.detail.value;
    const book = this.data.book;

    book.name = modifyValue.name;
    book.author = modifyValue.author;
    book.position = modifyValue.position;
    book.desc = modifyValue.desc;

    const books = this.data.books;
    books[this.data.transformIdx] = book;

    updateUserData({
      books,
      cateList: this.data.cateList,
    })
      .then(() => {
        this.setData({
          books,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          title: '上传数据失败',
          icon: 'error',
          duration: 1000,
        });
      });

    this.setData({
      showModifyBookCard: false,
    });
  },

  // 返回上级页面
  returnPage() {
    const cate = this.cateComp.data.cateText;
    let books = this.data.books;
    if (this.data.inSearch && !this.data.click) {
      books = this._displayByCate(books, cate);
      books = books.map((item) => {
        item.showSlide = false;

        return item;
      });

      this.setData({
        books,
        book: null,
        click: false,
        inSearch: 0,
        searchBookName: '',
        transformIdx: null,
        enableCate: true,
        // 初始化简介展开按钮
        introEx: false,
        vectorAnimation: rotateAnimation(0),
      });
    } else {
      this.notesComp.resetData();
      this.setData({
        book: null,
        click: false,
        // 初始化简介展开按钮
        scrollTop: 0,
        introEx: false,
        vectorAnimation: rotateAnimation(0),
        topAnimation: moveAnimation(0, 1, 'y', 0),
      });
    }
    wx.showTabBar({
      animation: true,
    });
  },

  // 阻止左滑退出
  holdPageContainer() {
    if (!(this.data.showModifyBookCard || this.data.showModifyNoteCard)) return;
    this.setData({
      click: true,
    });
  },

  // 右滑退出
  returnBySlide() {
    // 如果 darwer 显示则不退出
    if (this.data.showModifyBookCard || this.data.showModifyNoteCard) return;

    this.notesComp.resetData();
    this.setData({
      book: null,
      click: false,
      // 初始化简介展开按钮
      transformIdx: null,
      scrollTop: 0,
      introEx: false,
      vectorAnimation: rotateAnimation(0),
      topAnimation: moveAnimation(0, 1, 'y', 0),
    });
    wx.showTabBar({
      animation: true,
    });
  },

  //   点击展开简介
  IntroductionExpansion() {
    this.setData({
      introEx: !this.data.introEx,
      vectorAnimation: rotateAnimation(this.data.introEx ? 0 : -180),
    });
  },

  // 长按书籍卡片事件
  longPressBookCard() {
    const books = this.data.books;
    const haveOpenSlideview = books.filter((item) => item.showSlide).length;

    if (haveOpenSlideview) {
      books.map((item) => {
        item.showSlide = false;

        return item;
      });
      this.setData({
        books,
      });

      return;
    }
    // 如果长按时火箭处于显示状态则隐藏
    if (this._toppingIsShow) {
      this.setData({
        toppingAnimation: moveAnimation(150, 0, 'y'),
      });
    }
    wx.hideTabBar({
      animation: true,
    });
    this.setData({
      books: this.data.books.map((item) => {
        item.showSlide = false;
        item.disableSlideview = true;

        return item;
      }),
      topAnimation: moveAnimation(-400, 0, 'y'),
      topSuccessAnimation: moveAnimation(0, 1, 'y'),
      bottomAnimation: moveAnimation(0, 1, 'y'),
    });
    setTimeout(() => {
      this.setData({
        choice: true,
      });
    }, 250);
  },

  // 重置书籍信息的 isChecked 属性
  resetIsChecked(books) {
    books.map((item) => {
      item.isChecked = false;
      item.disableSlideview = false;

      return item;
    });

    return books;
  },

  topsuccess() {
    let books = this.data.books;
    books = this.resetIsChecked(books);

    // 如果完成时火箭处于显示状态时则显示
    if (this._toppingIsShow) {
      this.setData({
        toppingAnimation: moveAnimation(0, 1, 'y', 500),
      });
    }
    this.setData({
      books,
      topAnimation: moveAnimation(0, 1, 'y'),
      topSuccessAnimation: moveAnimation(-400, 0, 'y'),
      circleAnimation: scaleAnimation(0.001),
      bottomAnimation: moveAnimation(400, 0, 'y'),
    });

    setTimeout(() => {
      this.setData({
        choice: false,
        circleAnimation: null,
      });
      wx.showTabBar({
        animation: true,
      });
    }, 250);
  },

  // 删除卡片
  bottomDelete() {
    const that = this;
    const books = that.data.books;
    const cateList = that.data.cateList;
    const delList = books
      .map((item, index) => (item.isChecked ? index : -1))
      .filter((item) => item !== -1);
    wx.showModal({
      content: `是否彻底删除这${delList.length}本书籍`,
      confirmColor: '#EC6C74',
      success(res) {
        if (!res.confirm) return;
        const delBookCardAnimation = (books, delList) => {
          delList.map((item) => (books[item].animation = moveAnimation(0, 0, 'y')));

          return books;
        };
        const delBooks = delBookCardAnimation(books, delList);
        that.setData({
          books: delBooks,
          topAnimation: moveAnimation(0, 1, 'y'),
          topSuccessAnimation: moveAnimation(-400, 0, 'y'),
          bottomAnimation: moveAnimation(400, 0, 'y'),
        });
        const deletedBooks = books.filter((item) => !item.isChecked);
        setTimeout(() => {
          updateUserData({
            books: deletedBooks,
            cateList,
          })
            .then(() => {
              that.setData({
                books: that.resetIsChecked(deletedBooks),
                choice: false,
              });

              return null;
            })
            .catch(() => {
              that.setData({
                books: that.resetIsChecked(books),
                choice: false,
              });
              wx.showToast({
                title: '上传数据失败',
                icon: 'error',
                duration: 1000,
              });
            });
        }, 100);
      },
    });
  },

  // 监听搜索输入框输入
  inputting(e) {
    this.setData({
      searchBookName: e.detail.value,
    });
  },

  // 搜索事件
  search() {
    const searchValue = this.data.searchBookName;
    if (searchValue !== '') {
      const cate = this.cateComp.data.cateText;
      let books = this.data.books;
      let inSearch = 2;

      books = this._displayByCate(books, cate);

      const searchResult = books.map((item) => {
        item.showSlide = false;

        if (item.name.toLowerCase().indexOf(searchValue.toLowerCase()) < 0) {
          item.display = false;
        }

        if (item.display) {
          inSearch = 1;
        }

        return item;
      });

      this.setData({
        inSearch,
        enableCate: false,
        books: searchResult,
      });
    }
  },
});
