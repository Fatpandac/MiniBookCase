const moveAnimation = (
  distance,
  opacity,
  direction,
  duration = 1000,
  timingFunction = 'ease',
  delay = 0
) => {
  const animation = wx.createAnimation({
    duration,
    timingFunction,
    delay,
  });

  if (direction.toLowerCase() === 'y') {
    animation.opacity(opacity).translateY(distance).step();
  } else {
    animation.opacity(opacity).translateX(distance).step();
  }

  return animation.export();
};

module.exports = {
  moveAnimation,
};
