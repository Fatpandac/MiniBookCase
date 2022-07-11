const scaleAnimation = (times, duration = 1000, delay = 0) => {
  const animation = wx.createAnimation({
    duration,
    timingFunction: 'ease',
    delay,
  });

  animation.backgroundColor('#ffffff0').scale(times).step();

  return animation.export();
};

module.exports = {
  scaleAnimation,
};
