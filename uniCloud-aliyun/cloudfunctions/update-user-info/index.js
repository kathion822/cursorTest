'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	console.log('=== 更新用户信息云函数开始执行 ===');
	
	const { userId, updateData } = event;
	
	if (!userId || !updateData) {
		return {
			code: -1,
			message: '缺少必要参数'
		};
	}
	
	try {
		console.log('更新用户信息:', { userId, updateData });
		
		// 添加更新时间
		const updateInfo = {
			...updateData,
			updateTime: new Date()
		};
		
		// 更新用户信息
		const userCollection = db.collection('users');
		const result = await userCollection.where({
			userId: userId
		}).update(updateInfo);
		
		if (result.updated === 1) {
			console.log('用户信息更新成功');
			return {
				code: 0,
				message: '更新成功'
			};
		} else {
			console.log('用户信息更新失败，未找到用户');
			return {
				code: -1,
				message: '用户不存在'
			};
		}
		
	} catch (error) {
		console.error('更新用户信息失败:', error);
		return {
			code: -1,
			message: '更新失败'
		};
	}
};
