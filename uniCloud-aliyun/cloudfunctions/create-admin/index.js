'use strict';

const db = uniCloud.database();
const crypto = require('crypto');

exports.main = async function(event, context) {
	console.log('=== 创建超级管理员云函数开始执行 ===');
	console.log('接收到的参数:', event);
	
	const { username, password, email } = event;
	
	if (!username || !password) {
		return {
			code: -1,
			message: '用户名和密码不能为空'
		};
	}
	
	try {
		// 检查是否已存在超级管理员
		const existingAdmin = await db.collection('users').where({
			role: 'admin'
		}).get();
		
		if (existingAdmin.data.length > 0) {
			return {
				code: -1,
				message: '超级管理员已存在'
			};
		}
		
		// 生成用户ID和token
		const uid = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
		const token = crypto.createHash('md5').update(uid + Date.now()).digest('hex');
		
		// 创建超级管理员用户
		const adminUser = {
			uid: uid,
			userId: uid,
			username: username,
			password: password, // 实际应用中应该加密
			email: email || '',
			role: 'admin',
			nickname: '超级管理员',
			status: 1,
			createTime: new Date().toISOString(),
			updateTime: new Date().toISOString()
		};
		
		// 保存到数据库
		const result = await db.collection('users').add(adminUser);
		
		console.log('=== 超级管理员创建成功 ===');
		console.log('用户ID:', uid);
		console.log('Token:', token);
		
		return {
			code: 0,
			message: '超级管理员创建成功',
			data: {
				uid: uid,
				token: token,
				username: username
			}
		};
		
	} catch (error) {
		console.error('=== 超级管理员创建失败 ===');
		console.error('错误详情:', error);
		
		return {
			code: -1,
			message: `创建失败: ${error.message}`
		};
	}
};
