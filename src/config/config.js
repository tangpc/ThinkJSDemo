// default config
module.exports = {
  workers: 1,

  // 可以公开访问的Controller
  publicController: [
    // 格式为controller
    'index',
    'catalog'
  ],

  // 可以公开访问的Action
  publicAction: [
    // 格式为： controller+action
    'comment/list',
    'comment/count'
  ],


};
