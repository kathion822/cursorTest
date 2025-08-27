'use strict';

exports.main = async function(event, context) {
	console.log('=== 一键登录云函数开始执行 ===');
	
	try {
		// 这里应该集成实际的一键登录SDK
		// 暂时返回模拟数据
		const userInfo = {
			phone: `138****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
			deviceId: `device_${Date.now()}`,
			platform: 'quick'
		};
		
		return {
			code: 0,
			message: '一键登录成功',
			userInfo: userInfo
		};
		
	} catch (error) {
		console.error('一键登录失败:', error);
		return {
			code: -1,
			message: '一键登录失败'
		};
	}
};
