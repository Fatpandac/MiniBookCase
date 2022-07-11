const cloud = require('wx-server-sdk')

cloud.init()

const xlsx = require('node-xlsx');

exports.main = async(event, context) => {
    const {_openid} = event
    const res = await cloud.database().collection('user_data').where({
      _openid,
    }).get();
    
    if (res.data.length <= 0) return {msg: 'No data'};

    const {books} = res.data[0];
    const dataCVS = `${_openid}_booksData.xlsx`
    
    let alldata = [];
    let row = ['书名', '作者', '位置', 'ISBN', '出版社', '简介', '状态', '录入时间' ];
    alldata.push(row);

    for (let key in books) {
      let arr = [];
      arr.push(books[key].name);
      arr.push(books[key].author);
      arr.push(books[key].position);
      arr.push(books[key].isbn);
      arr.push(books[key].publishing);
      arr.push(books[key].desc);
      if (books[key].status === 1) {
        arr.push("已读");
      } else if (books[key].status === 2) {
        arr.push("在读");
      } else {
        arr.push("");
      }
      const date = new Date(books[key].date*1000)
      const datevalues = [
        date.getFullYear(),
        date.getMonth()+1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
     ];
      arr.push(datevalues.slice(0,3).join('/') + ' ' + datevalues.slice(3).join(':'));
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
