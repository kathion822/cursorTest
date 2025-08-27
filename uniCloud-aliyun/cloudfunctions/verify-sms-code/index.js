'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	console.log('=== 验证短信验证码云函数开始执行 ===');
	
	const { phone, code } = event;
	
	if (!phone || !code) {
		return {
			code: -1,
			message: '缺少必要参数'
		};
	}
	
	try {
		console.log('验证短信验证码:', { phone, code });
		
		// 查询短信验证码
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
		
		console.log('短信验证码验证成功');
		return {
			code: 0,
			message: '验证成功'
		};
		
	} catch (error) {
		console.error('验证短信验证码失败:', error);
		return {
			code: -1,
			message: '验证失败'
		};
	}
};
