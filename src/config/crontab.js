module.exports = [
    {
        interval: '10s', // 定时执行间隔时间
        immediate: true, // 是否立即执行
        enable: true, // 是否开启定时任务
        type: 'one', // 只在一个进程中执行
        handle: 'crontab/test' // 路由方式请求
    }
    // , {
    //     interval: '10s',
    //     immediate: true,
    //     handle: () => {
    //         //do something
    //     }
    // }
    // , {
    //     cron: '0 */1 * * *',
    //     handle: 'crontab/test',
    //     type: 'all'
    // }
];



