'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	console.log('=== 手机验证码登录云函数开始执行 ===');
	
	const { phone, code } = event;
	
	if (!phone || !code) {
		return {
			code: -1,
			message: '请输入手机号和验证码'
		};
	}
	
	try {
		// 验证短信验证码
		const smsCollection = db.collection('sms_codes');
		const smsCode = await smsCollection.where({
			phone: phone,
			code: code,
			used: false,
			expireTime: db.command.gt(new Date())
		}).get();
		
		if (smsCode.data.length === 0) {
			return {
				code: -1,
				message: '验证码错误或已过期'
			};
		}
		
		// 标记验证码为已使用
		await smsCollection.doc(smsCode.data[0]._id).update({
			used: true
		});
		
		// 查找或创建用户
		const userCollection = db.collection('users');
		let user = await userCollection.where({
			phone: phone
		}).get();
		
		if (user.data.length === 0) {
			// 创建新用户
			const newUser = {
				phone: phone,
				username: `user_${phone.slice(-4)}`,
				createTime: new Date(),
				updateTime: new Date()
			};
			
			const addResult = await userCollection.add(newUser);
			user = { data: [newUser] };
		}
		
		return {
			code: 0,
			message: '登录成功',
			userInfo: user.data[0]
		};
		
	} catch (error) {
		console.error('手机验证码登录失败:', error);
		return {
			code: -1,
			message: '登录失败'
		};
	}
};
