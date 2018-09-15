module.exports = class extends think.Logic {
  // 和controller的Action一一对应
  indexAction() {

  }

  /**
   * 爬虫截图数据效验
   */
  getPaPageAction() {
    this.allowMethods = 'get'; // 请求方式
    this.rules = {
      url: { // 参数名
        string: true, // 字段类型为 String 类型
        required: true, // 字段必填
        default: 'http://www.tpc126.cn', // 字段默认值为 'www.tpc126.cn'
        trim: true, // 字段需要trim处理 清除前后空格
        method: 'get' // 指定获取数据的方式
      }
    };
  }

  /**
   * 爬网易云音乐歌曲信息
   */
  getPaMusicAction() {
    this.allowMethods = 'get'; // 请求方式
    this.rules = {
      name: { // 参数名
        string: true, // 字段类型为 String 类型
        required: true, // 字段必填
        default: '鬼才会想起', // 字段默认值为 '鬼才会想起'
        trim: true, // 字段需要trim处理 清除前后空格
        method: 'get' // 指定获取数据的方式
      }
    };
  }
};
