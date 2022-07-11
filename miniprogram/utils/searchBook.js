const app = getApp();
const { cloudEnv } = require('../env/env');
const { moveAnimation } = require('../animation/moveAnimation');

const getBySelfHost = async (isbn) => {
  const res = await wx.cloud.callContainer({
    config: {
      env: cloudEnv,
    },
    path: `/isbn/${isbn}`,
    header: {
      'X-WX-SERVICE': 'douban',
      'content-type': 'application/json',
    },
    method: 'GET',
    data: '',
  });

  if (res.statusCode !== 200) {
    return {
      statuCode: res.statusCode,
    };
  }

  return {
    statusCode: res.statusCode,
    book: {
      name: res.data.data.title,
      author: res.data.data.author.join(','),
      desc: res.data.data.book_intro,
      photoUrl: res.data.data.cover_url,
      publishing: '',
      animation: moveAnimation(0, 1, 'y'),
      status: 0,
      isbn,
    },
  };
};

const searchBook = (isbn) =>
  new Promise((resolve, reject) => {
    wx.request({
      url: `https://api.jike.xyz/situ/book/isbn/${isbn}?apikey=${app.globalData.apiKey}`,
      success: async (res) => {
        if (res.data.data) {
          resolve({
            book: {
              name: res.data.data.name,
              author: res.data.data.author,
              desc: res.data.data.description,
              photoUrl: res.data.data.photoUrl,
              publishing: res.data.data.publishing,
              animation: moveAnimation(0, 1, 'y'),
              status: 0,
              isbn,
            },
          });
        } else {
          const res = await getBySelfHost(isbn);

          if (res.statusCode !== 200) reject();

          resolve({
            book: res.book,
          });
        }
      },
      fail: async () => {
        const res = await getBySelfHost(isbn);

        if (res.statusCode !== 200) reject();

        resolve({
          book: res.book,
        });
      },
    });
  });

module.exports = {
  searchBook,
};
