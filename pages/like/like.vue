<template>
	<view class="work-report-container">
		<!-- 页面标题 -->
		<view class="page-header">
			<text class="page-title">工作报告</text>
			<button class="new-report-btn" @click="showNewReportModal">新建报告</button>
		</view>
		
		<!-- 工作报告列表 -->
		<view class="report-list-section">
			<view class="section-title">
				<text class="title-text">历史报告</text>
				<text class="report-count">({{ reportList.length }})</text>
			</view>
			
			<view class="report-list" v-if="reportList.length > 0">
				<view 
					class="report-item" 
					v-for="(report, index) in reportList" 
					:key="report.id"
					@click="viewReportDetail(report)"
				>
					<view class="report-header">
						<text class="report-title">{{ report.title }}</text>
						<view class="report-status" :class="getStatusClass(report.status)">
							<text>{{ getStatusText(report.status) }}</text>
						</view>
					</view>
					<view class="report-info">
						<text class="report-date">{{ formatDate(report.createTime) }}</text>
						<text class="report-author">{{ report.author }}</text>
					</view>
					<view class="report-summary">
						<text class="summary-text">{{ report.summary }}</text>
					</view>
					<view class="report-footer">
						<view class="leader-comment" v-if="report.leaderComment">
							<text class="comment-label">领导批语:</text>
							<text class="comment-text">{{ report.leaderComment }}</text>
						</view>
						<view class="view-detail">
							<text class="detail-text">点击查看详情 →</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="empty-state" v-else>
				<text class="empty-text">暂无工作报告</text>
				<text class="empty-tip">点击上方"新建报告"开始创建</text>
			</view>
		</view>
		
		<!-- 新建/编辑报告弹窗 -->
		<uni-popup ref="reportModal" type="center" :mask-click="false">
			<view class="report-modal">
				<view class="modal-header">
					<text class="modal-title">{{ isEditing ? '编辑报告' : '新建报告' }}</text>
					<text class="close-btn" @click="closeReportModal">×</text>
				</view>
				<view class="modal-body">
					<view class="form-group">
						<text class="form-label">报告标题 *</text>
						<input 
							class="form-input" 
							v-model="reportForm.title" 
							placeholder="请输入报告标题"
							maxlength="50"
						/>
					</view>
					
					<view class="form-group">
						<text class="form-label">工作内容 *</text>
						<textarea 
							class="form-textarea" 
							v-model="reportForm.content" 
							placeholder="请详细描述工作内容、完成情况、遇到的问题等"
							maxlength="1000"
							:maxlength="-1"
						/>
						<text class="char-count">{{ reportForm.content.length }}/1000</text>
					</view>
					
					<view class="form-group">
						<text class="form-label">工作总结</text>
						<textarea 
							class="form-textarea" 
							v-model="reportForm.summary" 
							placeholder="请总结本次工作的要点和成果"
							maxlength="200"
							:maxlength="-1"
						/>
						<text class="char-count">{{ reportForm.summary.length }}/200</text>
					</view>
					
					<view class="form-group">
						<text class="form-label">下次计划</text>
						<textarea 
							class="form-textarea" 
							v-model="reportForm.nextPlan" 
							placeholder="请描述下次工作的计划和目标"
							maxlength="300"
							:maxlength="-1"
						/>
						<text class="char-count">{{ reportForm.nextPlan.length }}/300</text>
					</view>
					
					<view class="button-group">
						<button class="cancel-btn" @click="closeReportModal">取消</button>
						<button class="save-btn" @click="saveReport" :disabled="!isFormValid">保存</button>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 报告详情弹窗 -->
		<uni-popup ref="detailModal" type="center" :mask-click="false">
			<view class="detail-modal">
				<view class="modal-header">
					<text class="modal-title">报告详情</text>
					<text class="close-btn" @click="closeDetailModal">×</text>
				</view>
				<view class="modal-body">
					<view class="detail-section">
						<text class="detail-label">报告标题</text>
						<text class="detail-content">{{ currentReport.title }}</text>
					</view>
					
					<view class="detail-section">
						<text class="detail-label">创建时间</text>
						<text class="detail-content">{{ formatDate(currentReport.createTime) }}</text>
					</view>
					
					<view class="detail-section">
						<text class="detail-label">报告作者</text>
						<text class="detail-content">{{ currentReport.author }}</text>
					</view>
					
					<view class="detail-section">
						<text class="detail-label">工作内容</text>
						<text class="detail-content content-text">{{ currentReport.content }}</text>
					</view>
					
					<view class="detail-section" v-if="currentReport.summary">
						<text class="detail-label">工作总结</text>
						<text class="detail-content content-text">{{ currentReport.summary }}</text>
					</view>
					
					<view class="detail-section" v-if="currentReport.nextPlan">
						<text class="detail-label">下次计划</text>
						<text class="detail-content content-text">{{ currentReport.nextPlan }}</text>
					</view>
					
					<view class="detail-section" v-if="currentReport.leaderComment">
						<text class="detail-label">领导批语</text>
						<view class="leader-comment-box">
							<text class="comment-text">{{ currentReport.leaderComment }}</text>
							<text class="comment-time">{{ formatDate(currentReport.commentTime) }}</text>
						</view>
					</view>
					
					<view class="detail-actions">
						<button class="edit-btn" @click="editReport" v-if="currentReport.status === 'draft'">编辑报告</button>
						<button class="close-detail-btn" @click="closeDetailModal">关闭</button>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 报告列表
			reportList: [],
			// 当前查看的报告
			currentReport: {},
			// 是否正在编辑
			isEditing: false,
			// 报告表单
			reportForm: {
				id: '',
				title: '',
				content: '',
				summary: '',
				nextPlan: ''
			},
			// 模拟数据
			mockReports: [
				{
					id: '1',
					title: '本周项目开发进度报告',
					content: '本周主要完成了用户管理模块的开发，包括用户注册、登录、权限管理等功能。在开发过程中遇到了一些技术难点，通过查阅资料和团队讨论得到了解决。整体进度符合预期，预计下周可以完成测试阶段。',
					summary: '用户管理模块开发完成，技术难点已解决，进度符合预期。',
					nextPlan: '下周进行功能测试，修复发现的bug，准备部署上线。',
					author: '张三',
					status: 'approved',
					createTime: '2024-01-15 14:30:00',
					leaderComment: '工作进展良好，技术难点解决得当。建议在测试阶段重点关注用户体验，确保功能稳定性。',
					commentTime: '2024-01-16 09:15:00'
				},
				{
					id: '2',
					title: '月度工作总结报告',
					content: '本月完成了三个重要项目的交付，客户满意度较高。团队协作效率提升，新员工培训计划执行顺利。在项目管理方面积累了一些经验，为后续工作提供了参考。',
					summary: '三个项目成功交付，团队效率提升，新员工培训完成。',
					nextPlan: '下月重点推进新项目立项，优化项目管理流程，提升团队技能。',
					author: '李四',
					status: 'pending',
					createTime: '2024-01-10 16:45:00',
					leaderComment: '',
					commentTime: ''
				},
				{
					id: '3',
					title: '技术调研报告',
					content: '针对新技术的应用进行了深入调研，分析了技术优势、适用场景和潜在风险。通过对比分析，推荐采用新技术方案，预计可以提升系统性能30%以上。',
					summary: '新技术调研完成，推荐采用，预计性能提升30%以上。',
					nextPlan: '制定技术迁移计划，进行小规模试点，评估实际效果。',
					author: '王五',
					status: 'draft',
					createTime: '2024-01-12 11:20:00',
					leaderComment: '',
					commentTime: ''
				}
			]
		};
	},
	
	computed: {
		// 表单验证
		isFormValid() {
			return this.reportForm.title.trim() && this.reportForm.content.trim();
		}
	},
	
	mounted() {
		// 检测当前运行平台
		try {
			const systemInfo = uni.getSystemInfoSync();
			console.log('系统信息:', systemInfo);
			console.log('运行平台:', systemInfo.platform);
			console.log('运行环境:', systemInfo.uniPlatform);
		} catch (error) {
			console.warn('获取系统信息失败:', error);
		}
		
		// 加载报告列表
		this.loadReportList();
	},
	
	methods: {
		// 加载报告列表
		loadReportList() {
			try {
				// 尝试从本地存储加载数据
				const storedReports = uni.getStorageSync('workReports');
				if (storedReports && Array.isArray(storedReports)) {
					this.reportList = storedReports;
					console.log('从本地存储加载报告:', this.reportList.length);
				} else {
					// 如果没有本地数据，使用模拟数据
					this.reportList = [...this.mockReports];
					console.log('使用模拟数据:', this.reportList.length);
				}
			} catch (error) {
				console.warn('加载本地数据失败，使用模拟数据:', error);
				// 如果本地存储访问失败，使用模拟数据
				this.reportList = [...this.mockReports];
			}
		},
		
		// 显示新建报告弹窗
		showNewReportModal() {
			this.isEditing = false;
			this.resetForm();
			this.$refs.reportModal.open();
		},
		
		// 关闭报告弹窗
		closeReportModal() {
			this.$refs.reportModal.close();
			this.resetForm();
		},
		
		// 关闭详情弹窗
		closeDetailModal() {
			this.$refs.detailModal.close();
		},
		
		// 重置表单
		resetForm() {
			this.reportForm = {
				id: '',
				title: '',
				content: '',
				summary: '',
				nextPlan: ''
			};
		},
		
		// 保存报告
		async saveReport() {
			if (!this.isFormValid) {
				uni.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}
			
			try {
				uni.showLoading({ title: '保存中...' });
				
				// 模拟网络延迟
				await new Promise(resolve => setTimeout(resolve, 500));
				
				if (this.isEditing) {
					// 编辑现有报告
					const index = this.reportList.findIndex(item => item.id === this.reportForm.id);
					if (index !== -1) {
						this.reportList[index] = {
							...this.reportList[index],
							...this.reportForm,
							updateTime: new Date().toISOString()
						};
					}
				} else {
					// 创建新报告
					const newReport = {
						id: Date.now().toString(),
						...this.reportForm,
						author: '当前用户',
						status: 'draft',
						createTime: new Date().toISOString(),
						leaderComment: '',
						commentTime: ''
					};
					this.reportList.unshift(newReport);
				}
				
				// 保存到本地存储（实际应用中应该保存到服务器）
				try {
					uni.setStorageSync('workReports', this.reportList);
				} catch (storageError) {
					console.warn('本地存储失败，使用内存存储:', storageError);
					// 如果本地存储失败，至少保持在内存中
				}
				
				uni.showToast({
					title: this.isEditing ? '更新成功' : '创建成功',
					icon: 'success'
				});
				
				this.closeReportModal();
				
			} catch (error) {
				console.error('保存报告失败:', error);
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 查看报告详情
		viewReportDetail(report) {
			this.currentReport = { ...report };
			this.$refs.detailModal.open();
		},
		
		// 编辑报告
		editReport() {
			this.isEditing = true;
			this.reportForm = { ...this.currentReport };
			this.closeDetailModal();
			this.$refs.reportModal.open();
		},
		
		// 获取状态样式类
		getStatusClass(status) {
			const statusMap = {
				draft: 'status-draft',
				pending: 'status-pending',
				approved: 'status-approved',
				rejected: 'status-rejected'
			};
			return statusMap[status] || 'status-draft';
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				draft: '草稿',
				pending: '待审批',
				approved: '已通过',
				rejected: '已拒绝'
			};
			return statusMap[status] || '草稿';
		},
		
		// 格式化日期
		formatDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
		},
		
		// 选择头像
		async chooseAvatar() {
			try {
				// 检查当前平台
				const platform = uni.getSystemInfoSync().platform;
				console.log('当前运行平台:', platform);
				
				// 在小程序中使用chooseImage，在H5中使用input
				if (platform === 'devtools' || platform === 'mp-weixin') {
					// 小程序环境
					this.chooseImageInMiniProgram();
				} else {
					// H5环境
					this.chooseImageInH5();
				}
			} catch (error) {
				console.error('头像选择失败:', error);
				uni.showToast({
					title: '头像选择失败',
					icon: 'none'
				});
			}
		},
		
		// 小程序环境下的头像选择
		chooseImageInMiniProgram() {
			if (!uni.chooseImage) {
				uni.showToast({
					title: '当前环境不支持头像选择',
					icon: 'none'
				});
				return;
			}
			
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					try {
						console.log('选择头像成功:', res);
						const tempFilePath = res.tempFilePaths[0];
						
						uni.showLoading({ title: '上传头像中...' });
						
						// 上传头像到云存储
						const uploadResult = await this.uploadAvatar(tempFilePath);
						
						if (uploadResult) {
							// 更新用户头像
							this.userInfo.avatarUrl = uploadResult;
							
							// 保存到本地存储
							uni.setStorageSync('userInfo', this.userInfo);
							
							// 更新到云数据库
							await this.updateUserInfo({ avatarUrl: this.userInfo.avatarUrl });
							
							uni.showToast({
								title: '头像更新成功',
								icon: 'success'
							});
						}
					} catch (error) {
						console.error('处理头像失败:', error);
						uni.showToast({
							title: '头像处理失败',
							icon: 'none'
						});
					} finally {
						uni.hideLoading();
					}
				},
				fail: (error) => {
					console.error('选择头像失败:', error);
					if (error.errMsg && error.errMsg.includes('cancel')) {
						// 用户取消选择
						return;
					}
					uni.showToast({
						title: '选择头像失败',
						icon: 'none'
					});
				}
			});
		},
		
		// H5环境下的头像选择
		chooseImageInH5() {
			// 创建文件输入元素
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = 'image/*';
			input.style.display = 'none';
			
			// 监听文件选择
			input.onchange = async (event) => {
				try {
					const file = event.target.files[0];
					if (!file) return;
					
					console.log('H5选择头像成功:', file);
					
					// 检查文件大小（限制为5MB）
					if (file.size > 5 * 1024 * 1024) {
						uni.showToast({
							title: '图片大小不能超过5MB',
							icon: 'none'
						});
						return;
					}
					
					// 检查文件类型
					if (!file.type.startsWith('image/')) {
						uni.showToast({
							title: '请选择图片文件',
							icon: 'none'
						});
						return;
					}
					
					uni.showLoading({ title: '处理头像中...' });
					
					// 将文件转换为临时路径
					const tempFilePath = URL.createObjectURL(file);
					
					// 模拟上传（H5环境下）
					const uploadResult = await this.uploadAvatarInH5(file);
					
					if (uploadResult) {
						// 更新用户头像
						this.userInfo.avatarUrl = uploadResult;
						
						// 保存到本地存储
						uni.setStorageSync('userInfo', this.userInfo);
						
						// 更新到云数据库
						await this.updateUserInfo({ avatarUrl: this.userInfo.avatarUrl });
						
						uni.showToast({
							title: '头像更新成功',
							icon: 'success'
						});
					}
					
					// 清理临时URL
					URL.revokeObjectURL(tempFilePath);
					
				} catch (error) {
					console.error('H5头像处理失败:', error);
					uni.showToast({
						title: '头像处理失败',
						icon: 'none'
					});
				} finally {
					uni.hideLoading();
				}
			};
			
			// 触发文件选择
			document.body.appendChild(input);
			input.click();
			
			// 清理DOM元素
			setTimeout(() => {
				document.body.removeChild(input);
			}, 1000);
		},
		
		// H5环境下的头像上传
		async uploadAvatarInH5(file) {
			try {
				console.log('H5头像上传开始:', file);
				
				// 生成唯一的文件名
				const timestamp = Date.now();
				const random = Math.random().toString(36).substring(2, 11);
				const fileName = `avatar_${this.userInfo.userId}_${timestamp}_${random}.jpg`;
				
				// 在H5环境下，我们返回一个模拟的URL
				// 实际应用中，这里应该调用真实的上传API
				const mockUrl = `data:${file.type};base64,${await this.fileToBase64(file)}`;
				
				console.log('H5头像上传完成，生成模拟URL');
				return mockUrl;
				
			} catch (error) {
				console.error('H5头像上传失败:', error);
				throw error;
			}
		},
		
		// 文件转Base64
		fileToBase64(file) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const base64 = reader.result.split(',')[1];
					resolve(base64);
				};
				reader.onerror = reject;
				reader.readAsDataURL(file);
			});
		}
	}
};
</script>

