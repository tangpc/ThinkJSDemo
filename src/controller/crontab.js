module.exports = class extends think.Controller {
  async testAction() {
    // 如果不是定时任务调用，则拒绝
    if (!this.isCli) return this.fail(1000, 'deny');

    console.log('执行定时任务');
  }
};
