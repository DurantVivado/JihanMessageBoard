// 和自建数据库相关的函数
import { generateUniqueId, formatTimestamp, formatTimeHuman, formatTimeStringHuman, formatTime } from "../../utils/util"


const DATA_NOT_FOUND = "data not found"
const AVATAR_NOT_FOUND = "avatar file not found"

 // 将文章上传到数据库，如果文章存在则更新
export const postArticleToDB = (article) =>{
	let databaseURL = ""
	wx.request({
		url:  databaseURL,
		method: 'POST',
		data:{
			title: article.title, 
			author: article.author,
			thumbUrl: article.thumb_url,
			articleUrl: article.article_url,
			createTime: formatTimestamp(article.create_time * 1000),
			likeCount: 0,
			starCount: 0,
			commentCount: 0,
			isSubitem: article.is_subitem ? 1: 0
		},
		// Content-Type’: ‘application/json’用在wx.request中的get请求中没问题. 但是在POST请求中的时候需要使用”Content-Type”: “application/x-www-form-urlencoded”才可以。不然的话，在PHP中用$_POST["x"]是会显示未定义x的。
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: (res)=>{
			console.log(res)
		}
	})
}

 // 文章从数据库读取到本地
 export const getArticlesFromDB = (self) =>{
	let databaseURL = ""
	let that = self
	wx.request({
		url:  databaseURL,
		method: 'POST',
		// Content-Type’: ‘application/json’用在wx.request中的get请求中没问题. 但是在POST请求中的时候需要使用”Content-Type”: “application/x-www-form-urlencoded”才可以。不然的话，在PHP中用$_POST["x"]是会显示未定义x的。
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: (res)=>{
			let i = 0 
			for (const article of res.data) {
				self.data.all_comment_list.push({
					isCommented: false,
								isLiked: false,
								isStarred: false,
								likeCount: article.likeCount,
								starCount: article.starCount,
								commentCount: article.commentCount,
								comments: []
				})
				let createTime = formatTimeStringHuman(article.createTime)
				self.data.news_list.push({
					create_time: createTime,
					update_time: createTime,
					article_list:[{
						id: article.articleId,
						title: article.title,
						author: article.author,
						thumb_url: article.thumbUrl,
						article_url: article.articleUrl,
						create_time: createTime,
						is_subitem: article.isSubitem
					}]
				})
				getCommentNumber(self, i, article.articleUrl)
				getLikeNumber(self, i, article.articleUrl)
				getStarNumber(self, i, article.articleUrl)
				i++
			}
			that.data.offset += res.data.length
			that.setData({
				offset: that.data.offset
			})
			self.setData({
				news_list: self.data.news_list,
				all_comment_list: self.data.all_comment_list,
				search_news_list: self.data.news_list
			})
		}
	})
}

