// 和官方api相关的函数
import { generateUniqueId, formatTimestamp, formatTimeHuman, formatTimeStringHuman } from "../../utils/util"
import { postArticleToDB, getCommentNumber, getLikeNumber, getStarNumber, postCommentToDB } from "./db"

// 最大尝试次数
const MAX_RETRY_TIME = 5

// 是否将文章发表到数据库（api模式下）
const POST_ARTICLE_TO_DB = false

// 获取所有文章列表
export const getPublishedArticles = (self, offset, count) => {
	let that = self
	//导入素材函数
	wx.request({
		url: '',
		method:'POST',
		data:{ 
				"offset":offset,
				"count":count 
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded'},
		success(res){
			console.log(res.data.item)
			let items = res.data.item
			let num_article = 0
			if (items == null) {
				return;
			}
			that.data.offset += items.length
			that.setData({
				offset: that.data.offset
			})
			for (let i = 0; i < items.length; i++) {
						// let article_id = items[i].article_id
						// console.log("id:%d, article_id:%s\n", i, article_id)
						// 一篇消息可能包括多篇推文
						let news_item = items[i].content.news_item
						// 时间戳默认是s为单位,要转换为毫秒
						let create_time = formatTimeHuman(items[i].content.create_time * 1000)
						let update_time = formatTimeHuman(items[i].content.update_time * 1000)
						// console.log("create_time:%s, update_time:%s\n", create_time, update_time)
						
						num_article += news_item.length
						for (let j = 0; j < news_item.length; j++){
							let news = { 
								create_time: create_time,
								update_time: update_time,
								article_list:[]
							}
							let article = {
								id: num_article,
								title: news_item[j].title,
								author: news_item[j].author,
								thumb_url: news_item[j].thumb_url,
								article_url: news_item[j].url,
								create_time: items[i].content.create_time,
								is_subitem: (j > 0) ? true : false
							}
							// console.log("title:%s, author:%s, thumb_url:%s, article_url:%s\n", article.title, article.author, article.thumb_url, article.article_url)
							news.article_list.push(article)
							that.data.news_list.push(news)
							// // 将文章信息上传数据库
							if (POST_ARTICLE_TO_DB) { 
								postArticleToDB(article)
							}
							let comment_list = {
								isCommented: false,
								isLiked: false,
								isStarred: false,
								likeCount: 0,
								starCount: 0,
								commentCount: 0,
								comments: []
							}
							
							that.data.all_comment_list.push(comment_list)
							// 必须用setData来更新视图
							
							// 获取文章评论数
							getCommentNumber(that, num_article - 1, article.article_url)
							// 获取文章收藏数
							getStarNumber(that, num_article - 1, article.article_url)
							// 获取文章喜欢数
							getLikeNumber(that, num_article - 1, article.article_url)
						}

					}
					that.setData({
						all_comment_list: that.data.all_comment_list,
						news_list: that.data.news_list,
						numArticles: num_article,
						search_news_list: self.data.news_list
					})

					},
					fail(res) {
						wx.showToast({
							title: "获取文章列表失败",
							icon: 'none',
							duration: 2000
						})
					}
				})
}

// 判断是否含敏感词，可能返回的情况“合规”，“不合规”，“疑似”，“审核失败”
export const checkIfSensitive = (self, id, articleUrl, rootCommentId, content) => {
	let requestURL = ""
	let that = self
	wx.request({
		url: requestURL, // 文件的 URL
		method: 'POST',
		data:{
			content: content
		},
		header: { 'Content-Type': 'application/x-www-form-urlencoded' },
		success: function (res) {
			// console.log("敏感检测结果：", res.data.conclusion)
			let senRes = res.data.conclusion
			if (senRes != "合规") {
				wx.showToast({
					icon: "none",
					title: "内容疑似敏感\n请重新输入",
					duration: 3000
				})
			} else {
				postCommentToDB(self, id, articleUrl, rootCommentId)
			}
		}
	})
}