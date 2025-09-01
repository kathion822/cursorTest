'use strict';

exports.main = async function(event, context) {
	console.log('=== 时间格式化云函数开始执行 ===');
	console.log('接收到的参数:', event);
	
	const { timeString, format = 'yyyy-MM-dd' } = event;
	
	if (!timeString) {
		return {
			code: -1,
			message: '时间字符串不能为空'
		};
	}
	
	try {
		let date;
		
		// 处理不同的时间格式
		if (typeof timeString === 'string') {
			if (timeString.includes('T')) {
				// ISO 格式：2025-08-29T17:30:32.123Z
				date = new Date(timeString);
			} else if (timeString.includes('-')) {
				// 标准格式：2025-08-29 17:30:32
				date = new Date(timeString.replace(/-/g, '/'));
			} else {
				date = new Date(timeString);
			}
		} else if (timeString instanceof Date) {
			date = timeString;
		} else {
			date = new Date(timeString);
		}
		
		// 检查日期是否有效
		if (isNaN(date.getTime())) {
			return {
				code: -1,
				message: '无效的时间格式'
			};
		}
		
		// 格式化日期
		let formattedDate;
		if (format === 'yyyy-MM-dd') {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			formattedDate = `${year}-${month}-${day}`;
		} else if (format === 'MM/dd/yyyy') {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			formattedDate = `${month}/${day}/${year}`;
		} else {
			// 默认格式：yyyy-MM-dd
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			formattedDate = `${year}-${month}-${day}`;
		}
		
		console.log('=== 时间格式化成功 ===');
		console.log('原始时间:', timeString);
		console.log('格式化后:', formattedDate);
		
		return {
			code: 0,
			message: '时间格式化成功',
			data: {
				original: timeString,
				formatted: formattedDate,
				timestamp: date.getTime()
			}
		};
		
	} catch (error) {
		console.error('=== 时间格式化失败 ===');
		console.error('错误详情:', error);
		
		return {
			code: -1,
			message: `格式化失败: ${error.message}`
		};
	}
};
