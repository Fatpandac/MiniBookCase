const cloud = require('wx-server-sdk')

cloud.init()

const xlsx = require('node-xlsx');

exports.main = async(event, context) => {
    const {_openid} = event
    const res = await cloud.database().collection('read_time').where({
      _openid,
    }).get();
    
    if (res.data.length <= 0) return {msg: 'No data'};

    console.log(res)
    const {logs} = res.data[0];
    const dataCVS = `${_openid}_readTime.xlsx`
    
    let alldata = [];
    let row = ['开始阅读时间', '结束阅读时间', '阅读时间（分钟）'];
    alldata.push(row);

    const getDateValues = (date) => {
      return [
        date.getFullYear(),
        date.getMonth()+1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
      ];
    }

    for (let key in logs) {
      let arr = [];
      const startTime = new Date(logs[key].startTime)
      const startDateValue = getDateValues(startTime)
      const endTime = new Date(logs[key].endTime)
      const endDateValue = getDateValues(endTime)

      const startStr = `${startDateValue.slice(0,3).join('/')} ${startDateValue.slice(3).join(':')}`
      const endStr = `${endDateValue.slice(0,3).join('/')} ${endDateValue.slice(3).join(':')}`
      arr.push(startStr);
      arr.push(endStr);
      const passTime = logs[key].passTime/1000/60
      arr.push(passTime.toFixed(2))
      alldata.push(arr)
    }
    
    var buffer = await xlsx.build([{
      name: "mySheetName",
      data: alldata
    }]);

    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer,
    })
}
