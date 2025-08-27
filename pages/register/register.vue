<template>
	<view class="register-container">
		<!-- 页面标题 -->
		<view class="register-header">
			<text class="register-title">用户注册</text>
			<text class="register-subtitle">创建您的账号</text>
		</view>
		
		<!-- 注册表单 -->
		<view class="register-form">
			<view class="form-group">
				<text class="form-label">用户名</text>
				<input class="form-input" v-model="registerForm.username" placeholder="请输入用户名" />
			</view>
			
			<view class="form-group">
				<text class="form-label">手机号</text>
				<input class="form-input" v-model="registerForm.phone" placeholder="请输入手机号" />
			</view>
			
			<view class="form-group">
				<text class="form-label">密码</text>
				<input class="form-input" v-model="registerForm.password" type="password" placeholder="请输入密码" />
			</view>
			
			<view class="form-group">
				<text class="form-label">确认密码</text>
				<input class="form-input" v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" />
			</view>
			
			<button class="register-btn" @click="handleRegister">立即注册</button>
		</view>
		
		<!-- 其他选项 -->
		<view class="register-options">
			<text class="login-link" @click="goToLogin">已有账号？立即登录</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			registerForm: {
				username: '',
				phone: '',
				password: '',
				confirmPassword: ''
			}
		};
	},
	
	methods: {
		// 处理注册
		async handleRegister() {
			// 表单验证
			if (!this.registerForm.username) {
				uni.showToast({
					title: '请输入用户名',
					icon: 'none'
				});
				return;
			}
			
			if (!this.registerForm.phone) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return;
			}
			
			if (!this.registerForm.password) {
				uni.showToast({
					title: '请输入密码',
					icon: 'none'
				});
				return;
			}
			
			if (this.registerForm.password !== this.registerForm.confirmPassword) {
				uni.showToast({
					title: '两次密码输入不一致',
					icon: 'none'
				});
				return;
			}
			
			try {
				uni.showLoading({ title: '注册中...' });
				
				// 调用注册云函数
				const result = await uniCloud.callFunction({
					name: 'user-register',
					data: {
						username: this.registerForm.username,
						phone: this.registerForm.phone,
						password: this.registerForm.password
					}
				});
				
				if (result.result.code === 0) {
					uni.showToast({
						title: '注册成功',
						icon: 'success'
					});
					
					// 延迟跳转到登录页
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({
						title: result.result.message || '注册失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('注册失败:', error);
				uni.showToast({
					title: '注册失败，请重试',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 跳转到登录页
		goToLogin() {
			uni.navigateBack();
		}
	}
}
</script>

<style lang="scss">
.register-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx 30rpx;
}

.register-header {
	text-align: center;
	margin-bottom: 60rpx;
	padding-top: 60rpx;
	
	.register-title {
		font-size: 48rpx;
		font-weight: bold;
		color: white;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.register-subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.8);
	}
}

.register-form {
	background: white;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	
	.form-group {
		margin-bottom: 30rpx;
		
		.form-label {
			font-size: 28rpx;
			color: #333;
			display: block;
			margin-bottom: 15rpx;
			font-weight: 500;
		}
		
		.form-input {
			width: 100%;
			height: 80rpx;
			border: 1rpx solid #ddd;
			border-radius: 10rpx;
			padding: 0 20rpx;
			font-size: 28rpx;
			box-sizing: border-box;
			
			&:focus {
				border-color: #2867ce;
			}
		}
	}
	
	.register-btn {
		width: 100%;
		height: 80rpx;
		background: #2867ce;
		color: white;
		border: none;
		border-radius: 10rpx;
		font-size: 30rpx;
		margin-top: 20rpx;
	}
}

.register-options {
	text-align: center;
	
	.login-link {
		color: rgba(255, 255, 255, 0.9);
		font-size: 28rpx;
		text-decoration: underline;
	}
}
</style>