<style lang="scss">
.work-report-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding: 20rpx;
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
	padding: 20rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.page-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
}

.new-report-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	border: none;
	border-radius: 25rpx;
	padding: 16rpx 32rpx;
	font-size: 28rpx;
	font-weight: 500;
}

.report-list-section {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.section-title {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
}

.title-text {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.report-count {
	font-size: 24rpx;
	color: #999;
	margin-left: 10rpx;
}

.report-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.report-item {
	background-color: #fafafa;
	border-radius: 12rpx;
	padding: 24rpx;
	border-left: 6rpx solid #667eea;
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.98);
		background-color: #f0f0f0;
	}
}

.report-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.report-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	flex: 1;
}

.report-status {
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: 500;
	
	&.status-draft {
		background-color: #e3f2fd;
		color: #1976d2;
	}
	
	&.status-pending {
		background-color: #fff3e0;
		color: #f57c00;
	}
	
	&.status-approved {
		background-color: #e8f5e8;
		color: #388e3c;
	}
	
	&.status-rejected {
		background-color: #ffebee;
		color: #d32f2f;
	}
}

.report-info {
	display: flex;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.report-date, .report-author {
	font-size: 24rpx;
	color: #666;
}

.report-summary {
	margin-bottom: 20rpx;
}

.summary-text {
	font-size: 26rpx;
	color: #555;
	line-height: 1.5;
}

.report-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.leader-comment {
	display: flex;
	align-items: center;
	flex: 1;
}

.comment-label {
	font-size: 22rpx;
	color: #999;
	margin-right: 10rpx;
}

.comment-text {
	font-size: 22rpx;
	color: #666;
	flex: 1;
}

.view-detail {
	text-align: right;
}

.detail-text {
	font-size: 22rpx;
	color: #667eea;
}

.empty-state {
	text-align: center;
	padding: 80rpx 20rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	display: block;
	margin-bottom: 16rpx;
}

.empty-tip {
	font-size: 24rpx;
	color: #ccc;
}

/* 弹窗样式 */
.report-modal, .detail-modal {
	background-color: #fff;
	border-radius: 20rpx;
	width: 90vw;
	max-width: 600rpx;
	max-height: 80vh;
	overflow: hidden;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #eee;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.close-btn {
	font-size: 40rpx;
	color: #999;
	background: none;
	border: none;
	padding: 0;
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-body {
	padding: 30rpx;
	max-height: 60vh;
	overflow-y: auto;
}

.form-group {
	margin-bottom: 24rpx;
	position: relative;
}

.form-label {
	display: block;
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 12rpx;
}

.form-input, .form-textarea {
	width: 100%;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	padding: 16rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #fafafa;
	
	&:focus {
		border-color: #667eea;
		background-color: #fff;
	}
}

.form-textarea {
	min-height: 120rpx;
	resize: none;
}

.char-count {
	position: absolute;
	right: 16rpx;
	bottom: 16rpx;
	font-size: 22rpx;
	color: #999;
}

.button-group {
	display: flex;
	gap: 20rpx;
	margin-top: 40rpx;
}

.cancel-btn, .save-btn {
	flex: 1;
	padding: 20rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	font-weight: 500;
	border: none;
}

.cancel-btn {
	background-color: #f5f5f5;
	color: #666;
}

.save-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: #fff;
	
	&:disabled {
		background: #ccc;
		opacity: 0.6;
	}
}

/* 详情弹窗样式 */
.detail-section {
	margin-bottom: 24rpx;
}

.detail-label {
	display: block;
	font-size: 26rpx;
	font-weight: 500;
	color: #666;
	margin-bottom: 8rpx;
}

.detail-content {
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
	
	&.content-text {
		background-color: #f9f9f9;
		padding: 16rpx;
		border-radius: 8rpx;
		white-space: pre-wrap;
	}
}

.leader-comment-box {
	background-color: #fff3e0;
	padding: 20rpx;
	border-radius: 8rpx;
	border-left: 4rpx solid #ff9800;
}

.comment-text {
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
	display: block;
	margin-bottom: 12rpx;
}

.comment-time {
	font-size: 22rpx;
	color: #999;
}

.detail-actions {
	display: flex;
	gap: 20rpx;
	margin-top: 40rpx;
}

.edit-btn, .close-detail-btn {
	flex: 1;
	padding: 20rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	font-weight: 500;
	border: none;
}

.edit-btn {
	background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
	color: #fff;
}

.close-detail-btn {
	background-color: #f5f5f5;
	color: #666;
}
</style>
