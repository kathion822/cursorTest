'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	console.log('=== 账号密码登录云函数开始执行 ===');
	
	const { username, password } = event;
	
	if (!username || !password) {
		return {
			code: -1,
			message: '请输入用户名和密码'
		};
	}
	
	try {
		// 查询用户
		const userCollection = db.collection('users');
		const user = await userCollection.where({
			username: username,
			password: password // 实际应用中应该加密验证
		}).get();
		
		if (user.data.length === 0) {
			return {
				code: -1,
				message: '用户名或密码错误'
			};
		}
		
		const userInfo = user.data[0];
		
		return {
			code: 0,
			message: '登录成功',
			userInfo: userInfo
		};
		
	} catch (error) {
		console.error('账号密码登录失败:', error);
		return {
			code: -1,
			message: '登录失败'
		};
	}
};
