const Base = require('./base.js');
const fs = require('fs');
const puppeteer = require('puppeteer');

module.exports = class extends Base {

  indexAction() {
    return this.display();
  }

  /**
   * 截图
   */
  async getPaPageAction() {
    const url = this.get('url');
    // 截图目标网站png
    await (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);
      await page.screenshot({ path: 'example.png' });

      await browser.close();
    })();

    // 保存目标网站PDF
    await (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.pdf({ path: 'hn.pdf', format: 'A4' });

      await browser.close();
    })();

    // 评估脚本
    await (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(url);

      // Get the "viewport" of the page, as reported by the page.
      const dimensions = await page.evaluate(() => {
        return {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
          deviceScaleFactor: window.devicePixelRatio
        };
      });

      console.log('Dimensions:', dimensions);

      await browser.close();
    })();
  }

  /**
   * 爬网易云音乐 歌曲名称：鬼才会想起
   */
  async getPaMusicAction() {
    var start = new Date().getTime();
    await (async () => {
      // const browser = await (puppeteer.launch({ executablePath: '/Users/huqiyang/Documents/project/z/chromium/Chromium.app/Contents/MacOS/Chromium', headless: false }));
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      // 进入页面
      await page.goto('https://music.163.com/#', { waitUntil: 'networkidle2' });

      // 点击搜索框拟人输入 鬼才会想起
      const musicName = this.get('name');
      await page.type('.txt.j-flag', musicName, { delay: 0 });

      // 回车
      await page.keyboard.press('Enter');

      // 获取歌曲列表的 iframe
      await page.waitFor(1000);
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


      /* {
        // 获取歌曲 鬼才会想起 的地址
        const selectedSongHref = await iframe.evaluate(e => {
          const songList = Array.from(e.childNodes);
          const idx = songList.findIndex(v => v.childNodes[1].innerText.replace(/\s/g, '') === '鬼才会想起');
          return songList[idx].childNodes[1].firstChild.firstChild.firstChild.href;
        }, SONG_LS_SELECTOR);

        console.log(selectedSongHref); // https://music.163.com/song?id=524128365

        // 进入歌曲页面
        await page.goto(selectedSongHref, { waitUntil: 'networkidle2' });
      } */


      // 获取歌曲页面嵌套的 iframe
      // await page.waitFor(1000);
      iframe = await page.frames().find(f => f.name() === 'contentFrame');

      // 截图
      await page.screenshot({
        path: 'www/static/image/' + selectedSongHref.childNodes[0].info[0].name + '.png',
        fullPage: true
      });

      this.assign('imgUrl', '/static/image/' + selectedSongHref.childNodes[0].info[0].name + '.png');

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

      this.assign('lyricCtn', lyricCtn);

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
      this.assign('commentList', commentList);
    })();

    console.log(new Date().getTime() - start, '毫秒')
    return this.display('test'); //渲染模板
  }

  /**
   * 测试可视化操作
   */
  async getPaTestAction() {
    var start = new Date().getTime();
    await puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless: false, slowMo: 100,
      timeout: 0
    }).then(async browser => {
      let page = await browser.newPage();
      await page.setJavaScriptEnabled(true);
      await page.goto("https://music.163.com/#");
      const searchInput = await page.$(".txt.j-flag");
      await searchInput.focus(); //定位到搜索框
      await page.keyboard.type("演员");
      await page.keyboard.press('Enter');// 回车

      await page.waitForSelector('.s-fc7'); //等待元素加载之后，否则获取不异步加载的元素

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

      // 截图
      await page.screenshot({
        path: 'www/static/image/' + selectedSongHref.childNodes[0].info[0].name + '.png',
        fullPage: true
      });

      this.assign('imgUrl', '/static/image/' + selectedSongHref.childNodes[0].info[0].name + '.png');

      // 点击 展开按钮
      iframe = await page.frames().find(f => f.name() === 'contentFrame');

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

      this.assign('lyricCtn', lyricCtn);

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
      this.assign('commentList', commentList);

      browser.close();
    });

    console.log(new Date().getTime() - start, '毫秒')
    return this.display('test'); //渲染模板
  }


  /**
   * 京东 http://www.r9it.com/20171106/puppeteer.html
   */
  async getPaJDAction() {
    //延时函数
    function sleep(delay) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(1)
          } catch (e) {
            reject(0)
          }
        }, delay)
      })
    }

    puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless: false, slowMo: 250,
      timeout: 0
    }).then(async browser => {

      let page = await browser.newPage();
      await page.setJavaScriptEnabled(true);
      await page.goto("https://www.jd.com/");
      const searchInput = await page.$("#key");
      await searchInput.focus(); //定位到搜索框
      await page.keyboard.type("手机");
      const searchBtn = await page.$(".button");
      await searchBtn.click();
      await page.waitForSelector('.gl-item'); //等待元素加载之后，否则获取不异步加载的元素
      const links = await page.$$eval('.gl-item > .gl-i-wrap > .p-img > a', links => {
        return links.map(a => {
          return {
            href: a.href.trim(),
            title: a.title
          }
        });
      });
      page.close();

      const aTags = links.splice(0, 10);
      for (var i = 1; i < aTags.length; i++) {
        page = await browser.newPage()
        page.setJavaScriptEnabled(true);
        await page.setViewport({ width: 1920, height: 1080 });
        var a = aTags[i];
        console.log(a);
        await page.goto(a.href, { timeout: 0 }); //防止页面太长，加载超时

        //注入代码，慢慢把滚动条滑到最底部，保证所有的元素被全部加载
        let scrollEnable = true;
        let scrollStep = 500; //每次滚动的步长
        while (scrollEnable) {
          scrollEnable = await page.evaluate((scrollStep) => {
            let scrollTop = document.scrollingElement.scrollTop;
            document.scrollingElement.scrollTop = scrollTop + scrollStep;
            return document.body.clientHeight > scrollTop + 1080 ? true : false
          }, scrollStep);
          console.log(scrollEnable, scrollStep);
          await sleep(100);
        }
        await page.waitForSelector("#footer-2017", { timeout: 0 }); //判断是否到达底部了
        let filename = "www/static/image/items-" + i + ".png";
        //这里有个Puppeteer的bug一直没有解决，发现截图的高度最大只能是16384px， 超出部分被截掉了。
        await page.screenshot({ path: filename, fullPage: true });
        page.close();
      }

      browser.close();
    });
  }

};
