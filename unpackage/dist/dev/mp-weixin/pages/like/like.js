"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
        id: "",
        title: "",
        content: "",
        summary: "",
        nextPlan: ""
      },
      // 模拟数据
      mockReports: [
        {
          id: "1",
          title: "本周项目开发进度报告",
          content: "本周主要完成了用户管理模块的开发，包括用户注册、登录、权限管理等功能。在开发过程中遇到了一些技术难点，通过查阅资料和团队讨论得到了解决。整体进度符合预期，预计下周可以完成测试阶段。",
          summary: "用户管理模块开发完成，技术难点已解决，进度符合预期。",
          nextPlan: "下周进行功能测试，修复发现的bug，准备部署上线。",
          author: "张三",
          status: "approved",
          createTime: "2024-01-15 14:30:00",
          leaderComment: "工作进展良好，技术难点解决得当。建议在测试阶段重点关注用户体验，确保功能稳定性。",
          commentTime: "2024-01-16 09:15:00"
        },
        {
          id: "2",
          title: "月度工作总结报告",
          content: "本月完成了三个重要项目的交付，客户满意度较高。团队协作效率提升，新员工培训计划执行顺利。在项目管理方面积累了一些经验，为后续工作提供了参考。",
          summary: "三个项目成功交付，团队效率提升，新员工培训完成。",
          nextPlan: "下月重点推进新项目立项，优化项目管理流程，提升团队技能。",
          author: "李四",
          status: "pending",
          createTime: "2024-01-10 16:45:00",
          leaderComment: "",
          commentTime: ""
        },
        {
          id: "3",
          title: "技术调研报告",
          content: "针对新技术的应用进行了深入调研，分析了技术优势、适用场景和潜在风险。通过对比分析，推荐采用新技术方案，预计可以提升系统性能30%以上。",
          summary: "新技术调研完成，推荐采用，预计性能提升30%以上。",
          nextPlan: "制定技术迁移计划，进行小规模试点，评估实际效果。",
          author: "王五",
          status: "draft",
          createTime: "2024-01-12 11:20:00",
          leaderComment: "",
          commentTime: ""
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
    try {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      common_vendor.index.__f__("log", "at pages/like/like.vue:243", "系统信息:", systemInfo);
      common_vendor.index.__f__("log", "at pages/like/like.vue:244", "运行平台:", systemInfo.platform);
      common_vendor.index.__f__("log", "at pages/like/like.vue:245", "运行环境:", systemInfo.uniPlatform);
    } catch (error) {
      common_vendor.index.__f__("warn", "at pages/like/like.vue:247", "获取系统信息失败:", error);
    }
    this.loadReportList();
  },
  methods: {
    // 加载报告列表
    loadReportList() {
      try {
        const storedReports = common_vendor.index.getStorageSync("workReports");
        if (storedReports && Array.isArray(storedReports)) {
          this.reportList = storedReports;
          common_vendor.index.__f__("log", "at pages/like/like.vue:262", "从本地存储加载报告:", this.reportList.length);
        } else {
          this.reportList = [...this.mockReports];
          common_vendor.index.__f__("log", "at pages/like/like.vue:266", "使用模拟数据:", this.reportList.length);
        }
      } catch (error) {
        common_vendor.index.__f__("warn", "at pages/like/like.vue:269", "加载本地数据失败，使用模拟数据:", error);
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
        id: "",
        title: "",
        content: "",
        summary: "",
        nextPlan: ""
      };
    },
    // 保存报告
    async saveReport() {
      if (!this.isFormValid) {
        common_vendor.index.showToast({
          title: "请填写必填项",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (this.isEditing) {
          const index = this.reportList.findIndex((item) => item.id === this.reportForm.id);
          if (index !== -1) {
            this.reportList[index] = {
              ...this.reportList[index],
              ...this.reportForm,
              updateTime: (/* @__PURE__ */ new Date()).toISOString()
            };
          }
        } else {
          const newReport = {
            id: Date.now().toString(),
            ...this.reportForm,
            author: "当前用户",
            status: "draft",
            createTime: (/* @__PURE__ */ new Date()).toISOString(),
            leaderComment: "",
            commentTime: ""
          };
          this.reportList.unshift(newReport);
        }
        try {
          common_vendor.index.setStorageSync("workReports", this.reportList);
        } catch (storageError) {
          common_vendor.index.__f__("warn", "at pages/like/like.vue:348", "本地存储失败，使用内存存储:", storageError);
        }
        common_vendor.index.showToast({
          title: this.isEditing ? "更新成功" : "创建成功",
          icon: "success"
        });
        this.closeReportModal();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/like/like.vue:360", "保存报告失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
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
    // 选择头像
    async chooseAvatar() {
      try {
        const platform = common_vendor.index.getSystemInfoSync().platform;
        common_vendor.index.__f__("log", "at pages/like/like.vue:418", "当前运行平台:", platform);
        if (platform === "devtools" || platform === "mp-weixin") {
          this.chooseImageInMiniProgram();
        } else {
          this.chooseImageInH5();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/like/like.vue:429", "头像选择失败:", error);
        common_vendor.index.showToast({
          title: "头像选择失败",
          icon: "none"
        });
      }
    },
    // 小程序环境下的头像选择
    chooseImageInMiniProgram() {
      if (!common_vendor.index.chooseImage) {
        common_vendor.index.showToast({
          title: "当前环境不支持头像选择",
          icon: "none"
        });
        return;
      }
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          try {
            common_vendor.index.__f__("log", "at pages/like/like.vue:453", "选择头像成功:", res);
            const tempFilePath = res.tempFilePaths[0];
            common_vendor.index.showLoading({ title: "上传头像中..." });
            const uploadResult = await this.uploadAvatar(tempFilePath);
            if (uploadResult) {
              this.userInfo.avatarUrl = uploadResult;
              common_vendor.index.setStorageSync("userInfo", this.userInfo);
              await this.updateUserInfo({ avatarUrl: this.userInfo.avatarUrl });
              common_vendor.index.showToast({
                title: "头像更新成功",
                icon: "success"
              });
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/like/like.vue:477", "处理头像失败:", error);
            common_vendor.index.showToast({
              title: "头像处理失败",
              icon: "none"
            });
          } finally {
            common_vendor.index.hideLoading();
          }
        },
        fail: (error) => {
          common_vendor.index.__f__("error", "at pages/like/like.vue:487", "选择头像失败:", error);
          if (error.errMsg && error.errMsg.includes("cancel")) {
            return;
          }
          common_vendor.index.showToast({
            title: "选择头像失败",
            icon: "none"
          });
        }
      });
    },
    // H5环境下的头像选择
    chooseImageInH5() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";
      input.onchange = async (event) => {
        try {
          const file = event.target.files[0];
          if (!file)
            return;
          common_vendor.index.__f__("log", "at pages/like/like.vue:514", "H5选择头像成功:", file);
          if (file.size > 5 * 1024 * 1024) {
            common_vendor.index.showToast({
              title: "图片大小不能超过5MB",
              icon: "none"
            });
            return;
          }
          if (!file.type.startsWith("image/")) {
            common_vendor.index.showToast({
              title: "请选择图片文件",
              icon: "none"
            });
            return;
          }
          common_vendor.index.showLoading({ title: "处理头像中..." });
          const tempFilePath = URL.createObjectURL(file);
          const uploadResult = await this.uploadAvatarInH5(file);
          if (uploadResult) {
            this.userInfo.avatarUrl = uploadResult;
            common_vendor.index.setStorageSync("userInfo", this.userInfo);
            await this.updateUserInfo({ avatarUrl: this.userInfo.avatarUrl });
            common_vendor.index.showToast({
              title: "头像更新成功",
              icon: "success"
            });
          }
          URL.revokeObjectURL(tempFilePath);
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/like/like.vue:562", "H5头像处理失败:", error);
          common_vendor.index.showToast({
            title: "头像处理失败",
            icon: "none"
          });
        } finally {
          common_vendor.index.hideLoading();
        }
      };
      document.body.appendChild(input);
      input.click();
      setTimeout(() => {
        document.body.removeChild(input);
      }, 1e3);
    },
    // H5环境下的头像上传
    async uploadAvatarInH5(file) {
      try {
        common_vendor.index.__f__("log", "at pages/like/like.vue:585", "H5头像上传开始:", file);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        const fileName = `avatar_${this.userInfo.userId}_${timestamp}_${random}.jpg`;
        const mockUrl = `data:${file.type};base64,${await this.fileToBase64(file)}`;
        common_vendor.index.__f__("log", "at pages/like/like.vue:596", "H5头像上传完成，生成模拟URL");
        return mockUrl;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/like/like.vue:600", "H5头像上传失败:", error);
        throw error;
      }
    },
    // 文件转Base64
    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }
};
if (!Array) {
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  _component_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.showNewReportModal && $options.showNewReportModal(...args)),
    b: common_vendor.t($data.reportList.length),
    c: $data.reportList.length > 0
  }, $data.reportList.length > 0 ? {
    d: common_vendor.f($data.reportList, (report, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(report.title),
        b: common_vendor.t($options.getStatusText(report.status)),
        c: common_vendor.n($options.getStatusClass(report.status)),
        d: common_vendor.t($options.formatDate(report.createTime)),
        e: common_vendor.t(report.author),
        f: common_vendor.t(report.summary),
        g: report.leaderComment
      }, report.leaderComment ? {
        h: common_vendor.t(report.leaderComment)
      } : {}, {
        i: report.id,
        j: common_vendor.o(($event) => $options.viewReportDetail(report), report.id)
      });
    })
  } : {}, {
    e: common_vendor.t($data.isEditing ? "编辑报告" : "新建报告"),
    f: common_vendor.o((...args) => $options.closeReportModal && $options.closeReportModal(...args)),
    g: $data.reportForm.title,
    h: common_vendor.o(($event) => $data.reportForm.title = $event.detail.value),
    i: -1,
    j: $data.reportForm.content,
    k: common_vendor.o(($event) => $data.reportForm.content = $event.detail.value),
    l: common_vendor.t($data.reportForm.content.length),
    m: -1,
    n: $data.reportForm.summary,
    o: common_vendor.o(($event) => $data.reportForm.summary = $event.detail.value),
    p: common_vendor.t($data.reportForm.summary.length),
    q: -1,
    r: $data.reportForm.nextPlan,
    s: common_vendor.o(($event) => $data.reportForm.nextPlan = $event.detail.value),
    t: common_vendor.t($data.reportForm.nextPlan.length),
    v: common_vendor.o((...args) => $options.closeReportModal && $options.closeReportModal(...args)),
    w: common_vendor.o((...args) => $options.saveReport && $options.saveReport(...args)),
    x: !$options.isFormValid,
    y: common_vendor.sr("reportModal", "622f803e-0"),
    z: common_vendor.p({
      type: "center",
      ["mask-click"]: false
    }),
    A: common_vendor.o((...args) => $options.closeDetailModal && $options.closeDetailModal(...args)),
    B: common_vendor.t($data.currentReport.title),
    C: common_vendor.t($options.formatDate($data.currentReport.createTime)),
    D: common_vendor.t($data.currentReport.author),
    E: common_vendor.t($data.currentReport.content),
    F: $data.currentReport.summary
  }, $data.currentReport.summary ? {
    G: common_vendor.t($data.currentReport.summary)
  } : {}, {
    H: $data.currentReport.nextPlan
  }, $data.currentReport.nextPlan ? {
    I: common_vendor.t($data.currentReport.nextPlan)
  } : {}, {
    J: $data.currentReport.leaderComment
  }, $data.currentReport.leaderComment ? {
    K: common_vendor.t($data.currentReport.leaderComment),
    L: common_vendor.t($options.formatDate($data.currentReport.commentTime))
  } : {}, {
    M: $data.currentReport.status === "draft"
  }, $data.currentReport.status === "draft" ? {
    N: common_vendor.o((...args) => $options.editReport && $options.editReport(...args))
  } : {}, {
    O: common_vendor.o((...args) => $options.closeDetailModal && $options.closeDetailModal(...args)),
    P: common_vendor.sr("detailModal", "622f803e-1"),
    Q: common_vendor.p({
      type: "center",
      ["mask-click"]: false
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/like/like.js.map
