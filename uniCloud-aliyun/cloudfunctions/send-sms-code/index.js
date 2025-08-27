'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	console.log('=== 发送短信验证码云函数开始执行 ===');
	
	const { phone } = event;
	
	if (!phone) {
		return {
			code: -1,
			message: '请输入手机号'
		};
	}
	
	try {
		// 生成6位验证码
		const code = Math.floor(100000 + Math.random() * 900000).toString();
		
		// 保存验证码到数据库（设置过期时间）
		const smsCollection = db.collection('sms_codes');
		await smsCollection.add({
			phone: phone,
			code: code,
			createTime: new Date(),
			expireTime: new Date(Date.now() + 5 * 60 * 1000), // 5分钟过期
			used: false
		});
		
		// 这里应该调用实际的短信发送API
		console.log(`向手机号 ${phone} 发送验证码: ${code}`);
		
		return {
			code: 0,
			message: '验证码已发送',
			code: code // 实际应用中不应该返回验证码
		};
		
	} catch (error) {
		console.error('发送短信验证码失败:', error);
		return {
			code: -1,
			message: '发送失败'
		};
	}
};
