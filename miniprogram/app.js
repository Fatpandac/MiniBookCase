const { searchBookAPI } = require('./env/env');

App({
  globalData: {
    openId: null,
    apiKey: searchBookAPI,
  },

  onLaunch() {
    const that = this;
    // 云开发初始化
    wx.cloud.init({
      env: 'cloud1-5genntop5f72fc26',
      traceUser: true,
    });

    // 获取用户 openID
    wx.cloud.callFunction({
      name: 'getOpenid',
      success: (res) => {
        this.globalData.openId = res.result.openId;
      },
    });

    // 获取系统主题
    wx.getSystemInfo({
      success(res) {
        that.globalData.theme = res.theme;
      },
    });

    // 获取用户屏幕信息
    const device = wx.getSystemInfoSync();
    this.globalData.device = device;

    // 获取胶囊布局信息
    const titleInfo = wx.getMenuButtonBoundingClientRect();
    titleInfo.leftSpace = device.windowWidth - titleInfo.right;
    this.globalData.titleInfo = titleInfo;
  },
});
