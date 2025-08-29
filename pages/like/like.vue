<template>
	<view class="work-report-container">
		<!-- 页面标题 -->
		<view class="page-header">
			<text class="page-title">主页</text>
			<view class="header-actions">
				<text class="action-icon">⋯</text>
				<text class="action-icon">◎</text>
		</view>
			</view>
			
		<!-- 标签页 -->
		<view class="tab-container">
			<view class="tab-item" :class="{ active: activeTab === 'new' }" @click="switchTab('new')">
				<text class="tab-text">新建报告</text>
						</view>
			<view class="tab-item" :class="{ active: activeTab === 'history' }" @click="switchTab('history')">
				<text class="tab-text">历史报告</text>
				</view>
			</view>
			
		<!-- 新建报告表单 -->
		<view class="form-container" v-if="activeTab === 'new'">
			<view class="form-group">
				<text class="form-label">报告标题</text>
				<input 
					class="form-input" 
					v-model="reportForm.title" 
					placeholder="请输入报告标题"
					maxlength="50"
				/>
			</view>
			
			<view class="form-group">
				<text class="form-label">报告日期</text>
				<view class="form-input date-display" @click="showDatePicker">
					<text v-if="reportForm.date" class="date-text">{{ reportForm.date }}</text>
					<text v-else class="date-placeholder">请选择日期</text>
				</view>
				<text class="form-tip">只能选择当天及之前的日期</text>
			</view>
			
			<view class="form-group">
				<text class="form-label">工作内容</text>
				<textarea 
					class="form-textarea" 
					v-model="reportForm.content" 
					placeholder="请输入工作内容"
					maxlength="1000"
				/>
			</view>
			
			<view class="form-group">
				<text class="form-label">工作计划</text>
				<textarea 
					class="form-textarea" 
					v-model="reportForm.plan" 
					placeholder="请输入下周工作计划"
					maxlength="300"
				/>
			</view>
			
			<view class="form-group">
				<text class="form-label">遇到的问题</text>
				<textarea 
					class="form-textarea" 
					v-model="reportForm.problems" 
					placeholder="请输入遇到的问题(选填)"
					maxlength="200"
				/>
			</view>
			
			<button class="submit-btn" @click="submitReport">提交报告</button>
		</view>
		
		<!-- 历史报告列表 -->
		<view class="history-container" v-if="activeTab === 'history'">
			<!-- 搜索和筛选区域 -->
			<view class="filter-section">
				<!-- 搜索框 -->
				<view class="search-container">
					<input 
						class="search-input" 
						v-model="searchKeyword" 
						:placeholder="!searchKeyword || searchKeyword.trim().length < 2 ? '搜索报告标题或内容...' : ''"
						@input="onSearchInput"
					/>
					<text class="search-icon">🔍</text>
				</view>
				
				<!-- 筛选行 -->
				<view class="filter-row">
					<view class="filter-item" @click="showCategoryFilter">
						<text class="filter-text">{{ selectedCategory }}</text>
						<text class="filter-arrow">▼</text>
			</view>
					<view class="filter-item" @click="showHistoryDatePicker">
						<text class="filter-text">{{ selectedDateText }}</text>
						<text class="filter-icon">📅</text>
					</view>
					<view class="filter-reset" @click="resetFilters" v-if="searchKeyword">
						<text class="reset-text">重置</text>
					</view>
				</view>
			</view>
			
			<!-- 报告统计卡片 -->
			<view class="stats-card">
				<view class="stats-item">
					<text class="stats-number">{{ reportList.length }}</text>
					<text class="stats-label">总报告</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ approvedCount }}</text>
					<text class="stats-label">已批阅</text>
				</view>
				<view class="stats-item">
					<text class="stats-number">{{ pendingCount }}</text>
					<text class="stats-label">待批阅</text>
				</view>
					</view>
					
			<!-- 报告列表 -->
			<view class="report-list" v-if="filteredReportList.length > 0">
				<view 
					class="report-item" 
					v-for="(report, index) in filteredReportList" 
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
						<text class="report-date">{{ formatRelativeDate(report.createTime) }}</text>
						<text class="report-author">当前用户</text>
					</view>
					<view class="report-summary">
						<text class="summary-text">{{ report.content.substring(0, 50) }}...</text>
					</view>
					<view class="report-tags">
						<text class="tag" v-if="report.plan">有计划</text>
						<text class="tag" v-if="report.problems">有问题</text>
						<text class="tag" v-if="report.leaderComment">有批语</text>
					</view>
					<view class="report-action">
						<text class="action-text">查看详情 ></text>
					</view>
				</view>
					</view>
					
			<view class="empty-state" v-else>
				<text class="empty-text">暂无工作报告</text>
				<text class="empty-tip">点击"新建报告"开始创建</text>
			</view>
					</view>
					
		<!-- 日期选择器弹窗 -->
		<view class="date-picker-modal" v-if="showDatePickerModal">
			<view class="picker-overlay" @click="closeDatePicker"></view>
			<view class="picker-container">
				<view class="picker-header">
					<text class="picker-title">选择日期</text>
					<text class="picker-close" @click="closeDatePicker">×</text>
				</view>
				<view class="picker-content">
					<!-- 年份选择 -->
					<view class="picker-section">
						<text class="picker-label">年份</text>
						<picker 
							:value="yearIndex" 
							:range="years" 
							@change="onYearChange"
							class="picker-selector"
						>
							<view class="picker-display">
								<text class="picker-text">{{ selectedYear }}年</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
					
					<!-- 月份选择 -->
					<view class="picker-section">
						<text class="picker-label">月份</text>
						<picker 
							:value="monthIndex" 
							:range="months" 
							@change="onMonthChange"
							class="picker-selector"
						>
							<view class="picker-display">
								<text class="picker-text">{{ selectedMonth }}月</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
					
					<!-- 日期选择 -->
					<view class="picker-section">
						<text class="picker-label">日期</text>
						<picker 
							:value="dayIndex" 
							:range="days" 
							@change="onDayChange"
							class="picker-selector"
						>
							<view class="picker-display">
								<text class="picker-text">{{ selectedDay }}日</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
				</view>
				<view class="picker-actions">
					<button class="picker-btn cancel-btn" @click="closeDatePicker">取消</button>
					<button class="picker-btn confirm-btn" @click="confirmDatePicker">确定</button>
				</view>
			</view>
					</view>
					
				<!-- 历史报告日期筛选弹窗 -->
		<view class="date-picker-modal" v-if="showHistoryDatePickerModal">
			<view class="picker-overlay" @click="closeHistoryDatePicker"></view>
			<view class="picker-container">
				<view class="picker-header">
					<text class="picker-title">选择筛选日期</text>
					<text class="picker-close" @click="closeHistoryDatePicker">×</text>
				</view>
				<view class="picker-content">
					<!-- 年份选择 -->
					<view class="picker-section">
						<text class="picker-label">年份</text>
						<picker 
							:value="historyYearIndex" 
							:range="historyYears" 
							@change="onHistoryYearChange"
							class="picker-selector"
						>
							<view class="picker-display">
								<text class="picker-text">{{ historySelectedYear }}年</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
					
					<!-- 月份选择 -->
					<view class="picker-section">
						<text class="picker-label">月份</text>
						<picker 
							:value="historyMonthIndex" 
							:range="historyMonths" 
							@change="onHistoryMonthChange"
							class="picker-selector"
						>
							<view class="picker-display">
								<text class="picker-text">{{ historySelectedMonth }}月</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
					
					<!-- 日期选择 -->
					<view class="picker-section">
						<text class="picker-label">日期</text>
						<picker 
							:value="historyDayIndex" 
							:range="historyDays" 
							@change="onHistoryDayChange"
							class="picker-selector"
						>
							<view class="picker-display">
								<text class="picker-text">{{ historySelectedDay }}日</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
					</view>
				</view>
				<view class="picker-actions">
					<button class="picker-btn cancel-btn" @click="closeHistoryDatePicker">取消</button>
					<button class="picker-btn confirm-btn" @click="confirmHistoryDatePicker">确定</button>
				</view>
			</view>
		</view>
		
		<!-- 分类筛选下拉弹窗 -->
		<view class="category-filter-modal" v-if="showCategoryFilterModal">
			<view class="picker-overlay" @click="closeCategoryFilter"></view>
			<view class="category-filter-container">
				<view class="filter-option" @click="selectCategory('全部')">
					<text class="filter-option-text">全部</text>
					<text v-if="selectedCategory === '全部'" class="filter-option-check">✓</text>
				</view>
				<view class="filter-option" @click="selectCategory('已通过')">
					<text class="filter-option-text">已通过</text>
					<text v-if="selectedCategory === '已通过'" class="filter-option-check">✓</text>
				</view>
				<view class="filter-option" @click="selectCategory('待审批')">
					<text class="filter-option-text">待审批</text>
					<text v-if="selectedCategory === '待审批'" class="filter-option-check">✓</text>
				</view>
				<view class="filter-option" @click="selectCategory('驳回')">
					<text class="filter-option-text">驳回</text>
					<text v-if="selectedCategory === '驳回'" class="filter-option-check">✓</text>
				</view>
			</view>
		</view>
		
		<!-- 报告详情弹窗 -->
		<view class="report-detail-modal" v-if="showReportDetailModal">
			<view class="picker-overlay" @click="closeReportDetail"></view>
			<view class="report-detail-container">
				<view class="report-detail-header">
					<text class="report-detail-title">{{ currentReport.title }}</text>
					<text class="report-detail-date">{{ currentReport.date }}</text>
				</view>
				
				<!-- 领导批语（仅当状态为已通过时显示） -->
				<view class="report-detail-section" v-if="currentReport.status === 'approved' && currentReport.leaderComment">
					<text class="section-label">领导批语</text>
					<view class="leader-comment-box">
						<text class="leader-comment-text">{{ currentReport.leaderComment }}</text>
					</view>
				</view>
				
				<!-- 工作内容 -->
				<view class="report-detail-section">
					<text class="section-label">工作内容</text>
					<text class="section-content">{{ currentReport.content }}</text>
				</view>
				
				<!-- 工作计划 -->
				<view class="report-detail-section" v-if="currentReport.plan">
					<text class="section-label">工作计划</text>
					<text class="section-content">{{ currentReport.plan }}</text>
				</view>
				
				<!-- 遇到的问题 -->
				<view class="report-detail-section" v-if="currentReport.problems">
					<text class="section-label">遇到的问题</text>
					<text class="section-content">{{ currentReport.problems }}</text>
				</view>
				
				<!-- 报告状态 -->
				<view class="report-detail-section">
					<text class="section-label">报告状态</text>
					<view class="status-badge" :class="getStatusClass(currentReport.status)">
						<text class="status-text">{{ getStatusText(currentReport.status) }}</text>
					</view>
				</view>
				
				<!-- 关闭按钮 -->
				<view class="report-detail-actions">
					<button class="close-btn" @click="closeReportDetail">关闭</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 当前激活的标签页
			activeTab: 'new',
			// 报告列表
			reportList: [],
			// 搜索关键词
			searchKeyword: '',
			// 选中的分类
			selectedCategory: '全部',
			// 选中的日期文本
			selectedDateText: '选择日期',
			// 新建报告日期选择器相关
			showDatePickerModal: false,
			years: [],
			months: [],
			days: [],
			selectedYear: new Date().getFullYear(),
			selectedMonth: new Date().getMonth() + 1,
			selectedDay: new Date().getDate(),
			yearIndex: 0,
			monthIndex: 0,
			dayIndex: 0,
			
			// 历史报告日期筛选相关
			showHistoryDatePickerModal: false,
			historyYears: [],
			historyMonths: [],
			historyDays: [],
			historySelectedYear: new Date().getFullYear(),
			historySelectedMonth: new Date().getMonth() + 1,
			historySelectedDay: new Date().getDate(),
			historyYearIndex: 0,
			historyMonthIndex: 0,
			historyDayIndex: 0,
			
			// 分类筛选相关
			showCategoryFilterModal: false,
			
			// 报告详情相关
			showReportDetailModal: false,
			currentReport: {},

			// 报告表单
			reportForm: {
				id: '',
				title: '',
				date: '',
				content: '',
				plan: '',
				problems: ''
			},

			

		};
	},
	
	computed: {
		// 筛选后的报告列表
		filteredReportList() {
			let filtered = this.reportList;
			
			// 搜索筛选
			if (this.searchKeyword.trim()) {
				const keyword = this.searchKeyword.toLowerCase();
				filtered = filtered.filter(report => 
					report.title.toLowerCase().includes(keyword) ||
					report.content.toLowerCase().includes(keyword)
				);
			}
			
			// 分类筛选
			if (this.selectedCategory !== '全部') {
				const statusMap = {
					'已通过': 'approved',
					'待审批': 'pending',
					'驳回': 'rejected'
				};
				const targetStatus = statusMap[this.selectedCategory];
				if (targetStatus) {
					filtered = filtered.filter(report => report.status === targetStatus);
				}
			}
			
			return filtered;
		},
		
		// 已批阅数量
		approvedCount() {
			return this.reportList.filter(report => report.status === 'approved').length;
		},
		
		// 待批阅数量
		pendingCount() {
			return this.reportList.filter(report => report.status === 'pending').length;
		},
		
		// 日期输入框的 placeholder
		datePlaceholder() {
			// 当日期为空或者长度小于10时才显示placeholder
			return (!this.reportForm.date || this.reportForm.date.length < 10) ? '请选择日期' : '';
		},
		
		// 标题输入框的 placeholder
		titlePlaceholder() {
			// 当标题为空或者长度很小时才显示placeholder
			return (!this.reportForm.title || this.reportForm.title.trim().length < 2) ? '请输入报告标题' : '';
		},
		
		// 内容输入框的 placeholder
		contentPlaceholder() {
			// 当内容为空或者长度很小时才显示placeholder
			return (!this.reportForm.content || this.reportForm.content.trim().length < 5) ? '请输入工作内容' : '';
		},
		
		// 计划输入框的 placeholder
		planPlaceholder() {
			// 当计划为空或者长度很小时才显示placeholder
			return (!this.reportForm.plan || this.reportForm.plan.trim().length < 5) ? '请输入下周工作计划' : '';
		},
		
		// 问题输入框的 placeholder
		problemsPlaceholder() {
			// 当问题为空或者长度很小时才显示placeholder
			return (!this.reportForm.problems || this.reportForm.problems.trim().length < 5) ? '请输入遇到的问题(选填)' : '';
		},
		
		// 搜索框的 placeholder
		searchPlaceholder() {
			// 当搜索关键词为空或者长度很小时才显示placeholder
			return (!this.searchKeyword || this.searchKeyword.trim().length < 2) ? '搜索报告标题或内容...' : '';
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
		
		// 检查登录状态
		const loginStatus = this.checkLoginStatus();
		console.log('页面加载时的登录状态:', loginStatus);
		
		// 初始化日期选择器
		this.initDatePicker();
		
		// 加载报告列表
		this.loadReportList();
		
		// 处理WebSocket连接错误（开发环境）
		if (process.env.NODE_ENV === 'development') {
			console.log('开发环境：忽略WebSocket连接错误');
		}
	},
	
	methods: {
		// 切换标签页
		switchTab(tab) {
			this.activeTab = tab;
		},
		

		

		
		// 重置筛选
		resetFilters() {
			this.searchKeyword = '';
			this.selectedCategory = '全部';
			this.selectedDateText = '选择日期';
			
			// 重置历史报告日期选择器到当前日期
			const now = new Date();
			this.historySelectedYear = now.getFullYear();
			this.historySelectedMonth = now.getMonth() + 1;
			this.historySelectedDay = now.getDate();
			this.historyYearIndex = 0;
			this.historyMonthIndex = now.getMonth();
			this.historyDayIndex = now.getDate() - 1;
			
			// 关闭所有弹窗
			this.showCategoryFilterModal = false;
			this.showHistoryDatePickerModal = false;
			this.showReportDetailModal = false;
		},
		
		// 获取状态文本
		getStatusText(status) {
			const statusMap = {
				'approved': '已通过',
				'pending': '待审批',
				'rejected': '驳回',
				'draft': '草稿'
			};
			return statusMap[status] || '未知状态';
		},
		
		// 获取状态样式类
		getStatusClass(status) {
			const classMap = {
				'approved': 'status-approved',
				'pending': 'status-pending',
				'rejected': 'status-rejected',
				'draft': 'status-draft'
			};
			return classMap[status] || 'status-default';
		},
		
		// 初始化日期选择器
		initDatePicker() {
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth() + 1;
			const currentDay = now.getDate();
			
			// 生成年份数组（当前年份往前推10年，不能选择未来日期）
			this.years = [];
			for (let i = 0; i < 10; i++) {
				this.years.push(currentYear - i);
			}
			
			// 生成月份数组
			this.months = [];
			for (let i = 1; i <= 12; i++) {
				this.months.push(i);
			}
			
			// 生成日期数组（根据年月动态计算天数）
			this.updateDays(currentYear, currentMonth);
			
			// 设置默认选中值（当前日期）
			this.selectedYear = currentYear;
			this.selectedMonth = currentMonth;
			this.selectedDay = currentDay;
			
			// 设置索引
			this.yearIndex = 0;
			this.monthIndex = currentMonth - 1;
			this.dayIndex = currentDay - 1;
			
			// 设置表单默认日期（确保格式正确）
			const formattedDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
			
			// 使用 nextTick 确保 DOM 更新
			this.$nextTick(() => {
				this.reportForm.date = formattedDate;
			});
			
			// 初始化历史报告日期筛选器
			this.initHistoryDatePicker();
		},
		
		// 显示日期选择器
		showDatePicker() {
			// 确保弹窗打开时显示当前表单中的日期
			if (this.reportForm.date) {
				const dateParts = this.reportForm.date.split('-');
				if (dateParts.length === 3) {
					const year = parseInt(dateParts[0]);
					const month = parseInt(dateParts[1]);
					const day = parseInt(dateParts[2]);
					
					// 更新选中的年月日
					this.selectedYear = year;
					this.selectedMonth = month;
					this.selectedDay = day;
					
					// 更新索引
					this.yearIndex = this.years.indexOf(year);
					this.monthIndex = month - 1;
					this.dayIndex = day - 1;
					
					// 确保索引在有效范围内
					if (this.yearIndex < 0) this.yearIndex = 0;
					if (this.monthIndex < 0) this.monthIndex = 0;
					if (this.dayIndex < 0) this.dayIndex = 0;
					
					// 重新计算天数
					this.updateDays(year, month);
				}
			}
			
			this.showDatePickerModal = true;
		},
		
		// 关闭日期选择器
		closeDatePicker() {
			this.showDatePickerModal = false;
		},
		
		// 显示历史报告日期筛选器
		showHistoryDatePicker() {
			// 确保弹窗打开时显示当前选中的筛选日期
			if (this.selectedDateText && this.selectedDateText !== '选择日期') {
				const dateParts = this.selectedDateText.split('-');
				if (dateParts.length === 3) {
					const year = parseInt(dateParts[0]);
					const month = parseInt(dateParts[1]);
					const day = parseInt(dateParts[2]);
					
					// 更新选中的年月日
					this.historySelectedYear = year;
					this.historySelectedMonth = month;
					this.historySelectedDay = day;
					
					// 更新索引
					this.historyYearIndex = this.historyYears.indexOf(year);
					this.historyMonthIndex = month - 1;
					this.historyDayIndex = day - 1;
					
					// 确保索引在有效范围内
					if (this.historyYearIndex < 0) this.historyYearIndex = 0;
					if (this.historyMonthIndex < 0) this.historyMonthIndex = 0;
					if (this.historyDayIndex < 0) this.historyDayIndex = 0;
					
					// 重新计算天数
					this.updateHistoryDays(year, month);
				}
			}
			
			this.showHistoryDatePickerModal = true;
		},
		
		// 关闭历史报告日期筛选器
		closeHistoryDatePicker() {
			this.showHistoryDatePickerModal = false;
		},
		
		// 显示分类筛选器
		showCategoryFilter() {
			this.showCategoryFilterModal = true;
		},
		
		// 关闭分类筛选器
		closeCategoryFilter() {
			this.showCategoryFilterModal = false;
		},
		
		// 选择分类
		selectCategory(category) {
			this.selectedCategory = category;
			this.closeCategoryFilter();
		},
		
		// 显示报告详情
		viewReportDetail(report) {
			this.currentReport = report;
			this.showReportDetailModal = true;
		},
		
		// 关闭报告详情
		closeReportDetail() {
			this.showReportDetailModal = false;
			this.currentReport = {};
		},
		
		// 更新天数数组（根据年月动态计算）
		updateDays(year, month) {
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth() + 1;
			const currentDay = now.getDate();
			
			// 计算指定年月的天数
			const daysInMonth = new Date(year, month, 0).getDate();
			
			// 如果是当前年月，天数不能超过今天
			let maxDay = daysInMonth;
			if (year === currentYear && month === currentMonth) {
				maxDay = currentDay;
			}
			
			// 生成天数数组
			this.days = [];
			for (let i = 1; i <= maxDay; i++) {
				this.days.push(i);
			}
			
			// 如果当前选中的日期超出范围，调整为最大值
			if (this.selectedDay > maxDay) {
				this.selectedDay = maxDay;
				this.dayIndex = maxDay - 1;
			}
		},
		
		// 初始化历史报告日期筛选器
		initHistoryDatePicker() {
			const now = new Date();
			const currentYear = now.getFullYear();
			const currentMonth = now.getMonth() + 1;
			const currentDay = now.getDate();
			
			// 生成年份数组（当前年份往前推10年）
			this.historyYears = [];
			for (let i = 0; i < 10; i++) {
				this.historyYears.push(currentYear - i);
			}
			
			// 生成月份数组
			this.historyMonths = [];
			for (let i = 1; i <= 12; i++) {
				this.historyMonths.push(i);
			}
			
			// 生成日期数组（根据年月动态计算天数）
			this.updateHistoryDays(currentYear, currentMonth);
			
			// 设置默认选中值（当前日期）
			this.historySelectedYear = currentYear;
			this.historySelectedMonth = currentMonth;
			this.historySelectedDay = currentDay;
			
			// 设置索引
			this.historyYearIndex = 0;
			this.historyMonthIndex = currentMonth - 1;
			this.historyDayIndex = currentDay - 1;
		},
		
		// 更新历史报告日期筛选器的天数数组
		updateHistoryDays(year, month) {
			// 计算指定年月的天数
			const daysInMonth = new Date(year, month, 0).getDate();
			
			// 生成天数数组
			this.historyDays = [];
			for (let i = 1; i <= daysInMonth; i++) {
				this.historyDays.push(i);
			}
			
			// 如果当前选中的日期超出范围，调整为最大值
			if (this.historySelectedDay > daysInMonth) {
				this.historySelectedDay = daysInMonth;
				this.historyDayIndex = daysInMonth - 1;
			}
		},
		
		// 年份变化
		onYearChange(e) {
			this.yearIndex = e.detail.value;
			this.selectedYear = this.years[this.yearIndex];
			// 年份变化后，重新计算天数
			this.updateDays(this.selectedYear, this.selectedMonth);
		},
		
		// 月份变化
		onMonthChange(e) {
			this.monthIndex = e.detail.value;
			this.selectedMonth = this.months[this.monthIndex];
			// 月份变化后，重新计算天数
			this.updateDays(this.selectedYear, this.selectedMonth);
		},
		
		// 历史报告年份变化
		onHistoryYearChange(e) {
			this.historyYearIndex = e.detail.value;
			this.historySelectedYear = this.historyYears[this.historyYearIndex];
			// 年份变化后，重新计算天数
			this.updateHistoryDays(this.historySelectedYear, this.historySelectedMonth);
		},
		
		// 历史报告月份变化
		onHistoryMonthChange(e) {
			this.historyMonthIndex = e.detail.value;
			this.historySelectedMonth = this.historyMonths[this.historyMonthIndex];
			// 月份变化后，重新计算天数
			this.updateHistoryDays(this.historySelectedYear, this.historySelectedMonth);
		},
		
		// 历史报告日期变化
		onHistoryDayChange(e) {
			this.historyDayIndex = e.detail.value;
			this.historySelectedDay = this.historyDays[this.historyDayIndex];
		},
		
		// 日期变化
		onDayChange(e) {
			this.dayIndex = e.detail.value;
			this.selectedDay = this.days[this.dayIndex];
		},
		
		// 确认日期选择
		confirmDatePicker() {
			// 验证选择的日期不能超过未来日期
			const selectedDate = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
			const today = new Date();
			today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
			
			if (selectedDate > today) {
				uni.showToast({
					title: '不能选择未来日期',
					icon: 'none'
				});
				return;
			}
			
			// 更新表单日期
			const newDate = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(this.selectedDay).padStart(2, '0')}`;
			
			// 使用 nextTick 确保 DOM 更新
			this.$nextTick(() => {
				this.reportForm.date = newDate;
			});
			
			this.closeDatePicker();
		},
		
		// 确认历史报告日期筛选
		confirmHistoryDatePicker() {
			// 更新筛选日期文本
			this.selectedDateText = `${this.historySelectedYear}-${String(this.historySelectedMonth).padStart(2, '0')}-${String(this.historySelectedDay).padStart(2, '0')}`;
			this.closeHistoryDatePicker();
		},
		
		// 搜索输入
		onSearchInput() {
			// 搜索逻辑已在计算属性中处理
		},
		

		
		// 提交报告
		async submitReport() {
			if (!this.reportForm.title.trim() || !this.reportForm.content.trim()) {
				uni.showToast({
					title: '请填写必填项',
					icon: 'none'
				});
				return;
			}
			
					// 创建新报告
			try {
				// 显示加载提示
				uni.showLoading({
					title: '提交中...'
				});
				
				// 获取用户token和uid
				const token = uni.getStorageSync('token');
				const uid = uni.getStorageSync('uid');
				console.log('获取到的token:', token, 'uid:', uid);
				
				if (!token || !uid) {
					uni.hideLoading();
					console.log('token或uid为空，提示用户登录');
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					return;
				}
				
				// 调用云函数提交报告
				const result = await uniCloud.callFunction({
					name: 'work-report-manager-func',
					data: {
						method: 'addWorkReport',
						token: token,
						title: this.reportForm.title,
						content: this.reportForm.content,
						plan: this.reportForm.plan,
						problems: this.reportForm.problems,
						date: this.reportForm.date
					}
				});
				
				uni.hideLoading();
				
				// 云函数返回的结果在 result.result 中
				const response = result.result;
				console.log('云函数返回结果:', response);
				
				if (response && response.code === 0) {
					// 提交成功
					uni.showToast({
						title: '报告提交成功',
						icon: 'success'
					});
					
					// 重置表单
					this.resetForm();
					
					// 切换到历史报告标签页
					this.activeTab = 'history';
					
					// 重新加载报告列表
					this.loadReportList();
				} else {
					uni.showToast({
						title: (response && response.message) || '提交失败',
						icon: 'none'
					});
				}
			} catch (error) {
				uni.hideLoading();
				console.error('提交报告失败:', error);
				uni.showToast({
					title: '提交失败，请重试',
					icon: 'none'
				});
			}
		},
		
		// 加载报告列表
		async loadReportList() {
			try {
				// 显示加载提示
				uni.showLoading({
					title: '加载中...'
				});
				
				// 获取用户token和uid
				const token = uni.getStorageSync('token');
				const uid = uni.getStorageSync('uid');
				console.log('加载报告列表 - 获取到的token:', token, 'uid:', uid);
				
				if (!token || !uid) {
					uni.hideLoading();
					console.log('加载报告列表 - token或uid为空，清空列表');
					// 如果没有token或uid，清空列表
					this.reportList = [];
					return;
				}
				
				// 调用云函数获取报告列表
				const result = await uniCloud.callFunction({
					name: 'work-report-manager-func',
					data: {
						method: 'getWorkReports',
						token: token,
						page: 1,
						pageSize: 50
					}
				});
				
				uni.hideLoading();
				
				if (result.code === 0) {
					// 加载成功
					this.reportList = result.data.list || [];
					console.log('从云数据库加载报告:', this.reportList.length);
				} else {
					// 加载失败
					console.warn('加载报告列表失败:', result.message);
					this.reportList = [];
					uni.showToast({
						title: result.message || '加载失败',
						icon: 'none'
					});
				}
			} catch (error) {
				uni.hideLoading();
				console.error('加载报告列表失败:', error);
				this.reportList = [];
				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none'
				});
			}
		},
		

		
		// 检查用户登录状态
		checkLoginStatus() {
			const token = uni.getStorageSync('token');
			const userInfo = uni.getStorageSync('userInfo');
			const uid = uni.getStorageSync('uid');
			console.log('检查登录状态:', { token: !!token, userInfo: !!userInfo, uid: !!uid });
			
			// 检查token是否过期
			if (token && this.isTokenExpired(token)) {
				console.log('token已过期，清除登录信息');
				this.clearLoginInfo();
				return { isLoggedIn: false, token: null, userInfo: null, uid: null };
			}
			
			return { isLoggedIn: !!token, token, userInfo, uid };
		},
		
		// 检查token是否过期
		isTokenExpired(token) {
			try {
				// 这里可以添加token过期检查逻辑
				// 暂时简单检查token是否存在
				return !token || token.length < 10;
			} catch (error) {
				console.error('检查token过期失败:', error);
				return true;
			}
		},
		
		// 清除登录信息
		clearLoginInfo() {
			uni.removeStorageSync('token');
			uni.removeStorageSync('userInfo');
			uni.removeStorageSync('uid');
			uni.removeStorageSync('loginType');
			console.log('登录信息已清除');
		},
		
		// 重置表单
		resetForm() {
			this.reportForm = {
				id: '',
				title: '',
				date: '',
				content: '',
				plan: '',
				problems: ''
			};
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
		
		// 格式化相对日期
		formatRelativeDate(dateString) {
			if (!dateString) return '';
			const date = new Date(dateString);
			const now = new Date();
			const diffTime = Math.abs(now - date);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			
			if (diffDays === 1) return `${this.formatDate(dateString).split(' ')[0]} 今天`;
			if (diffDays === 2) return `${this.formatDate(dateString).split(' ')[0]} 昨天`;
			if (diffDays <= 7) return `${this.formatDate(dateString).split(' ')[0]} ${diffDays}天前`;
			
			return this.formatDate(dateString);
		},
		

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
	margin-bottom: 20rpx;
	padding: 20rpx 0;
}

.page-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
}

.header-actions {
	display: flex;
	gap: 20rpx;
}

.action-icon {
	font-size: 32rpx;
	color: #666;
	width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* 标签页样式 */
.tab-container {
	display: flex;
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
	flex: 1;
	padding: 24rpx 0;
	text-align: center;
	position: relative;
	transition: all 0.3s ease;
	
	&.active {
		.tab-text {
			color: #333;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 60rpx;
			height: 4rpx;
			background-color: #333;
			border-radius: 2rpx;
		}
	}
}

.tab-text {
	font-size: 28rpx;
	color: #999;
	font-weight: 500;
	transition: color 0.3s ease;
}

/* 表单容器样式 */
.form-container {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 历史报告容器样式 */
.history-container {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 搜索和筛选样式 */
.filter-section {
	margin-bottom: 20rpx;
}

.search-container {
	position: relative;
	margin-bottom: 20rpx;
}

.search-input {
	width: 100%;
	height: 80rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 40rpx;
	padding: 0 80rpx 0 30rpx;
	font-size: 28rpx;
	background-color: #f8f8f8;
	box-sizing: border-box;
	/* 多端适配 */
	display: block;
	word-break: break-all;
	word-wrap: break-word;
}

/* 小程序端搜索框特殊处理 */
/* #ifdef MP-WEIXIN */
.search-input {
	width: calc(100% - 110rpx);
}
/* #endif */

.search-icon {
	position: absolute;
	right: 30rpx;
	top: 50%;
	transform: translateY(-50%);
	font-size: 32rpx;
	color: #999;
}

.filter-row {
	display: flex;
	gap: 15rpx;
	align-items: center;
}

.filter-item {
	flex: 1;
	height: 70rpx;
	border: 2rpx solid #e0e0e0;
	border-radius: 35rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20rpx;
	background-color: #fff;
}

.filter-reset {
	height: 70rpx;
	background-color: #f0f0f0;
	border-radius: 35rpx;
	padding: 0 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.filter-text {
	font-size: 26rpx;
	color: #333;
}

.filter-arrow, .filter-icon {
	font-size: 24rpx;
	color: #999;
}

.reset-text {
	font-size: 24rpx;
	color: #666;
}

/* 统计卡片样式 */
.stats-card {
	display: flex;
	background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
	border-radius: 16rpx;
	padding: 30rpx;
	margin-bottom: 20rpx;
	color: #fff;
}

.stats-item {
	flex: 1;
	text-align: center;
}

.stats-number {
	display: block;
	font-size: 48rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
}

.stats-label {
	font-size: 24rpx;
	opacity: 0.8;
}

/* 报告标签样式 */
.report-tags {
	display: flex;
	gap: 10rpx;
	margin: 16rpx 0;
}

.tag {
	background-color: #e3f2fd;
	color: #1976d2;
	padding: 6rpx 12rpx;
	border-radius: 12rpx;
	font-size: 20rpx;
}

.report-action {
	text-align: right;
	margin-top: 16rpx;
}

.action-text {
	color: #4a90e2;
	font-size: 24rpx;
}

/* 日期选择器弹窗样式 */
.date-picker-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	align-items: flex-end;
}

.picker-overlay {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 998;
}

.picker-container {
	position: relative;
	background-color: #fff;
	border-radius: 20rpx 20rpx 0 0;
	padding: 30rpx;
	width: 100%;
	max-height: 80vh;
	overflow-y: auto;
	z-index: 1000;
}

.picker-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}

.picker-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.picker-close {
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

.picker-content {
	margin-bottom: 30rpx;
}

.picker-section {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.picker-section:last-child {
	border-bottom: none;
}

.picker-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.picker-selector {
	flex: 1;
	margin-left: 20rpx;
}

.picker-display {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 20rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;
	border: 2rpx solid #e0e0e0;
}

.picker-text {
	font-size: 28rpx;
	color: #333;
}

.picker-arrow {
	font-size: 24rpx;
	color: #999;
}

.picker-actions {
	display: flex;
	gap: 20rpx;
}

.picker-btn {
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

.confirm-btn {
	background-color: #4a90e2;
	color: #fff;
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



.form-group {
	margin-bottom: 30rpx;
}

.form-label {
	display: block;
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 16rpx;
}

.form-input, .form-textarea {
	width: 100%;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 28rpx;
	color: #333;
	background-color: #fff;
	box-sizing: border-box;
	/* 多端适配 */
	display: block;
	word-break: break-all;
	word-wrap: break-word;
	
	&:focus {
		border-color: #333;
		outline: none;
	}
}

/* 小程序端特殊处理 */
/* #ifdef MP-WEIXIN */
.form-input, .form-textarea {
	width: calc(100% - 40rpx);
	min-height: 80rpx;
}
/* #endif */

/* H5端特殊处理 */
/* #ifdef H5 */
.form-input, .form-textarea {
	width: 100%;
	resize: none;
}
/* #endif */

.form-textarea {
	min-height: 120rpx;
	resize: none;
}

.form-tip {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
	display: block;
}

.date-display {
	cursor: pointer;
	display: flex;
	align-items: center;
	min-height: 80rpx;
}

.date-text {
	color: #333;
	font-size: 28rpx;
}

.date-placeholder {
	color: #999;
	font-size: 28rpx;
}

/* 分类筛选弹窗样式 */
.category-filter-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	padding-top: 200rpx;
}

.category-filter-container {
	background-color: #fff;
	border-radius: 12rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	overflow: hidden;
	min-width: 200rpx;
	position: relative;
	z-index: 1000;
}

.filter-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	border-bottom: 1rpx solid #f0f0f0;
	cursor: pointer;
	transition: background-color 0.2s ease;
}

.filter-option:last-child {
	border-bottom: none;
}

.filter-option:hover {
	background-color: #f8f8f8;
}

.filter-option-text {
	font-size: 28rpx;
	color: #333;
}

.filter-option-check {
	font-size: 24rpx;
	color: #4a90e2;
	font-weight: bold;
}

/* 报告详情弹窗样式 */
.report-detail-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

.report-detail-container {
	background-color: #fff;
	border-radius: 20rpx;
	box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
	overflow: hidden;
	width: 100%;
	max-height: 90vh;
	overflow-y: auto;
	position: relative;
	z-index: 1000;
}

.report-detail-header {
	padding: 40rpx 40rpx 20rpx;
	border-bottom: 1rpx solid #f0f0f0;
	text-align: center;
}

.report-detail-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 16rpx;
}

.report-detail-date {
	font-size: 28rpx;
	color: #666;
	display: block;
}

.report-detail-section {
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.report-detail-section:last-child {
	border-bottom: none;
}

.section-label {
	font-size: 30rpx;
	font-weight: bold;
	color: #333;
	display: block;
	margin-bottom: 20rpx;
}

.section-content {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	display: block;
}

.leader-comment-box {
	border: 2rpx solid #ff6b6b;
	border-radius: 12rpx;
	padding: 20rpx;
	background-color: #fff5f5;
}

.leader-comment-text {
	font-size: 28rpx;
	color: #333;
	line-height: 1.6;
	display: block;
}

.status-badge {
	display: inline-block;
	padding: 12rpx 24rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
	font-weight: 500;
}

.status-approved {
	background-color: #e8f5e8;
	color: #52c41a;
}

.status-pending {
	background-color: #fff7e6;
	color: #fa8c16;
}

.status-rejected {
	background-color: #fff2f0;
	color: #ff4d4f;
}

.status-draft {
	background-color: #f5f5f5;
	color: #666;
}

.status-text {
	font-size: 24rpx;
}

.report-detail-actions {
	padding: 30rpx 40rpx;
	text-align: center;
	border-top: 1rpx solid #f0f0f0;
}

.close-btn {
	background-color: #4a90e2;
	color: #fff;
	border: none;
	border-radius: 8rpx;
	padding: 20rpx 60rpx;
	font-size: 32rpx;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.close-btn:active {
	background-color: #357abd;
}



/* 提交按钮样式 */
.submit-btn {
	width: 100%;
	background-color: #4a90e2;
	color: #fff;
	border: none;
	border-radius: 8rpx;
	padding: 24rpx;
	font-size: 32rpx;
	font-weight: 500;
	margin-top: 40rpx;
	transition: background-color 0.3s ease;
	
	&:active {
		background-color: #357abd;
	}
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


</style>

