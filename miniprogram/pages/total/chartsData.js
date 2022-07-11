const todayProcessChartsOpts = (name = '0%') => ({
  title: {
    name,
    fontSize: 35,
    color: '#2fc25b',
  },
  subtitle: {
    name: '今日阅读进度',
    fontSize: 25,
    color: '#666666',
  },
  extra: {
    arcbar: {
      type: 'default',
      width: 12,
      backgroundColor: '#E9E9E9',
      startAngle: 0.75,
      endAngle: 0.25,
      gap: 2,
      linearType: 'custom',
    },
  },
});

const todayChartData = (data = 0) => ({
  series: [
    {
      name: '阅读进度',
      color: '#2fc25b',
      data,
    },
  ],
});

const readTimeChartOpts = () => ({
  padding: [20, 5, 10, 5],
  legend: {
    show: false,
  },
  yAxis: {
    disabled: true,
  },
  xAxis: {
    fontSize: 8,
  },
  extra: {
    line: {
      type: 'curve',
      width: 2,
    },
  },
});

const readTimeChartData = (cate, data) => ({
  categories: cate,
  series: [
    {
      textOffset: -5,
      name: '阅读时长',
      data,
    },
  ],
});

const newBookChartOpts = () => ({
  padding: [20, 5, 10, 5],
  legend: {
    show: false,
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 2,
    disabled: true,
  },
  xAxis: {
    fontSize: 8,
  },
});

const newBookChartData = (cate, data) => ({
  categories: cate,
  series: [
    {
      textOffset: -5,
      name: '新增书籍',
      data,
    },
  ],
});

module.exports = {
  todayProcessChartsOpts,
  todayChartData,
  readTimeChartOpts,
  readTimeChartData,
  newBookChartData,
  newBookChartOpts,
};
