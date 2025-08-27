'use strict';

exports.main = async function(event, context) {
	console.log('=== 获取微信头像云函数开始执行 ===');
	console.log('云函数环境信息:', {
		platform: context.PLATFORM,
		clientIP: context.CLIENTIP,
		userAgent: context.USERAGENT,
		requestId: context.REQUESTID
	});
	
	const { openid } = event;
	
	if (!openid) {
		console.error('缺少openid参数');
		return {
			code: -1,
			message: '缺少openid'
		};
	}
	
	try {
		console.log('获取微信头像，openid:', openid);
		
		// 注意：由于微信小程序的隐私政策限制，无法直接通过API获取用户头像
		// 微信在2021年4月后，不再支持通过code获取用户头像
		// 建议使用以下替代方案：
		
		// 方案1：返回默认头像
		const defaultAvatarUrl = '/static/default-avatar.png';
		
		// 方案2：如果用户之前上传过头像，从数据库获取
		// 这里需要查询用户表获取之前保存的头像
		
		console.log('由于微信API限制，返回默认头像');
		console.log('建议用户手动选择头像上传');
		
		return {
			code: 0,
			message: '由于微信隐私政策限制，无法获取微信头像。请手动选择头像上传。',
			avatarUrl: defaultAvatarUrl,
			note: '微信在2021年4月后不再支持通过API获取用户头像，建议使用头像选择器'
		};
		
	} catch (error) {
		console.error('获取微信头像失败:', error);
		console.error('错误详情:', {
			message: error.message,
			stack: error.stack
		});
		
		return {
			code: -1,
			message: `获取头像失败: ${error.message}`
		};
	}
};
