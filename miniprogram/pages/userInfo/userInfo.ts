// pages/userInfo/userInfo.ts

import { formatTimestamp } from "../../utils/util"
const app = getApp<IAppOption>()
const defaultAvatarUrl = '../../images/默认头像.png'
const defaultLoginUrl = '../../images/请登录.png'
Page({/**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    nickName: '',
    theme: wx.getSystemInfoSync().theme,
    openid: '',
    logIn: false
  },
 
  // 用户选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
   console.log("头像地址：", avatarUrl)
    
    this.setData({
      avatarUrl,
    })
    this.data.avatarUrl = avatarUrl
    
  },

  // 获取输入的评论
  getNickname(e) {
    console.log(e)
    this.setData({
      nickName: e.detail.value.nickname 
    })

  },

  // 将openId,头像和昵称上传到服务器
  formSubmit(e){
    // 头像和昵称的检查
    if (e.detail.value.nickname == '' || this.data.avatarUrl == defaultAvatarUrl) {
      wx.showToast({
        title: "头像和昵称都要填写呐~",
        icon: "none",
        duration: 2000
      })
      return
    }
    this.nickNameInDatabase(e)
  },

  // 判断昵称是否已经在数据库中，即是否重名
  nickNameInDatabase(e) {
      let requestURL = "";
      let that = this
      wx.request({
        url: requestURL,
        method: 'POST',
        data: {
          nickname: e.detail.value.nickname
        },
        header: { 'Content-Type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          // console.log(res)
          if (!res.data) {
            wx.showToast({
              title: "恭喜注册成功！",
              icon: "success",
              duration: 2000
            })
            console.log("昵称：", e.detail.value.nickname)
            that.data.nickName = e.detail.value.nickname
            // 将用户信息上传到数据库
            that.postUserInfoToDB()
          } else {
            wx.showToast({
              title: "昵称已经使用了，请换一个吧~",
              icon: "none",
              duration: 2000
            })
          }
        }
      })
  },
  
  // 判断openid是否已经在数据库中，即是否已注册
  openidInDatabase() {
    let requestURL = "";
    let that = this
    wx.request({
      url: requestURL,
      method: 'POST',
      data: {
        openid: this.data.openid
      },
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        // console.log(res)
        if (!res.data) {
          wx.showToast({
            title: "没有找到您的登录信息，请先注册吧~",
            icon: "none",
            duration: 2000
          })
        } else {
          const dataToPass = {
            logIn: true,
            logOut: false
           }
           // 使用本地缓存
          wx.setStorageSync('dataToPass', dataToPass)
          wx.navigateTo({
            url: "/pages/index/index"
          })
        }
      }
    })
  },

  // 上传到数据库
  postUserInfoToDB() {
    let requestURL = ""
    let currentTime = new Date().getTime()
    wx.uploadFile({
      url:  requestURL,
      filePath: this.data.avatarUrl,
      name: 'avatar',
      formData:{
        nickName: this.data.nickName,
        openid: this.data.openid,
        registerTime: formatTimestamp(currentTime),
      },
      success: (res)=>{
        // console.log(res)
        // 将用户状态改为已登录，更新主页头像
       const dataToPass = {
        avatarUrl: this.data.avatarUrl,
        nickName: this.data.nickName,
        openid: this.data.openid,
        logIn: true,
        logOut: false
       }
       // 使用本地缓存
      wx.setStorageSync('dataToPass', dataToPass)
      wx.navigateTo({
          url: "/pages/index/index"
        })
      },
      fail: (res)=>{
        wx.showToast({
          title:'上传失败',
          icon:'error',
          duration: 2000
        })
      }
    })
  },

   // 用户退出登录
   logIn() {
    this.openidInDatabase()
  },


  // 用户退出登录
  logOut() {
    const dataToPass = {
      logIn: false,
      logOut: true
     }
     // 使用本地缓存
    wx.setStorageSync('dataToPass', dataToPass)
    wx.navigateTo({
      url: "/pages/index/index"
    })
  },

  async getGlobalData() {
    try {
      const result = await app.fetchGlobalData();
      console.info(result); // 处理获取到的数据
      this.setData({
        openid: result.openId
      })
    } catch (error) {
      console.error(error); // 处理错误情况
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
 onLoad(options) {
    this.getGlobalData()
    this.setData({
      logIn: options.logIn == "true" ? true : false
    })
  },

  onShow() {

  }

})