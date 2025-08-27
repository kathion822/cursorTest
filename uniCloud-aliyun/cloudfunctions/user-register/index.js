'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	console.log('=== 用户注册云函数开始执行 ===');
	
	const { username, phone, password } = event;
	
	if (!username || !phone || !password) {
		return {
			code: -1,
			message: '请填写完整的注册信息'
		};
	}
	
	try {
		// 检查用户名是否已存在
		const userCollection = db.collection('users');
		const existingUsername = await userCollection.where({
			username: username
		}).get();
		
		if (existingUsername.data.length > 0) {
			return {
				code: -1,
				message: '用户名已存在'
			};
		}
		
		// 检查手机号是否已存在
		const existingPhone = await userCollection.where({
			phone: phone
		}).get();
		
		if (existingPhone.data.length > 0) {
			return {
				code: -1,
				message: '手机号已被注册'
			};
		}
		
		// 生成统一用户ID
		const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		
		// 创建新用户
		const newUser = {
			userId: userId,
			username: username,
			phone: phone,
			password: password, // 实际应用中应该加密存储
			loginType: 'password',
			platform: 'password',
			status: 1, // 启用状态
			createTime: new Date(),
			updateTime: new Date(),
			lastLoginTime: new Date()
		};
		
		const addResult = await userCollection.add(newUser);
		console.log('用户注册成功:', addResult);
		
		return {
			code: 0,
			message: '注册成功',
			userId: userId
		};
		
	} catch (error) {
		console.error('用户注册失败:', error);
		return {
			code: -1,
			message: '注册失败，请重试'
		};
	}
};
