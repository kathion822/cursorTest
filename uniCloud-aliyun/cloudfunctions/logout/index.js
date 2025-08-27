'use strict';

exports.main = async function(event, context) {
	console.log('=== 退出登录云函数开始执行 ===');
	
	const { token } = event;
	
	if (!token) {
		return {
			code: -1,
			message: '缺少token'
		};
	}
	
	try {
		// 这里可以添加token黑名单逻辑
		// 或者更新用户的登录状态
		
		console.log('用户退出登录，token:', token);
		
		return {
			code: 0,
			message: '退出登录成功'
		};
		
	} catch (error) {
		console.error('退出登录失败:', error);
		return {
			code: -1,
			message: '退出登录失败'
		};
	}
};
