const rotateAnimation = (rotate, duration = 500, timingFunction = 'ease', delay = 0) => {
  const animation = wx.createAnimation({
    duration,
    timingFunction,
    delay,
  });
  animation.rotate(rotate).step();

  return animation.export();
};

module.exports = {
  rotateAnimation,
};
