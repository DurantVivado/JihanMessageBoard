// pages/info/info.ts
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: "",
    signage_list : [
      "用户守则",
      "版本日志",
      "新用户福利"
    ],
    author_QRcode: "../../images/jihan_QRcode.jpg",
    group_QRcode: "../../images/group_QRcode.jpg", 
    agreement_title:"用户协定",
    agreement_content: "<br/>用户朋友需要遵守以下规则：<br/>\
    1. <b>友善的发言</b>：用户在使用本平台时必须遵守中国法律法规，不得从事任何违法、违规行为，包括但不限于传播淫秽、暴力、恐怖内容，侵犯他人隐私权、知识产权等。<br/>\
    2. <b>用户的权益</b>：可以自由评论、分享和喜欢文章或内容等。<br/>\
    3. <b>隐私的保护</b>：本平台将严格保护用户的个人隐私信息（头像、昵称和评论等），未经用户授权不会向第三方公开、泄露用户的个人信息，除非符合法律规定或用户同意。<br/>\
    4. <b>违规的处理</b>：对于违反用户守则的行为，本平台有权采取相应的处理措施，包括但不限于警告、限制或禁止使用平台功能、冻结账号等。<br/><br/>\
    我们非常重视<strong>用户体验</strong>，有任何建议可以反馈给迹寒（备注\"小程序反馈\"，谢谢！）",
    log_title:"版本日志",
    log_content: "<br>2023/08/12 发布版本<b>v1.0</b>   <br/>\
    😎这是第一个正式版，允许用户对公众号推文进行点赞❤、分享和评论（包括回复他人），还支持对他人评论进行点赞哦！",

    bonus_title:"新用户福利🎉",
    bonus_content: "加入以下群聊，获取不定期福利👇"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    this.setData({
      content: this.data.signage_list[options.id]
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})