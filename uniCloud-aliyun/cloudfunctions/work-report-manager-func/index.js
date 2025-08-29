'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	console.log('=== 工作报告管理云函数开始执行 ===');
	console.log('接收到的参数:', event);
	
	const { method, token, ...params } = event;
	
	if (!method) {
		return {
			code: -1,
			message: '缺少方法名'
		};
	}
	
	try {
		switch (method) {
			case 'addWorkReport':
				return await addWorkReport(token, params);
			case 'getWorkReports':
				return await getWorkReports(token, params.page || 1, params.pageSize || 20);
			case 'updateReportStatus':
				return await updateReportStatus(token, params.reportId, params.status, params.leaderComment);
			case 'deleteWorkReport':
				return await deleteWorkReport(token, params.reportId);
			default:
				return {
					code: -1,
					message: '不支持的方法'
				};
		}
	} catch (error) {
		console.error('云函数执行失败:', error);
		return {
			code: -1,
			message: '操作失败',
			error: error.message
		};
	}
};

// 简化版本：直接使用传入的token作为uid
async function checkUserToken(token) {
	try {
		// 简化版本：直接返回token作为uid
		// 实际应用中应该验证token的有效性
		return {
			code: 0,
			message: 'token校验成功',
			uid: token
		};
	} catch (error) {
		return {
			code: -1,
			message: 'token校验失败',
			error: error.message
		};
	}
}

// 新增工作报告
async function addWorkReport(token, reportData) {
	try {
		// 校验用户token
		const userCheck = await checkUserToken(token);
		if (userCheck.code !== 0) {
			return userCheck;
		}

		const uid = userCheck.uid;
		
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
		};

		// 插入数据库
		const result = await db.collection('baogao').add(report);
		
		return {
			code: 0,
			message: '报告提交成功',
			data: result
		};
	} catch (error) {
		return {
			code: -1,
			message: '报告提交失败',
			error: error.message
		};
	}
}

// 获取用户的工作报告列表
async function getWorkReports(token, page = 1, pageSize = 20) {
	try {
		// 校验用户token
		const userCheck = await checkUserToken(token);
		if (userCheck.code !== 0) {
			return userCheck;
		}

		const uid = userCheck.uid;
		
		// 查询该用户的所有报告
		const result = await db.collection('baogao')
			.where({
				uid: uid
			})
			.orderBy('createTime', 'desc')
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.get();

		// 获取总数
		const countResult = await db.collection('baogao')
			.where({
				uid: uid
			})
			.count();

		return {
			code: 0,
			message: '获取报告列表成功',
			data: {
				list: result.data,
				total: countResult.total,
				page: page,
				pageSize: pageSize
			}
		};
	} catch (error) {
		return {
			code: -1,
			message: '获取报告列表失败',
			error: error.message
		};
	}
}

// 更新工作报告状态（领导审批）
async function updateReportStatus(token, reportId, status, leaderComment = '') {
	try {
		// 校验用户token
		const userCheck = await checkUserToken(token);
		if (userCheck.code !== 0) {
			return userCheck;
		}

		// 更新报告状态
		const updateData = {
			status: status,
			updateTime: new Date().toISOString()
		};

		// 如果有领导批语，添加到更新数据中
		if (leaderComment) {
			updateData.leaderComment = leaderComment;
		}

		const result = await db.collection('baogao')
			.doc(reportId)
			.update(updateData);

		return {
			code: 0,
			message: '报告状态更新成功',
			data: result
		};
	} catch (error) {
		return {
			code: -1,
			message: '报告状态更新失败',
			error: error.message
		};
	}
}

// 删除工作报告
async function deleteWorkReport(token, reportId) {
	try {
		// 校验用户token
		const userCheck = await checkUserToken(token);
		if (userCheck.code !== 0) {
			return userCheck;
		}

		const uid = userCheck.uid;
		
		// 删除报告（只能删除自己的报告）
		const result = await db.collection('baogao')
			.where({
				_id: reportId,
				uid: uid
			})
			.remove();

		return {
			code: 0,
			message: '报告删除成功',
			data: result
		};
	} catch (error) {
		return {
			code: -1,
			message: '报告删除失败',
			error: error.message
		};
	}
}
