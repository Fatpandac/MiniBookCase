const { getReadTime, updateReadTime } = require('../../utils/dataBase');

const initDeg = {
  left: -135,
  right: 135,
};

Page({
  data: {
    remainTimeText: '',
    log: {},
    logs: [],
    isRunning: false,
    leftDeg: initDeg.left,
    rightDeg: initDeg.right,
  },

  onLoad() {},

  onShow() {
    if (this.data.isRunning) return;

    getReadTime()
      .then((res) => {
        const { goal, logs } = res;

        this.setData({
          goal,
          logs: logs || [],
          remainTimeText: `${goal}`,
        });

        return null;
      })
      .catch(() => {
        wx.showToast({
          icon: 'error',
          title: '获取数据失败',
        });
      });
  },

  startNameAnimation() {
    const animation = wx.createAnimation({
      duration: 450,
    });
    animation.opacity(0.2).step();
    animation.opacity(1).step();
    this.setData({
      nameAnimation: animation.export(),
    });
  },

  formatTime(time, format) {
    const temp = '0000000000' + time;
    const len = format.length;
    return temp.substr(-len);
  },

  startTimer(e) {
    const startTime = Date.now();
    const isRunning = this.data.isRunning;
    const showTime = this.data.goal;
    const keepTime = showTime * 60 * 1000;
    const timerType = e.target.dataset.type;

    if (!isRunning) {
      wx.hideTabBar({
        animation: true,
      });
      this.timer = setInterval(
        function () {
          this.updateTimer();
          this.startNameAnimation();
        }.bind(this),
        1000
      );
    } else {
      this.stopTimer();
    }

    let log = this.data.log || {};
    if (timerType === 'rest') {
      log = {
        startTime,
        keepTime,
      };
    } else {
      log.endTime = Date.now();
      log.passTime = log.endTime - log.startTime;
    }

    this.setData({
      log,
      isRunning: !isRunning,
      remainTimeText: showTime + ':00',
    });

    if (timerType === 'work') this.saveLog(this.data.log);
  },

  stopTimer() {
    this.setData({
      leftDeg: initDeg.left,
      rightDeg: initDeg.right,
    });

    wx.showTabBar({
      animation: true,
    });

    if (this.timer) clearInterval(this.timer);
  },

  updateTimer() {
    const log = this.data.log;
    const now = Date.now();
    const runningTime = Math.round((now - log.startTime) / 1000);
    const H = this.formatTime(Math.floor(runningTime / (60 * 60)) % 24, 'HH');
    const M = this.formatTime(Math.floor(runningTime / 60) % 60, 'MM');
    const S = this.formatTime(Math.floor(runningTime) % 60, 'SS');

    if (runningTime > 0) {
      const remainTimeText = (H === '00' ? '' : H + ':') + M + ':' + S;
      this.setData({
        remainTimeText,
      });
    }

    const halfTime = log.keepTime / 2;
    if (
      (runningTime * 1000) % log.keepTime <= halfTime &&
      (runningTime * 1000) % log.keepTime !== 0
    ) {
      this.setData({
        leftDeg: this.data.leftDeg - (180 * 1000) / halfTime,
      });
    } else {
      this.setData({
        rightDeg: this.data.rightDeg - (180 * 1000) / halfTime,
      });
    }
  },

  saveLog(log) {
    const logs = this.data.logs;
    logs.push(log);
    updateReadTime({
      goal: this.data.goal,
      logs,
    }).catch(() => {
      wx.showToast({
        icon: 'error',
        title: '保存数据失败',
      });
    });
  },
});
