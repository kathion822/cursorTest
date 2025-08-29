// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129

module.exports = {
	_before() {
		console.log('云对象初始化完成')
	},

	// 简化版本：直接使用传入的token作为uid
	async checkUserToken(token) {
		try {
			// 简化版本：直接返回token作为uid
			// 实际应用中应该验证token的有效性
			return {
				code: 0,
				message: 'token校验成功',
				uid: token
			}
		} catch (error) {
			return {
				code: -1,
				message: 'token校验失败',
				error: error.message
			}
		}
	},

	// 新增工作报告
	async addWorkReport(uniIdToken, reportData) {
		try {
			// 校验用户token
			const userCheck = await this.checkUserToken(uniIdToken)
			if (userCheck.code !== 0) {
				return userCheck
			}

			const uid = userCheck.uid
			const db = uniCloud.database()
			
			// 构建报告数据
			const report = {
				uid: uid, // 用户ID
				title: reportData.title,
				date: reportData.date,
				content: reportData.content,
				plan: reportData.plan || '',
				problems: reportData.problems || '',
				status: 'pending', // 默认状态为待审批
				createTime: new Date().toISOString(),
				updateTime: new Date().toISOString()
			}

			// 插入数据库
			const result = await db.collection('baogao').add(report)
			
			return {
				code: 0,
				message: '报告提交成功',
				data: result
			}
		} catch (error) {
			return {
				code: -1,
				message: '报告提交失败',
				error: error.message
			}
		}
	},

	// 获取用户的工作报告列表
	async getWorkReports(uniIdToken, page = 1, pageSize = 20) {
		try {
			// 校验用户token
			const userCheck = await this.checkUserToken(uniIdToken)
			if (userCheck.code !== 0) {
				return userCheck
			}

			const uid = userCheck.uid
			const db = uniCloud.database()
			
			// 查询该用户的所有报告
			const result = await db.collection('baogao')
				.where({
					uid: uid
				})
				.orderBy('createTime', 'desc')
				.skip((page - 1) * pageSize)
				.limit(pageSize)
				.get()

			// 获取总数
			const countResult = await db.collection('baogao')
				.where({
					uid: uid
				})
				.count()

			return {
				code: 0,
				message: '获取报告列表成功',
				data: {
					list: result.data,
					total: countResult.total,
					page: page,
					pageSize: pageSize
				}
			}
		} catch (error) {
			return {
				code: -1,
				message: '获取报告列表失败',
				error: error.message
			}
		}
	},

	// 更新工作报告状态（领导审批）
	async updateReportStatus(uniIdToken, reportId, status, leaderComment = '') {
		try {
			// 校验用户token
			const userCheck = await this.checkUserToken(uniIdToken)
			if (userCheck.code !== 0) {
				return userCheck
			}

			const db = uniCloud.database()
			
			// 更新报告状态
			const updateData = {
				status: status,
				updateTime: new Date().toISOString()
			}

			// 如果有领导批语，添加到更新数据中
			if (leaderComment) {
				updateData.leaderComment = leaderComment
			}

			const result = await db.collection('baogao')
				.doc(reportId)
				.update(updateData)

			return {
				code: 0,
				message: '报告状态更新成功',
				data: result
			}
		} catch (error) {
			return {
				code: -1,
				message: '报告状态更新失败',
				error: error.message
			}
		}
	},

	// 删除工作报告
	async deleteWorkReport(uniIdToken, reportId) {
		try {
			// 校验用户token
			const userCheck = await this.checkUserToken(uniIdToken)
			if (userCheck.code !== 0) {
				return userCheck
			}

			const uid = userCheck.uid
			const db = uniCloud.database()
			
			// 删除报告（只能删除自己的报告）
			const result = await db.collection('baogao')
				.where({
					_id: reportId,
					uid: uid
				})
				.remove()

			return {
				code: 0,
				message: '报告删除成功',
				data: result
			}
		} catch (error) {
			return {
				code: -1,
				message: '报告删除失败',
				error: error.message
			}
		}
	}
}
