// app.ts

App<IAppOption>({
  globalData: {
    userInfo:{}
  },
fetchGlobalData() {
  return new Promise(function (resolve, reject){
    // 异步操作：请求数据
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log(res.code)
        const jscode = res.code
        let requestURL = "https://www.jihanprogramming.top/api/getOpenid.php"
        wx.request({
          url: requestURL, // 文件的 URL
          method: 'POST',
          data:{
            jscode: jscode
          },
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            const userInfo = {
              openId: res.data.openid
            }
            resolve(userInfo)
          }
        })
      },
    })
  })
},

async getGlobalData() {
  try {
    const result = await this.fetchGlobalData();
    console.log(result); // 处理获取到的数据
  } catch (error) {
    console.log(error); // 处理错误情况
  }
},

 onLaunch() {
  
  }
})