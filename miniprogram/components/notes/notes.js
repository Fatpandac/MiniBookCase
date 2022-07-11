const { rotateAnimation } = require('../../animation/rotateAnimation');

Component({
  properties: {
    book: {
      type: null,
    },
    inputMaxLength: {
      type: Number,
      value: 200,
    },
  },

  data: {
    inputNote: '',
    page: '',
    line: '',
    inputLength: 0,
    inputCountColor: '#c5c5c5',
    showFoldList: [],
  },

  methods: {
    resetData() {
      this.setData({
        inputNote: '',
        page: '',
        line: '',
        inputLength: 0,
      });
    },

    hiddenBtn(e) {
      const showFoldList = this.data.showFoldList;
      const { showFold, index } = e.detail;

      showFoldList[index] = !showFold;

      this.setData({
        showFoldList,
      });
    },

    showFoldTap(e) {
      const index = e.currentTarget.dataset.showidx ?? e.detail.index;
      const book = this.data.book;
      if (book.notes[index].onFold) {
        book.notes[index].onFold = false;
        book.notes[index].animation = rotateAnimation(0);
      } else {
        book.notes[index].onFold = true;
        book.notes[index].animation = rotateAnimation(-180);
      }
      this.setData({
        book,
      });
    },

    notesInput(e) {
      const inputNote = e.detail.value;
      const lenght = e.detail.value.length;
      let color = this.data.inputCountColor;
      if (lenght > 180 && lenght <= 200) {
        color = 'gold';
      } else if (lenght > 200) {
        color = 'red';
      } else {
        color = '#c5c5c5';
      }
      this.setData({
        inputLength: lenght,
        inputCountColor: color,
        inputNote,
      });
    },

    _checkNoteInRule(note) {
      // 判断 page 为空
      if (note.page === '' && note.line !== '') {
        wx.showToast({
          icon: 'none',
          title: '页码不能为空',
        });

        return false;
      }

      // 判断 page 和 line 是不是数字
      const regIsNum = /^[0-9]+[.]?[0-9]*$/;
      if (note.page !== '' || note.line !== '') {
        const lineIsNumOrNoValue = regIsNum.test(note.line) || note.line === '';
        const pageIsNum = regIsNum.test(note.page);
        if (!(pageIsNum && lineIsNumOrNoValue)) {
          wx.showToast({
            icon: 'none',
            title: '页码和行号必须是数字',
          });

          return false;
        }
      }

      // 判断内容是否为空
      if (/^\s+$/.test(note.desc) || note.desc === '') {
        wx.showToast({
          icon: 'none',
          title: '笔记内容为空',
        });

        return false;
      }

      return true;
    },

    doneWriteNote(e) {
      const book = this.data.book;
      const notes = book.notes.map((item) => ({
        desc: item.desc,
        page: item.page,
        line: item.line,
        date: item.date,
      }));

      const note = {
        desc: this.data.inputNote,
        page: e.detail.value.page,
        line: e.detail.value.line,
        date: parseInt(new Date().getTime() / 1000, 10),
      };

      // 判断输入 note 内容是否符合规则
      if (!this._checkNoteInRule(note)) return;

      notes.push(note);
      book.notes = notes;
      this.triggerEvent('updateNote', {
        updateBook: book,
      });
      this.setData({
        inputNote: '',
        page: '',
        line: '',
        inputLength: 0,
        inputCountColor: '#c5c5c5',
      });
    },

    deleteNote(e) {
      const that = this;
      const book = this.data.book;
      const { delidx } = e.currentTarget.dataset;

      wx.showModal({
        content: '是否删除这条笔记',
        confirmColor: '#EC6C74',
        success(res) {
          if (res.confirm) {
            book.notes = book.notes.filter((_item, index) => index !== delidx);

            that.triggerEvent('updateNote', {
              updateBook: book,
            });
          }
        },
      });
    },

    modifyNote(e) {
      const { modifyidx } = e.target.dataset;

      this.triggerEvent('modify', {
        modifyNoteIdx: modifyidx,
      });
    },
  },
});
