const app = getApp();
const { getUserData, getReadTime, updateReadTime } = require('../../utils/dataBase');
const chartOpts = require('./chartsData');

const monthName = {
  1: '一月',
  2: '二月',
  3: '三月',
  4: '四月',
  5: '五月',
  6: '六月',
  7: '七月',
  8: '八月',
  9: '九月',
  10: '十月',
  11: '十一月',
  12: '十二月',
};

const dayName = {
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  0: '星期日',
};

Page({
  data: {
    titleInfo: app.globalData.titleInfo,
    goal: 25,
    goalRange: Array.from(Array(1441).keys()).slice(5, 1441),
    books: [],
    logs: [],
    initReadTimeBtn: 2,
    initNewBookBtn: 2,
    todayChartData: chartOpts.todayChartData(),
    todayProcessOpts: chartOpts.todayProcessChartsOpts(),
    readTimeChartOpts: chartOpts.readTimeChartOpts(),
    newBookChartOpts: chartOpts.newBookChartOpts(),
    newBookChartData: {
      categories: [],
      series: [],
    },
    readTimeChartData: {
      categories: [],
      series: [],
    },
    dayProcess: [],
  },

  onShow() {
    getUserData()
      .then((res) => {
        const { books } = res;

        if (this.data.books.length === books.length) return null;

        const newBookChartData = this._statNewBookByWeek(books);
        this.setData({
          initNewBookBtn: this.data.initNewBookBtn,
          books,
          newBookChartData,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          icon: 'error',
          title: '加载数据失败',
        });
      });
    getReadTime()
      .then((res) => {
        const { goal, logs } = res;

        if (logs.length === this.data.logs.length) {
          if (goal === this.data.goal) return null;
        }

        const readTimeChartData = this._statReadTimeByWeek(logs, goal);
        this.setData({
          initReadTimeBtn: this.data.initReadTimeBtn,
          goal,
          logs,
          readTimeChartData,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          icon: 'error',
          title: '加载数据失败',
        });
      });
  },

  onShareAppMessage() {},

  export() {
    wx.showActionSheet({
      itemList: ['导出书籍数据', '导出阅读时间'],
      success(res) {
        const { tapIndex } = res;
        const callFunc = tapIndex === 0 ? 'exportBooksData' : 'exportReadTimeData';

        wx.showLoading({
          title: '生成文件中...',
          mask: true,
        });

        wx.cloud.callFunction({
          name: callFunc,
          data: {
            _openid: app.globalData.openId,
          },
          success: (res) => {
            const { fileID } = res.result;

            wx.showLoading({
              title: '下载文件中...',
              mask: true,
            });

            wx.cloud.downloadFile({
              fileID,
              success: (res) => {
                const fileManager = wx.getFileSystemManager();
                fileManager.saveFile({
                  tempFilePath: res.tempFilePath,
                  success: (res) => {
                    wx.hideLoading();

                    const filePath = res.savedFilePath;
                    wx.openDocument({
                      filePath,
                      showMenu: true,
                      fileType: 'xlsx',
                    });
                  },
                  fail: () => {
                    wx.hideLoading();

                    wx.showToast({
                      icon: 'error',
                      title: '导出失败',
                    });
                  },
                });
              },
              fail: () => {
                wx.hideLoading();

                wx.showToast({
                  icon: 'error',
                  title: '导出失败',
                });
              },
            });
          },
          fail: () => {
            wx.hideLoading();

            wx.showToast({
              icon: 'error',
              title: '导出失败',
            });
          },
        });
      },
    });
  },

  updateGoal(e) {
    const newGoal = parseInt(e.detail.value, 10) + 5;

    updateReadTime({
      goal: newGoal,
    })
      .then(() => {
        this._statReadTimeByWeek(this.data.logs, newGoal);
        this.setData({
          goal: newGoal,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          icon: 'error',
          title: '调整目标失败',
        });
      });
  },

  _getCurrentWeek() {
    const curr = new Date();
    const oneDayTimestamp = 60 * 60 * 24 * 1000;
    const oneHourTimestamp = 60 * 60 * 1000;
    const subtractDay = oneDayTimestamp * curr.getDay();
    const subtractHour = oneHourTimestamp * curr.getHours();
    const subtractMinutes = curr.getMinutes() * 60 * 1000;
    const startDateTime = new Date(curr.getTime() - subtractDay - subtractHour - subtractMinutes);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 24 * 6 * 1000);

    return {
      startDateTime,
      endDateTime,
    };
  },

  _statReadTimeByYear(readTimeData) {
    const readLog = readTimeData || this.data.logs;
    let yearCate = new Set();
    readLog.map((item) => {
      const date = new Date(item.startTime);
      yearCate.add(date.getFullYear());

      return null;
    });

    yearCate = Array.from(yearCate);

    const yearItemStat = new Array(yearCate.length).fill(0);
    readLog.map((item) => {
      const date = new Date(item.startTime);
      if (yearCate.indexOf(date.getFullYear()) < 0) return null;

      yearItemStat[yearCate.indexOf(date.getFullYear())] += Math.round(item.passTime / 1000 / 60);

      return null;
    });

    return chartOpts.readTimeChartData(yearCate, yearItemStat);
  },

  _statReadTimeByMonth(readTimeData) {
    const readLog = readTimeData || this.data.logs;

    let monthCate = Object.keys(monthName).map((item) => parseInt(item, 10));

    const monthItemStat = new Array(monthCate.length).fill(0);
    readLog.map((item) => {
      const date = new Date(item.startTime);
      if (monthCate.indexOf(date.getMonth() + 1) < 0) return null;

      monthItemStat[monthCate.indexOf(date.getMonth() + 1)] += Math.round(
        item.passTime / 1000 / 60
      );

      return null;
    });

    monthCate = monthCate.map((item) => monthName[item]);
    return chartOpts.newBookChartData(monthCate, monthItemStat);
  },

  _statReadTimeByWeek(readTimeData, goal = this.data.goal) {
    const readLog = readTimeData || this.data.logs;
    const { startDateTime, endDateTime } = this._getCurrentWeek();

    let dayCate = Object.keys(dayName).map((item) => parseInt(item, 10));

    let dayItemStat = new Array(dayCate.length).fill(0);
    readLog.map((item) => {
      const date = new Date(item.startTime + 8 * 60 * 1000);

      if (date < startDateTime || endDateTime < date) return null;
      if (dayCate.indexOf(date.getDay()) < 0) return null;

      dayItemStat[dayCate.indexOf(date.getDay())] += Math.round(item.passTime / 1000 / 60);

      return null;
    });

    const dayProcessList = {};
    dayCate.map((item, index) => (dayProcessList[item] = dayItemStat[index]));

    const process = dayProcessList[new Date().getDay()] / goal;
    const dayProcess = [];
    for (let i = 0; i < 7; i++) {
      dayProcess.push(dayProcessList[i] >= goal);
    }

    const processIsUpdate =
      (process >= 1 ? 1 : process.toFixed(2)) !== this.data.todayChartData.series[0].data;
    const dayProcessIsUpdate = dayProcess.toString() !== this.data.dayProcess.toString();
    if (processIsUpdate || dayProcessIsUpdate) {
      const numProcess = (process * 100).toFixed(0);
      this.setData({
        todayChartData: chartOpts.todayChartData(process >= 1 ? 1 : process.toFixed(2)),
        todayProcessOpts: chartOpts.todayProcessChartsOpts(
          `${numProcess >= 100 ? '已完成' : `${numProcess}%`}`
        ),
        dayProcess,
      });
    }

    dayCate = dayCate.map((item) => dayName[item]);
    if (dayCate.length === 0) {
      dayCate = Object.values(dayName);
      dayItemStat = new Array(dayCate.length).fill(0);
    }

    return chartOpts.readTimeChartData(dayCate, dayItemStat);
  },

  readTimeSwitch(e) {
    const { idx } = e.detail;
    let chartData = [];

    switch (idx) {
      case 0:
        chartData = this._statReadTimeByYear();
        break;
      case 1:
        chartData = this._statReadTimeByMonth();
        break;
      case 2:
        chartData = this._statReadTimeByWeek();
        break;
      default:
        break;
    }
    this.setData({
      readTimeChartData: chartData,
    });
  },

  _statNewBookByYear(booksData) {
    const books = booksData || this.data.books;
    let yearCate = new Set();
    books.map((item) => {
      const date = new Date(item.date * 1000);
      yearCate.add(date.getFullYear());

      return null;
    });

    yearCate = Array.from(yearCate);

    const yearItemStat = new Array(yearCate.length).fill(0);
    books.map((item) => {
      const date = new Date(item.date * 1000);
      if (yearCate.indexOf(date.getFullYear()) < 0) return null;

      yearItemStat[yearCate.indexOf(date.getFullYear())]++;

      return null;
    });

    return chartOpts.newBookChartData(yearCate, yearItemStat);
  },

  _statNewBookByMonth(booksData) {
    const books = booksData || this.data.books;

    let monthCate = Object.keys(monthName).map((item) => parseInt(item, 10));

    const monthItemStat = new Array(monthCate.length).fill(0);
    books.map((item) => {
      const date = new Date(item.date * 1000);
      if (monthCate.indexOf(date.getMonth() + 1) < 0) return null;

      monthItemStat[monthCate.indexOf(date.getMonth() + 1)]++;

      return null;
    });

    monthCate = monthCate.map((item) => monthName[item]);
    return chartOpts.newBookChartData(monthCate, monthItemStat);
  },

  _statNewBookByWeek(booksData) {
    const books = booksData || this.data.books;
    const { startDateTime, endDateTime } = this._getCurrentWeek();

    let dayCate = Object.keys(dayName).map((item) => parseInt(item, 10));

    let dayItemStat = new Array(dayCate.length).fill(0);
    books.map((item) => {
      const date = new Date(item.date * 1000);

      if (date < startDateTime || endDateTime < date) return null;
      if (dayCate.indexOf(date.getDay()) < 0) return null;

      dayItemStat[dayCate.indexOf(date.getDay())]++;

      return null;
    });
    dayCate = dayCate.map((item) => dayName[item]);
    if (dayCate.length === 0) {
      dayCate = Object.values(dayName);
      dayItemStat = new Array(dayCate.length).fill(0);
    }

    return chartOpts.newBookChartData(dayCate, dayItemStat);
  },

  newBookSwitch(e) {
    const { idx } = e.detail;
    let chartData = [];

    switch (idx) {
      case 0:
        chartData = this._statNewBookByYear();
        break;
      case 1:
        chartData = this._statNewBookByMonth();
        break;
      case 2:
        chartData = this._statNewBookByWeek();
        break;
      default:
        break;
    }
    this.setData({
      newBookChartData: chartData,
    });
  },
});