// 将评论数据发送到数据库
export const postCommentToDB = (self, id, articleUrl, rootCommentId) => {
	// console.log('rootCommentId', rootCommentId)
	let currentTime = new Date().getTime()
	let databaseURL = ""
	let that = self
	let comment = that.data.precomments['comments']
	if (rootCommentId != 0 && self.data.subcommentator != '') {
		comment = '回复 '+ self.data.subcommentator + '：' + comment
	}
	console.log(comment)
	// 用户必须登录且评论不为空才能发表
	if (that.data.logIn && comment != '') {
		wx.request({
			url:  databaseURL,
			method: 'POST',
			data:{
				articleUrl: articleUrl, 
				commentator: that.data.nickName,
				content: comment,
				createTime:  formatTimestamp(currentTime),
				isDelete: false,
				likeCount: 0,
				rootCommentId: rootCommentId,
				isTop: false
			},
			// Content-Type’: ‘application/json’用在wx.request中的get请求中没问题. 但是在POST请求中的时候需要使用”Content-Type”: “application/x-www-form-urlencoded”才可以。不然的话，在PHP中用$_POST["x"]是会显示未定义x的。
			header: { 'Content-Type': 'application/x-www-form-urlencoded' },
			success: (res)=>{
				// console.log(res)       
				//将评论显示在下方,unshift将元素插入数组头部
				if (rootCommentId == 0) {
					that.data.all_comment_list[id - 1].comments.unshift({
						commentator : that.data.nickName,
						avatarUrl: that.data.avatarUrl, // 需要单独获取
						likeCount: 0,
						content: comment,
						createTime: formatTimeHuman(currentTime)
					})
				} else {
					if (!that.data.subcomments.hasOwnProperty(rootCommentId)) {
						that.data.subcomments[rootCommentId] = []
					}
					that.data.subcomments[rootCommentId].unshift({
						commentator : that.data.nickName,
						avatarUrl: that.data.avatarUrl, // 需要单独获取
						likeCount: 0,
						content: comment,
						createTime: formatTimeHuman(currentTime),
						rootCommentId: rootCommentId
					})
				}
				// 清空评论区
				that.data.precomments.article_url=''
				that.data.precomments.comments=''
				that.setData({
					precomments: that.data.precomments
				})
				// 增加评论计数
				that.data.all_comment_list[id - 1].commentCount++;
				// 更新全局评论数据
				that.setData({
					all_comment_list: that.data.all_comment_list,
					subcomments: that.data.subcomments
				})
			}, 
			fail(res) {
				console.log(res)
			}
		})
	} else if(!that.data.logIn) {
		wx.showToast({
			title: "请先登陆",
			icon: "error",
			duration: 2000
		})
	}
}

 // 从数据库获取评论数据
 export const getCommentsFromDB = (self, articleUrl, id) => {
	let databaseURL = ""
	let that = self
	wx.request({
		url:  databaseURL,
		method: 'POST',
		data:{
			articleUrl: articleUrl
		},
		// Content-Type’: ‘application/json’用在wx.request中的get请求中没问题. 但是在POST请求中的时候需要使用”Content-Type”: “application/x-www-form-urlencoded”才可以。不然的话，在PHP中用$_POST["x"]是会显示未定义x的。
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: (res)=>{
			let data = res.data
			for (let i = 0; i < data.length; i++) {
				// console.log(res.data[i])
				
			// 更新子评论
			let rootCommentId = data[i]['rootCommentId']


			if (rootCommentId === 0) {
				// 父评论
				that.data.all_comment_list[id].comments.push({
					commentId: data[i]['commentId'],
					isLike: false,
					commentator : data[i]['commentator'],
					avatarUrl: '', // 图片格式，需要单独获取
					content: data[i]['content'],
					likeCount: data[i]['likeCount'],
					createTime: formatTimeStringHuman(data[i]['createTime']),
					rootCommentId: data[i]['rootCommentId']
				})
			} else {
				// 子评论
				if (!that.data.subcomments.hasOwnProperty(rootCommentId)) {
					that.data.subcomments[rootCommentId] = []
				}
				that.data.subcomments[rootCommentId].push({
					commentId: data[i]['commentId'],
					isLike: false,
					commentator : data[i]['commentator'],
					avatarUrl: '', // 图片格式，需要单独获取
					content: data[i]['content'],
					likeCount: data[i]['likeCount'],
					createTime: formatTimeStringHuman(data[i]['createTime'])
				})

				}
			}

			let comments = that.data.all_comment_list[id].comments
			// 更新头像等信息
			for (let i = 0; i < comments.length; i++) {
				if (comments[i].commentator in that.data.avatarMap) {
					that.data.all_comment_list[id].comments[i].avatarUrl = that.data.avatarMap[comments[i].commentator]
				} else if (comments[i].avatarUrl === '') {
					getCommentAvatar(that, id, i, comments[i].commentator, true)
				}
			}
			for (let key in that.data.subcomments) {
				let subcomment = that.data.subcomments[key]
				for (let i = 0; i < subcomment.length; i++) {
					if (subcomment[i].commentator in that.data.avatarMap) {
						that.data.subcomments[key].avatarUrl = that.data.avatarMap[subcomment[i].commentator]
					} else if (subcomment[i].avatarUrl === '') {
						getCommentAvatar(that, key, i, subcomment[i].commentator, false)
					}
				}
				that.data.subcomments[key].sort((a, b) => b.likeCount - a.likeCount)
			}
			// 将评论按照点赞数排序
			that.data.all_comment_list[id].comments.sort((a, b) => b.likeCount - a.likeCount)
			that.setData({
				all_comment_list: that.data.all_comment_list,
				subcomments: that.data.subcomments
			})
		},
		fail: (res)=>{
			wx.showToast({
				title:'获取评论失败',
				icon:'error',
				duration: 2000
			})
		}
	})
}

