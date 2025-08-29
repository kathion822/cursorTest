"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      // 当前激活的标签页
      activeTab: "new",
      // 报告列表
      reportList: [],
      // 搜索关键词
      searchKeyword: "",
      // 选中的分类
      selectedCategory: "全部",
      // 选中的日期文本
      selectedDateText: "选择日期",
      // 新建报告日期选择器相关
      showDatePickerModal: false,
      years: [],
      months: [],
      days: [],
      selectedYear: (/* @__PURE__ */ new Date()).getFullYear(),
      selectedMonth: (/* @__PURE__ */ new Date()).getMonth() + 1,
      selectedDay: (/* @__PURE__ */ new Date()).getDate(),
      yearIndex: 0,
      monthIndex: 0,
      dayIndex: 0,
      // 历史报告日期筛选相关
      showHistoryDatePickerModal: false,
      historyYears: [],
      historyMonths: [],
      historyDays: [],
      historySelectedYear: (/* @__PURE__ */ new Date()).getFullYear(),
      historySelectedMonth: (/* @__PURE__ */ new Date()).getMonth() + 1,
      historySelectedDay: (/* @__PURE__ */ new Date()).getDate(),
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
        id: "",
        title: "",
        date: "",
        content: "",
        plan: "",
        problems: ""
      }
    };
  },
  computed: {
    // 筛选后的报告列表
    filteredReportList() {
      let filtered = this.reportList;
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase();
        filtered = filtered.filter(
          (report) => report.title.toLowerCase().includes(keyword) || report.content.toLowerCase().includes(keyword)
        );
      }
      if (this.selectedCategory !== "全部") {
        const statusMap = {
          "已通过": "approved",
          "待审批": "pending",
          "驳回": "rejected"
        };
        const targetStatus = statusMap[this.selectedCategory];
        if (targetStatus) {
          filtered = filtered.filter((report) => report.status === targetStatus);
        }
      }
      return filtered;
    },
    // 已批阅数量
    approvedCount() {
      return this.reportList.filter((report) => report.status === "approved").length;
    },
    // 待批阅数量
    pendingCount() {
      return this.reportList.filter((report) => report.status === "pending").length;
    },
    // 日期输入框的 placeholder
    datePlaceholder() {
      return !this.reportForm.date || this.reportForm.date.length < 10 ? "请选择日期" : "";
    },
    // 标题输入框的 placeholder
    titlePlaceholder() {
      return !this.reportForm.title || this.reportForm.title.trim().length < 2 ? "请输入报告标题" : "";
    },
    // 内容输入框的 placeholder
    contentPlaceholder() {
      return !this.reportForm.content || this.reportForm.content.trim().length < 5 ? "请输入工作内容" : "";
    },
    // 计划输入框的 placeholder
    planPlaceholder() {
      return !this.reportForm.plan || this.reportForm.plan.trim().length < 5 ? "请输入下周工作计划" : "";
    },
    // 问题输入框的 placeholder
    problemsPlaceholder() {
      return !this.reportForm.problems || this.reportForm.problems.trim().length < 5 ? "请输入遇到的问题(选填)" : "";
    },
    // 搜索框的 placeholder
    searchPlaceholder() {
      return !this.searchKeyword || this.searchKeyword.trim().length < 2 ? "搜索报告标题或内容..." : "";
    }
  },
  mounted() {
    try {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      common_vendor.index.__f__("log", "at pages/like/like.vue:505", "系统信息:", systemInfo);
      common_vendor.index.__f__("log", "at pages/like/like.vue:506", "运行平台:", systemInfo.platform);
      common_vendor.index.__f__("log", "at pages/like/like.vue:507", "运行环境:", systemInfo.uniPlatform);
    } catch (error) {
      common_vendor.index.__f__("warn", "at pages/like/like.vue:509", "获取系统信息失败:", error);
    }
    const loginStatus = this.checkLoginStatus();
    common_vendor.index.__f__("log", "at pages/like/like.vue:514", "页面加载时的登录状态:", loginStatus);
    this.initDatePicker();
    this.loadReportList();
    {
      common_vendor.index.__f__("log", "at pages/like/like.vue:524", "开发环境：忽略WebSocket连接错误");
    }
  },
  methods: {
    // 切换标签页
    switchTab(tab) {
      this.activeTab = tab;
    },
    // 重置筛选
    resetFilters() {
      this.searchKeyword = "";
      this.selectedCategory = "全部";
      this.selectedDateText = "选择日期";
      const now = /* @__PURE__ */ new Date();
      this.historySelectedYear = now.getFullYear();
      this.historySelectedMonth = now.getMonth() + 1;
      this.historySelectedDay = now.getDate();
      this.historyYearIndex = 0;
      this.historyMonthIndex = now.getMonth();
      this.historyDayIndex = now.getDate() - 1;
      this.showCategoryFilterModal = false;
      this.showHistoryDatePickerModal = false;
      this.showReportDetailModal = false;
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        "approved": "已通过",
        "pending": "待审批",
        "rejected": "驳回",
        "draft": "草稿"
      };
      return statusMap[status] || "未知状态";
    },
    // 获取状态样式类
    getStatusClass(status) {
      const classMap = {
        "approved": "status-approved",
        "pending": "status-pending",
        "rejected": "status-rejected",
        "draft": "status-draft"
      };
      return classMap[status] || "status-default";
    },
    // 初始化日期选择器
    initDatePicker() {
      const now = /* @__PURE__ */ new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      this.years = [];
      for (let i = 0; i < 10; i++) {
        this.years.push(currentYear - i);
      }
      this.months = [];
      for (let i = 1; i <= 12; i++) {
        this.months.push(i);
      }
      this.updateDays(currentYear, currentMonth);
      this.selectedYear = currentYear;
      this.selectedMonth = currentMonth;
      this.selectedDay = currentDay;
      this.yearIndex = 0;
      this.monthIndex = currentMonth - 1;
      this.dayIndex = currentDay - 1;
      const formattedDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;
      this.$nextTick(() => {
        this.reportForm.date = formattedDate;
      });
      this.initHistoryDatePicker();
    },
    // 显示日期选择器
    showDatePicker() {
      if (this.reportForm.date) {
        const dateParts = this.reportForm.date.split("-");
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]);
          const day = parseInt(dateParts[2]);
          this.selectedYear = year;
          this.selectedMonth = month;
          this.selectedDay = day;
          this.yearIndex = this.years.indexOf(year);
          this.monthIndex = month - 1;
          this.dayIndex = day - 1;
          if (this.yearIndex < 0)
            this.yearIndex = 0;
          if (this.monthIndex < 0)
            this.monthIndex = 0;
          if (this.dayIndex < 0)
            this.dayIndex = 0;
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
      if (this.selectedDateText && this.selectedDateText !== "选择日期") {
        const dateParts = this.selectedDateText.split("-");
        if (dateParts.length === 3) {
          const year = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]);
          const day = parseInt(dateParts[2]);
          this.historySelectedYear = year;
          this.historySelectedMonth = month;
          this.historySelectedDay = day;
          this.historyYearIndex = this.historyYears.indexOf(year);
          this.historyMonthIndex = month - 1;
          this.historyDayIndex = day - 1;
          if (this.historyYearIndex < 0)
            this.historyYearIndex = 0;
          if (this.historyMonthIndex < 0)
            this.historyMonthIndex = 0;
          if (this.historyDayIndex < 0)
            this.historyDayIndex = 0;
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
      const now = /* @__PURE__ */ new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      const daysInMonth = new Date(year, month, 0).getDate();
      let maxDay = daysInMonth;
      if (year === currentYear && month === currentMonth) {
        maxDay = currentDay;
      }
      this.days = [];
      for (let i = 1; i <= maxDay; i++) {
        this.days.push(i);
      }
      if (this.selectedDay > maxDay) {
        this.selectedDay = maxDay;
        this.dayIndex = maxDay - 1;
      }
    },
    // 初始化历史报告日期筛选器
    initHistoryDatePicker() {
      const now = /* @__PURE__ */ new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      this.historyYears = [];
      for (let i = 0; i < 10; i++) {
        this.historyYears.push(currentYear - i);
      }
      this.historyMonths = [];
      for (let i = 1; i <= 12; i++) {
        this.historyMonths.push(i);
      }
      this.updateHistoryDays(currentYear, currentMonth);
      this.historySelectedYear = currentYear;
      this.historySelectedMonth = currentMonth;
      this.historySelectedDay = currentDay;
      this.historyYearIndex = 0;
      this.historyMonthIndex = currentMonth - 1;
      this.historyDayIndex = currentDay - 1;
    },
    // 更新历史报告日期筛选器的天数数组
    updateHistoryDays(year, month) {
      const daysInMonth = new Date(year, month, 0).getDate();
      this.historyDays = [];
      for (let i = 1; i <= daysInMonth; i++) {
        this.historyDays.push(i);
      }
      if (this.historySelectedDay > daysInMonth) {
        this.historySelectedDay = daysInMonth;
        this.historyDayIndex = daysInMonth - 1;
      }
    },
    // 年份变化
    onYearChange(e) {
      this.yearIndex = e.detail.value;
      this.selectedYear = this.years[this.yearIndex];
      this.updateDays(this.selectedYear, this.selectedMonth);
    },
    // 月份变化
    onMonthChange(e) {
      this.monthIndex = e.detail.value;
      this.selectedMonth = this.months[this.monthIndex];
      this.updateDays(this.selectedYear, this.selectedMonth);
    },
    // 历史报告年份变化
    onHistoryYearChange(e) {
      this.historyYearIndex = e.detail.value;
      this.historySelectedYear = this.historyYears[this.historyYearIndex];
      this.updateHistoryDays(this.historySelectedYear, this.historySelectedMonth);
    },
    // 历史报告月份变化
    onHistoryMonthChange(e) {
      this.historyMonthIndex = e.detail.value;
      this.historySelectedMonth = this.historyMonths[this.historyMonthIndex];
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
      const selectedDate = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
      const today = /* @__PURE__ */ new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        common_vendor.index.showToast({
          title: "不能选择未来日期",
          icon: "none"
        });
        return;
      }
      const newDate = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, "0")}-${String(this.selectedDay).padStart(2, "0")}`;
      this.$nextTick(() => {
        this.reportForm.date = newDate;
      });
      this.closeDatePicker();
    },
    // 确认历史报告日期筛选
    confirmHistoryDatePicker() {
      this.selectedDateText = `${this.historySelectedYear}-${String(this.historySelectedMonth).padStart(2, "0")}-${String(this.historySelectedDay).padStart(2, "0")}`;
      this.closeHistoryDatePicker();
    },
    // 搜索输入
    onSearchInput() {
    },
    // 提交报告
    async submitReport() {
      if (!this.reportForm.title.trim() || !this.reportForm.content.trim()) {
        common_vendor.index.showToast({
          title: "请填写必填项",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({
          title: "提交中..."
        });
        const token = common_vendor.index.getStorageSync("token");
        const uid = common_vendor.index.getStorageSync("uid");
        common_vendor.index.__f__("log", "at pages/like/like.vue:913", "获取到的token:", token, "uid:", uid);
        if (!token || !uid) {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("log", "at pages/like/like.vue:917", "token或uid为空，提示用户登录");
          common_vendor.index.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }
        common_vendor.index.__f__("log", "at pages/like/like.vue:926", "准备调用云函数，参数:", {
          method: "addWorkReport",
          token,
          title: this.reportForm.title,
          content: this.reportForm.content,
          plan: this.reportForm.plan,
          problems: this.reportForm.problems,
          date: this.reportForm.date
        });
        const result = await common_vendor.tr.callFunction({
          name: "work-report-manager-func",
          data: {
            method: "addWorkReport",
            token,
            title: this.reportForm.title,
            content: this.reportForm.content,
            plan: this.reportForm.plan,
            problems: this.reportForm.problems,
            date: this.reportForm.date
          }
        });
        common_vendor.index.__f__("log", "at pages/like/like.vue:949", "云函数调用完成，原始结果:", result);
        common_vendor.index.hideLoading();
        const response = result.result;
        common_vendor.index.__f__("log", "at pages/like/like.vue:955", "云函数返回结果:", response);
        if (response && response.code === 0) {
          common_vendor.index.showToast({
            title: "报告提交成功",
            icon: "success"
          });
          this.resetForm();
          this.activeTab = "history";
          this.loadReportList();
        } else {
          common_vendor.index.showToast({
            title: response && response.message || "提交失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/like/like.vue:980", "提交报告失败:", error);
        common_vendor.index.showToast({
          title: "提交失败，请重试",
          icon: "none"
        });
      }
    },
    // 加载报告列表
    async loadReportList() {
      try {
        common_vendor.index.showLoading({
          title: "加载中..."
        });
        const token = common_vendor.index.getStorageSync("token");
        const uid = common_vendor.index.getStorageSync("uid");
        common_vendor.index.__f__("log", "at pages/like/like.vue:999", "加载报告列表 - 获取到的token:", token, "uid:", uid);
        if (!token || !uid) {
          common_vendor.index.hideLoading();
          common_vendor.index.__f__("log", "at pages/like/like.vue:1003", "加载报告列表 - token或uid为空，清空列表");
          this.reportList = [];
          return;
        }
        const result = await common_vendor.tr.callFunction({
          name: "work-report-manager-func",
          data: {
            method: "getWorkReports",
            token,
            page: 1,
            pageSize: 50
          }
        });
        common_vendor.index.hideLoading();
        const response = result.result;
        common_vendor.index.__f__("log", "at pages/like/like.vue:1024", "云函数返回结果:", response);
        if (response && response.code === 0) {
          this.reportList = response.data.list || [];
          common_vendor.index.__f__("log", "at pages/like/like.vue:1029", "从云数据库加载报告:", this.reportList.length);
        } else {
          common_vendor.index.__f__("warn", "at pages/like/like.vue:1032", "加载报告列表失败:", response ? response.message : "未知错误");
          this.reportList = [];
          common_vendor.index.showToast({
            title: response && response.message || "加载失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/like/like.vue:1041", "加载报告列表失败:", error);
        this.reportList = [];
        common_vendor.index.showToast({
          title: "加载失败，请重试",
          icon: "none"
        });
      }
    },
    // 检查用户登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("token");
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      const uid = common_vendor.index.getStorageSync("uid");
      common_vendor.index.__f__("log", "at pages/like/like.vue:1057", "检查登录状态:", { token: !!token, userInfo: !!userInfo, uid: !!uid });
      if (token && this.isTokenExpired(token)) {
        common_vendor.index.__f__("log", "at pages/like/like.vue:1061", "token已过期，清除登录信息");
        this.clearLoginInfo();
        return { isLoggedIn: false, token: null, userInfo: null, uid: null };
      }
      return { isLoggedIn: !!token, token, userInfo, uid };
    },
    // 检查token是否过期
    isTokenExpired(token) {
      try {
        return !token || token.length < 10;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/like/like.vue:1076", "检查token过期失败:", error);
        return true;
      }
    },
    // 清除登录信息
    clearLoginInfo() {
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("uid");
      common_vendor.index.removeStorageSync("loginType");
      common_vendor.index.__f__("log", "at pages/like/like.vue:1087", "登录信息已清除");
    },
    // 重置表单
    resetForm() {
      this.reportForm = {
        id: "",
        title: "",
        date: "",
        content: "",
        plan: "",
        problems: ""
      };
    },
    // 获取状态样式类
    getStatusClass(status) {
      const statusMap = {
        draft: "status-draft",
        pending: "status-pending",
        approved: "status-approved",
        rejected: "status-rejected"
      };
      return statusMap[status] || "status-draft";
    },
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        draft: "草稿",
        pending: "待审批",
        approved: "已通过",
        rejected: "已拒绝"
      };
      return statusMap[status] || "草稿";
    },
    // 格式化日期
    formatDate(dateString) {
      if (!dateString)
        return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    },
    // 格式化相对日期
    formatRelativeDate(dateString) {
      if (!dateString)
        return "";
      const date = new Date(dateString);
      const now = /* @__PURE__ */ new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
      if (diffDays === 1)
        return `${this.formatDate(dateString).split(" ")[0]} 今天`;
      if (diffDays === 2)
        return `${this.formatDate(dateString).split(" ")[0]} 昨天`;
      if (diffDays <= 7)
        return `${this.formatDate(dateString).split(" ")[0]} ${diffDays}天前`;
      return this.formatDate(dateString);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.activeTab === "new" ? 1 : "",
    b: common_vendor.o(($event) => $options.switchTab("new")),
    c: $data.activeTab === "history" ? 1 : "",
    d: common_vendor.o(($event) => $options.switchTab("history")),
    e: $data.activeTab === "new"
  }, $data.activeTab === "new" ? common_vendor.e({
    f: $data.reportForm.title,
    g: common_vendor.o(($event) => $data.reportForm.title = $event.detail.value),
    h: $data.reportForm.date
  }, $data.reportForm.date ? {
    i: common_vendor.t($data.reportForm.date)
  } : {}, {
    j: common_vendor.o((...args) => $options.showDatePicker && $options.showDatePicker(...args)),
    k: $data.reportForm.content,
    l: common_vendor.o(($event) => $data.reportForm.content = $event.detail.value),
    m: $data.reportForm.plan,
    n: common_vendor.o(($event) => $data.reportForm.plan = $event.detail.value),
    o: $data.reportForm.problems,
    p: common_vendor.o(($event) => $data.reportForm.problems = $event.detail.value),
    q: common_vendor.o((...args) => $options.submitReport && $options.submitReport(...args))
  }) : {}, {
    r: $data.activeTab === "history"
  }, $data.activeTab === "history" ? common_vendor.e({
    s: !$data.searchKeyword || $data.searchKeyword.trim().length < 2 ? "搜索报告标题或内容..." : "",
    t: common_vendor.o([($event) => $data.searchKeyword = $event.detail.value, (...args) => $options.onSearchInput && $options.onSearchInput(...args)]),
    v: $data.searchKeyword,
    w: common_vendor.t($data.selectedCategory),
    x: common_vendor.o((...args) => $options.showCategoryFilter && $options.showCategoryFilter(...args)),
    y: common_vendor.t($data.selectedDateText),
    z: common_vendor.o((...args) => $options.showHistoryDatePicker && $options.showHistoryDatePicker(...args)),
    A: $data.searchKeyword
  }, $data.searchKeyword ? {
    B: common_vendor.o((...args) => $options.resetFilters && $options.resetFilters(...args))
  } : {}, {
    C: common_vendor.t($data.reportList.length),
    D: common_vendor.t($options.approvedCount),
    E: common_vendor.t($options.pendingCount),
    F: $options.filteredReportList.length > 0
  }, $options.filteredReportList.length > 0 ? {
    G: common_vendor.f($options.filteredReportList, (report, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(report.title),
        b: common_vendor.t($options.getStatusText(report.status)),
        c: common_vendor.n($options.getStatusClass(report.status)),
        d: common_vendor.t($options.formatRelativeDate(report.createTime)),
        e: common_vendor.t(report.content.substring(0, 50)),
        f: report.plan
      }, report.plan ? {} : {}, {
        g: report.problems
      }, report.problems ? {} : {}, {
        h: report.leaderComment
      }, report.leaderComment ? {} : {}, {
        i: report.id,
        j: common_vendor.o(($event) => $options.viewReportDetail(report), report.id)
      });
    })
  } : {}) : {}, {
    H: $data.showDatePickerModal
  }, $data.showDatePickerModal ? {
    I: common_vendor.o((...args) => $options.closeDatePicker && $options.closeDatePicker(...args)),
    J: common_vendor.o((...args) => $options.closeDatePicker && $options.closeDatePicker(...args)),
    K: common_vendor.t($data.selectedYear),
    L: $data.yearIndex,
    M: $data.years,
    N: common_vendor.o((...args) => $options.onYearChange && $options.onYearChange(...args)),
    O: common_vendor.t($data.selectedMonth),
    P: $data.monthIndex,
    Q: $data.months,
    R: common_vendor.o((...args) => $options.onMonthChange && $options.onMonthChange(...args)),
    S: common_vendor.t($data.selectedDay),
    T: $data.dayIndex,
    U: $data.days,
    V: common_vendor.o((...args) => $options.onDayChange && $options.onDayChange(...args)),
    W: common_vendor.o((...args) => $options.closeDatePicker && $options.closeDatePicker(...args)),
    X: common_vendor.o((...args) => $options.confirmDatePicker && $options.confirmDatePicker(...args))
  } : {}, {
    Y: $data.showHistoryDatePickerModal
  }, $data.showHistoryDatePickerModal ? {
    Z: common_vendor.o((...args) => $options.closeHistoryDatePicker && $options.closeHistoryDatePicker(...args)),
    aa: common_vendor.o((...args) => $options.closeHistoryDatePicker && $options.closeHistoryDatePicker(...args)),
    ab: common_vendor.t($data.historySelectedYear),
    ac: $data.historyYearIndex,
    ad: $data.historyYears,
    ae: common_vendor.o((...args) => $options.onHistoryYearChange && $options.onHistoryYearChange(...args)),
    af: common_vendor.t($data.historySelectedMonth),
    ag: $data.historyMonthIndex,
    ah: $data.historyMonths,
    ai: common_vendor.o((...args) => $options.onHistoryMonthChange && $options.onHistoryMonthChange(...args)),
    aj: common_vendor.t($data.historySelectedDay),
    ak: $data.historyDayIndex,
    al: $data.historyDays,
    am: common_vendor.o((...args) => $options.onHistoryDayChange && $options.onHistoryDayChange(...args)),
    an: common_vendor.o((...args) => $options.closeHistoryDatePicker && $options.closeHistoryDatePicker(...args)),
    ao: common_vendor.o((...args) => $options.confirmHistoryDatePicker && $options.confirmHistoryDatePicker(...args))
  } : {}, {
    ap: $data.showCategoryFilterModal
  }, $data.showCategoryFilterModal ? common_vendor.e({
    aq: common_vendor.o((...args) => $options.closeCategoryFilter && $options.closeCategoryFilter(...args)),
    ar: $data.selectedCategory === "全部"
  }, $data.selectedCategory === "全部" ? {} : {}, {
    as: common_vendor.o(($event) => $options.selectCategory("全部")),
    at: $data.selectedCategory === "已通过"
  }, $data.selectedCategory === "已通过" ? {} : {}, {
    av: common_vendor.o(($event) => $options.selectCategory("已通过")),
    aw: $data.selectedCategory === "待审批"
  }, $data.selectedCategory === "待审批" ? {} : {}, {
    ax: common_vendor.o(($event) => $options.selectCategory("待审批")),
    ay: $data.selectedCategory === "驳回"
  }, $data.selectedCategory === "驳回" ? {} : {}, {
    az: common_vendor.o(($event) => $options.selectCategory("驳回"))
  }) : {}, {
    aA: $data.showReportDetailModal
  }, $data.showReportDetailModal ? common_vendor.e({
    aB: common_vendor.o((...args) => $options.closeReportDetail && $options.closeReportDetail(...args)),
    aC: common_vendor.t($data.currentReport.title),
    aD: common_vendor.t($data.currentReport.date),
    aE: $data.currentReport.status === "approved" && $data.currentReport.leaderComment
  }, $data.currentReport.status === "approved" && $data.currentReport.leaderComment ? {
    aF: common_vendor.t($data.currentReport.leaderComment)
  } : {}, {
    aG: common_vendor.t($data.currentReport.content),
    aH: $data.currentReport.plan
  }, $data.currentReport.plan ? {
    aI: common_vendor.t($data.currentReport.plan)
  } : {}, {
    aJ: $data.currentReport.problems
  }, $data.currentReport.problems ? {
    aK: common_vendor.t($data.currentReport.problems)
  } : {}, {
    aL: common_vendor.t($options.getStatusText($data.currentReport.status)),
    aM: common_vendor.n($options.getStatusClass($data.currentReport.status)),
    aN: common_vendor.o((...args) => $options.closeReportDetail && $options.closeReportDetail(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/like/like.js.map
