const { DBenv } = require('../env/env');

const app = getApp();
const db = wx.cloud.database({
  env: DBenv,
});

const userData = db.collection('user_data');
const userReadTimeData = db.collection('read_time');

const getUserData = async () =>
  new Promise((resolve, reject) => {
    userData
      .where({
        _openid: app.globalData.openId,
      })
      .get({
        success: (res) => {
          if (res.data.length) {
            // 初始化空值，不同版本用户数据进行适配
            const books = res.data[0].books.map((item) => {
              item.isbn = item.isbn || null;
              item.status = item.status || 0;
              item.notes = item.notes || [];
              item.display = true;
              item.date = item.date || parseInt(new Date().getTime() / 1000, 10);

              return item;
            });

            // 计算分类内书籍个数
            const { cateList } = res.data[0];
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

            resolve({
              isNewUser: false,
              books,
              cateList,
            });
          } else {
            const initCateList = [{ text: '全部书籍' }, { text: '已读' }, { text: '在读' }];
            resolve({
              isNewUser: true,
              cateList: initCateList,
            });
          }
        },
        fail: () => {
          reject(new Error('Get data from database fail'));
        },
      });
  });

const updateUserData = (data) =>
  new Promise((resolve, reject) => {
    userData
      .where({
        _openid: app.globalData.openId,
      })
      .get({
        success: (res) => {
          const books = data.books.map((item) => ({
            name: item.name,
            author: item.author,
            publishing: item.publishing,
            photoUrl: item.photoUrl,
            position: item.position,
            desc: item.desc,
            isbn: item.isbn,
            status: item.status,
            notes: item.notes,
            cate: item.cate,
            date: item.date,
          }));
          const { cateList } = data;
          if (res.data.length) {
            const _id = res.data[0]._id;
            userData.doc(_id).update({
              data: {
                books,
                cateList,
              },
              success: () => resolve({ msg: 'Update success' }),
              fail: () => reject(new Error('Update fail')),
            });
          } else {
            const initCateList = [{ text: '全部书籍' }, { text: '已读' }, { text: '在读' }];
            userData.add({
              data: {
                books,
                cateList: initCateList,
              },
              success: () => resolve({ msg: 'Create data success' }),
              fail: () => reject(new Error('Create data fail')),
            });
          }
        },
        fail: () => reject(new Error("Con't link database")),
      });
  });

const getReadTime = () =>
  new Promise((resolve, reject) => {
    userReadTimeData
      .where({
        _openid: app.globalData.openId,
      })
      .get({
        success: (res) => {
          const { data } = res;
          if (data.length) {
            resolve({
              goal: res.data[0].goal,
              logs: res.data[0].logs,
            });
          } else {
            resolve({
              isNewUser: true,
              goal: 25,
            });
          }
        },
        fail: () => {
          reject(new Error('Get data from database fail'));
        },
      });
  });

const updateReadTime = (data) =>
  new Promise((resolve, reject) => {
    userReadTimeData
      .where({
        _openid: app.globalData.openId,
      })
      .get({
        success: (res) => {
          if (res.data.length) {
            const _id = res.data[0]._id;

            const { goal, logs } = data;
            userReadTimeData.doc(_id).update({
              data: {
                goal,
                logs,
              },
              success: () => resolve({ msg: 'Update success' }),
              fail: () => reject(new Error('Update fail')),
            });
          } else {
            const { goal, logs } = data;
            userReadTimeData.add({
              data: {
                goal,
                logs,
              },
              success: () => resolve({ msg: 'Create data success' }),
              fail: () => reject(new Error('Create data fail')),
            });
          }
        },
        fail: () => reject(new Error("Con't link database")),
      });
  });

module.exports = {
  getUserData,
  updateUserData,
  getReadTime,
  updateReadTime,
};
