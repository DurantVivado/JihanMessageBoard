// index.ts

import { generateUniqueId, formatTimestamp, formatTimeHuman, formatTimeStringHuman } from "../../utils/util"
import { getAccessToken, getPublishedArticles, checkIfSensitive } from "./api"
import { getCommentsFromDB, getCommentAvatar, getAvatarFromDB, postLikeCommentToDB, getNickName, getArticlesFromDB, postLikeArticleToDB, postStarArticleToDB } from "./db"
// 获取应用实例
const app = getApp<IAppOption>()

// 默认头像
const defaultAvatarUrl = '../../images/默认头像.png'
// 默认登录头像
const defaultLoginUrl = '../../images/请登录.png'
// 默认占位符
const defaultPlaceholder = '快来评论吧！'

// 从数据库还是官方api获取文章
const obtainArticlesFromDB = false

Page({
  data: {
    // 公告区轮播图
    swiperList: [
      "../../images/用户守则.png",
      "../../images/版本日志.png",
      "../../images/新用户福利.png"
    ],
    avatarUrl: defaultLoginUrl,
    nickName: '',
    openid: '',
    numArticles : 0, // 目前已展示的文章数
    offset: 0, // 文章偏移量
    batchCount: 5, // 每次获取多少篇文章
    logIn: false, // 是否已登陆
    logOut: false, // 用户是否退出登录
    showInputBox : false, // 显示输入区
    subcommentator: '', // 子评论作者
    showSubcommentZone: false, // 显示评论回复区
    placeholder: defaultPlaceholder, // 输入框占位符
    rootCommentId: 0, // 父评论id
    numOfReply: 100, // 展示回复的评论数
    searchInput: '',
    avatarMap: {}, // 保存昵称=>图片本地地址的哈希表，用于加速
    news_list: [], // 消息列表，一个消息可能有多篇文章，显示公众号文章作者、标题、图片等
    // news_list:[
    //   news: [{
    //     create_time: 0,
    //     update_time: 0,
    //     article_list:[{
    //       id: 0,
    //       title: '',
    //       author: '',
    //       thumb_url: '',
    //       article_url: '',
    //       is_subitem: false
    //     }]
    //   }]
    // ]
    search_news_list: [], //搜索文章列表（浅拷贝）
    all_comment_list:[],  //评论列表，点击下拉按钮从数据库读评论到本机，写评论再传回数据库存储
    // all_comment_list:[{
    //   isCommenteded: false,
    //   isStarred: false,
    //   isLiked: false,
    //   likeCount:0,
    //   starCount:0,
    //   commentCount:0,
    //   comments: [{
        // commentId:0,
        // commentator:'', 
        // avatarUrl:'',
        // createTime: 0,
        // content: '',
        // likeCount: 0,
        // isDelete: false,
        // rootCommentId: 0,
        // isTop: false,
        // subcomments: []
        // }]
    // }]
    precomments: {
      article_url:'',
      comments:''
    }, // 用户预填写的评论，按照文章url进行区分
    subcomments: {},

    comment_on_image: '../../images/消息_on.png',
    comment_off_image: '../../images/消息_off.png',
    like_off_image: '../../images/喜欢_off.png',
    like_on_image: '../../images/喜欢_on.png',
    star_off_image: '../../images/share_off.png',
    star_on_image: '../../images/share_on.png',
    up_on_image:'../../images/点赞_on.png',
    up_off_image:'../../images/点赞_off.png'
  },

  // 获取输入的查找字符
  getSearchInput(e) {
    // console.log(e.detail.keyCode)
    this.setData({
      searchInput: e.detail.value
    })
    if (e.detail.keyCode == 8) {
      // 删除键触发再次查找
      this.searchArticle(e)
    }
  },

  // 搜索文章
  searchArticle(e) {
    this.data.search_news_list = this.data.news_list.filter((item) => {
      return item.article_list[0].title.toLowerCase().includes(this.data.searchInput); // 使用 includes() 方法判断关键字是否包含在数据项中
    });
    console.log(this.data.search_news_list.length)
    this.setData({
      search_news_list: this.data.search_news_list, // 更新搜索结果
    });
  },

  // 点击轮播图进入看板页面
  navigateToSignage(e) {
    let id = e.target.dataset.id
    
    wx.navigateTo({
      //url太长且会被截取，编码一下，避免这种情况
      url:`/pages/info/info?id=${id}`,
    });
  },

  // 重定位到对应公众号文章的界面
  navigateToArticle(e) {
    let article_url = e.target.dataset.value
    wx.navigateTo({
      //url太长且会被截取，编码一下，避免这种情况
      url:`/pages/articles/articles?url=${encodeURIComponent(article_url)}`,
    });
},

  // 喜欢文章
  likeArticle(e) {
  if (!this.data.logIn) {
    wx.showToast({
			title: "请先登陆",
			icon: "error",
			duration: 2000
		})
    return
  }
  let id = e.currentTarget.dataset.id - 1
  let articleUrl = e.currentTarget.dataset.articleurl
  if (this.data.all_comment_list[id].isLiked) {
    // 取消喜欢
    this.data.all_comment_list[id].likeCount--
    this.data.all_comment_list[id].isLiked = false
    this.setData({
      all_comment_list: this.data.all_comment_list
    })
    postLikeArticleToDB(articleUrl, "unlike")

  } else {
    // 喜欢
    this.data.all_comment_list[id].likeCount++
    this.data.all_comment_list[id].isLiked = true
    this.setData({
      all_comment_list: this.data.all_comment_list
    })
    postLikeArticleToDB(articleUrl, "like")
  }
  
},

  // 分享文章
  starArticle(e) {
    let id = e.currentTarget.dataset.id - 1
    let articleUrl = e.currentTarget.dataset.articleurl
    // 分享，可以多次分享
    this.data.all_comment_list[id].isStarred = true
    this.data.all_comment_list[id].starCount++
    this.setData({
      all_comment_list: this.data.all_comment_list
    })
    postStarArticleToDB(articleUrl, this.data.openid, "star")
  },

  // 获取评论列表
  getCommentList(e) {
    let id = e.currentTarget.dataset.id - 1
    this.setData({
      placeholder: defaultPlaceholder
    })
    if (this.data.all_comment_list[id].isCommented) {
      // 关闭评论
      this.data.all_comment_list[id].isCommented = false
      this.setData({
        all_comment_list: this.data.all_comment_list,
        showInputBox: false
      })
      
    } else {
      // 开启评论
      this.data.all_comment_list[id].isCommented = true
      this.setData({
        all_comment_list: this.data.all_comment_list,
        showInputBox: true
      })
      let articleUrl = e.currentTarget.dataset.articleurl
      let comments = this.data.all_comment_list[id].comments
      if (comments.length === 0) {
        // 获取评论区数据
        getCommentsFromDB(this, articleUrl, id)
      }
    }
    
  },

  // 发表留言（含敏感内容检测）
  postComment(e) {
    // console.log(e)
    let id = e.target.dataset.id
    let articleUrl = e.target.dataset.article_url
    // 进行敏感内容检测，合规才上传数据库
    if (this.data.precomments.comments == '') {
      wx.showToast({
        icon: "none",
        title: "评论不能为空",
        duration: 2000
      })
      return
    }
    checkIfSensitive(this, id, articleUrl, this.data.rootCommentId, this.data.precomments.comments)
  },

  // 用户回复评论
  replyToComment(e){
    // 回复会出现一个屏幕下方输入框，占位符为回复@xxx
    let commentator = e.currentTarget.dataset.commentator
    let rootCommentId = e.currentTarget.dataset.commentid
    this.setData({
      placeholder: '回复@'+commentator,
      rootCommentId: rootCommentId,
      subcommentator: ''
    })
  },

  // 回复子评论
  replyToSubcomment(e) {
    // 回复会出现一个屏幕下方输入框，占位符为回复@xxx
    let commentator = e.currentTarget.dataset.commentator
    let rootCommentId = e.currentTarget.dataset.commentid

    this.setData({
      placeholder: '回复@'+commentator,
      rootCommentId: rootCommentId,
      subcommentator: commentator
    })
  }, 
  // 获取输入的评论
  getInputData(e) {
    // console.log(e)
    this.setData({
      precomments: {
        article_url: e.target.dataset.article_url,
        comments : e.detail.value  
      }
    })
  },

  // 改为要求用户填写头像和昵称
  getUserInfo() {
     wx.navigateTo({
        url : `/pages/userInfo/userInfo?logIn=` + this.data.logIn
      })
  },

  // 用户点赞评论
  likeComment(e){
    // 首先前端必须立即修改，然后发送到数据库进行修改
    let articleid = e.currentTarget.dataset.articleid - 1
    let commentid = e.currentTarget.dataset.commentid
    let comment = this.data.all_comment_list[articleid].comments[commentid]
    if (comment.isLike) {
      // 取消赞
      comment.isLike = false
      comment.likeCount--
      this.setData({
        all_comment_list: this.data.all_comment_list
      })
      // 更新数据库
      postLikeCommentToDB(comment.commentId, "unlike")
    } else {
      // 点赞
      comment.isLike = true
      comment.likeCount++
      this.setData({
        all_comment_list: this.data.all_comment_list
      })
      // 更新数据库
      postLikeCommentToDB(comment.commentId, "like")
    }
  },

  // 展示所有的评论
  showAllRelies(e){
    if (this.data.showSubcommentZone) {
      this.data.showSubcommentZone = false
    } else {
      this.data.showSubcommentZone = true
    }
    this.setData({
      showSubcommentZone: this.data.showSubcommentZone
    })
  },

  async getGlobalData() {
    try {
      const result = await app.fetchGlobalData();
      console.info(result); // 处理获取到的数据
      this.setData({
        openid: result.openId
      })
      const dataToPass = wx.getStorageSync('dataToPass')
      console.log(dataToPass)
      if (dataToPass) {
        // 获取用户主动填写的头像昵称
        this.setData({
          avatarUrl: dataToPass.avatarUrl,
          nickName: dataToPass.nickName,
          logIn: dataToPass.logIn,
          logOut: dataToPass.logOut
        })
        // 不清除缓存，方便下次自动登录
        // wx.removeStorageSync('dataToPass')
      }
    // 根据openid获取用户信息
    if (!this.data.logOut) {
      getAvatarFromDB(this)
      getNickName(this)
    }
    
    } catch (error) {
      console.error(error); // 处理错误情况
    }
  },

  onLoad() {
    // 异步获取openid
    this.getGlobalData()
    // 获取文章列表
    if (obtainArticlesFromDB) {
      getArticlesFromDB(this)
    } else {
      getPublishedArticles(this, this.data.offset, this.data.batchCount)
    }
  },
 
  onShow() {
    // this.onLoad()
  },

  // 设置下拉刷新， 由于scroll-view阻止下拉刷新，所以暂不实现，用户 
  onPullDownRefresh() {
    
  }, 

  // 设置分享功能
  onShareAppMessage(e) {
    console.log(e);
    if (e.from === 'button') {
      // 来自页面内转发按钮
      //console.log("转发：" + JSON.stringify(res.target))
    }
    let title = e.target.dataset.article_title
    let article_url = e.target.dataset.article_url
    return { 
      title: title,
      path: `/pages/articles/articles?url=${encodeURIComponent(article_url)}` ,
      success: function (res) {
        console.log(res)
      }
    }
  },
  // 设置上拉触底事件
  onReachBottom() {
    console.log(this.data.offset, this.data.batchCount)
    getPublishedArticles(this, this.data.offset, this.data.batchCount)
  }
})
