const Base = require('./base.js');
const fs = require('fs');
const puppeteer = require('puppeteer');

module.exports = class extends Base {
  indexAction() {
    return this.display();
  }

  openAction() {
    console.log('websocket建立链接成功')
    this.emit('opend', 'This client opened successfully!')//回应
    this.broadcast('joined', 'There is a new client joined successfully!')//广播
  }

  closeAction() {
    console.log('websocket链接关闭')
  }

  addUserAction() {
    console.log('获取客户端 addUser 事件发送的数据', this.wsData);
    console.log('获取当前 WebSocket 对象', this.websocket);
    console.log('判断当前请求是否是 WebSocket 请求', this.isWebsocket);
  }

  async getPaMusicAction() {
    console.log('爬网易云音乐 歌曲信息');
    console.log('获取客户端 addUser 事件发送的数据', this.wsData);
    (async () => {
      // const browser = await (puppeteer.launch({ executablePath: '/Users/huqiyang/Documents/project/z/chromium/Chromium.app/Contents/MacOS/Chromium', headless: false }));
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      // 进入页面
      await page.goto('https://music.163.com/#', { waitUntil: 'networkidle2' });

      // 点击搜索框拟人输入 鬼才会想起
      const musicName = this.wsData;
      await page.type('.txt.j-flag', musicName, { delay: 0 });

      // 回车
      await page.keyboard.press('Enter');

      // 获取歌曲列表的 iframe
      await page.waitFor(2000);
      let iframe = await page.frames().find(f => f.name() === 'contentFrame');
      const SONG_LS_SELECTOR = await iframe.$('.srchsongst');

      const selectedSongHref = await iframe.evaluate((e) => {
        const data = {};
        data.innerHTML = e.innerHTML;
        data.childNodes = [];
        for (let i = 0; i < e.childNodes.length; i++) {
          const child = {};
          const base = e.childNodes[i];
          child.innerHTML = base.innerHTML;
          child.info = [];
          for (let j = 0; j < base.childNodes.length; j++) {
            const element = base.childNodes[j];
            const info = {}
            if (element.innerText !== "") {
              if (element.getElementsByTagName('a').length !== 0) {
                info.name = element.innerText;
              }
              if (element.getElementsByTagName('a').length === 1) {
                info.href = element.getElementsByTagName('a')[0].href;
              } else if (element.getElementsByTagName('a').length === 2) {
                info.href = element.getElementsByTagName('a')[0].href;
                info.MVhref = element.getElementsByTagName('a')[1].href;
              }
              if (element.getElementsByTagName('a').length === 0) {
                info.date = element.innerText;
              }
              child.info.push(info)
            }
          }
          data.childNodes.push(child);
        }
        return data;
      }, SONG_LS_SELECTOR);
      console.log(selectedSongHref);

      // 进入歌曲页面
      await page.goto(selectedSongHref.childNodes[0].info[0].href, { waitUntil: 'networkidle2' });

      iframe = await page.frames().find(f => f.name() === 'contentFrame');

      // 截图
      await page.screenshot({
        path: 'www/static/image/' + selectedSongHref.childNodes[0].info[0].name + '.png',
        fullPage: true
      });

      this.emit('imgUrl', '/static/image/' + selectedSongHref.childNodes[0].info[0].name + '.png')//回应

      // 点击 展开按钮
      const unfoldButton = await iframe.$('#flag_ctrl');
      await unfoldButton.click();

      // 获取歌词
      const LYRIC_SELECTOR = await iframe.$('#lyric-content');
      let lyricCtn = await iframe.evaluate(e => {
        return e.innerText;
      }, LYRIC_SELECTOR);

      const n = lyricCtn.lastIndexOf('收起');
      lyricCtn = lyricCtn.substring(0, n - 1);
      console.log(lyricCtn);

      this.emit('lyricCtn', lyricCtn)//回应

      // 写入文件
      const writerStream = fs.createWriteStream('www/static/lyrics/' + selectedSongHref.childNodes[0].info[0].name + '.txt');
      writerStream.write(lyricCtn, 'UTF8');
      writerStream.end();

      // 获取评论数量
      const commentCount = await iframe.$eval('.sub.s-fc3', e => e.innerText);
      console.log(commentCount);

      // 获取评论
      const commentList = await iframe.$$eval('.itm', elements => {
        console.log(elements);
        const ctn = elements.map(v => {
          return v.innerText.replace(/\s/g, '');
        });
        return ctn;
      });
      console.log(commentList);
      this.emit('commentList', commentList)//回应
    })();
  }
};
