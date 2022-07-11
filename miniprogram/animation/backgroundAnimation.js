const showBackgroundAnimation = (distance, delay) => {
  const animation = wx.createAnimation({
    duration: 300,
    timingFunction: 'ease',
    delay,
  });

  animation.translateY(distance).step().opacity(1).step();

  return animation.export();
};

const hideBackgroundAnimation = (distance, delay) => {
  const animation = wx.createAnimation({
    duration: 300,
    timingFunction: 'ease',
    delay,
  });

  animation.opacity(0).step().translateY(distance).step();

  return animation.export();
};

module.exports = {
  showBackgroundAnimation,
  hideBackgroundAnimation,
};