// 当用户展开特定评论区，就会获取相应评论的用户头像
export const getCommentAvatar = (self, id, i, commentator, isRoot) => {
	let requestURL = ""
	let that = self
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			commentator: commentator
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		responseType: 'arraybuffer',
		success: function (res) {
			// console.log(res)
			let filePath = wx.env.USER_DATA_PATH + '/' + generateUniqueId() + '.png'
			wx.getFileSystemManager().writeFile({
				filePath: filePath,
				data: res.data,
				encoding: 'binary',
				success: function () {
					//  console.log('评论者头像地址：', filePath);
					that.data.avatarMap[commentator] = filePath
					that.setData({
						avatarMap: that.data.avatarMap
					})
					if (isRoot) {
						that.data.all_comment_list[id].comments[i].avatarUrl = filePath
						that.setData({
							all_comment_list: that.data.all_comment_list
						})
					} else {
						that.data.subcomments[id][i].avatarUrl = filePath
						that.setData({
							subcomments: that.data.subcomments
						})
					}
				},
				fail: function (error) {
					console.log('保存文件失败：', error);
				}
			});
		},
		fail: function (error) {
			console.log('下载文件失败：', error);
		}
	})
}

// 检查openid是否存在于数据库中，如果存在则根据openid将头像从服务器下载到本地
export const getAvatarFromDB = (self) => {
	let requestURL = ""
	let that = self
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			openId: self.data.openid
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		responseType: 'arraybuffer', // 图像文件必须要arrayBuffer类型
		success: function (res) {
			// const decoder = new TextDecoder();
			// const msg = decoder.decode(res.data);
			// 采用兼容写法：https://developers.weixin.qq.com/community/develop/doc/000e280b104b38e5cb1b062d25ac00
			const msg = decodeURIComponent(escape(String.fromCharCode(res.data)));
			if (msg === DATA_NOT_FOUND) {
				console.log("userinfo not in database")
				return
			} else if (msg === AVATAR_NOT_FOUND) {
				console.log("avatar not on server")
				return
			}
			let filePath = wx.env.USER_DATA_PATH + '/' + generateUniqueId() + '.png'
			wx.getFileSystemManager().writeFile({
				filePath: filePath,
				data: res.data,
				encoding: 'binary',
				success: function () {
					 console.log('头像地址：', filePath)
					 that.setData({
						avatarUrl: filePath,
						logIn: true
					 })
					 // 使用本地缓存
					wx.setStorageSync('avatarUrl', filePath)
				}
			})
		}
	});
	
}

// 将文章点赞数据发送给数据库
export const postLikeArticleToDB = (articleUrl, like) => {
	let requestURL = ""
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			articleUrl: articleUrl,
			like: like
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: function (res) {
			console.log(res)
		}
	})
}

// 将收藏数据发送给数据库
export const postStarArticleToDB = (articleUrl, openid, star) => {
	let requestURL = ""
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			articleUrl: articleUrl,
			openid: openid,
			star: star
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: function (res) {
			console.log(res)
		}
	})
}

// 将点赞数据发送给数据库
export const postLikeCommentToDB = (commentId, like) => {
	let requestURL = ""
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			commentId: commentId,
			like: like
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: function (res) {
			console.log(res)
		}
	})
}

// 根据openid获取用户的昵称
export const getNickName = (self) => {
	let requestURL = ""
	let that = self
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			openId: that.data.openid
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: function (res) {
			console.log("昵称：", res.data)
			that.setData({
				nickName: res.data
			})
			wx.setStorageSync('nickName', res.data)
		}
	})
}

// 获取文章评论数
export const getCommentNumber = (self,  id, articleUrl) => {
	let requestURL = ""
	let that = self
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			articleUrl: articleUrl
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: function (res) {
			// console.log("评论数：", res.data[0].commentCount)
			if (res.data.length == 0) {
				return
			}
			self.data.all_comment_list[id].commentCount = res.data[0].commentCount
			self.setData({
				all_comment_list: self.data.all_comment_list
			})
		}
	})
}

// 获取文章喜欢数
export const getLikeNumber = (self, id, articleUrl) => {
	let requestURL = ""
	let that = self
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			articleUrl: articleUrl
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: function (res) {
			// console.log("喜欢数：", res)
			if (res.data.length == 0) {
				return
			}
			self.data.all_comment_list[id].likeCount = res.data[0].likeCount
			self.setData({
				all_comment_list: self.data.all_comment_list
			})
		}
	})
}

//获取文章收藏数
export const getStarNumber = (self, id,articleUrl) => {
	let requestURL = ""
	let that = self
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			articleUrl: articleUrl
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: function (res) {
			// console.log("收藏数：", res)
			if (res.data.length == 0) {
				return
			}
			self.data.all_comment_list[id].starCount = res.data[0].starCount
			self.setData({
				all_comment_list: self.data.all_comment_list
			})
		}
	})
}

