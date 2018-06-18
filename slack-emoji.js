#!/usr/bin/env node
'use strict';

const fs = require('fs');
const download = require('download');
const meow = require('meow');
const { WebClient } = require('@slack/client');

const token = process.env.SLACK_API_TOKEN;
const web = new WebClient(token);

process.on('unhandledRejection', console.dir);

const cli = meow(`
  Usage:
    $ slack-emoji

  Options:
    --list, -l      List emoji on Slack
    --download, -d  Download emoji
`, {
  flags: {
    list: {
      type: 'boolean',
      alias: 'l',
      default: false
    },
    download: {
      type: 'boolean',
      alias: 'd',
      default: false
    }
  }
});

// async function dl(retry, url){
//   // const data = await download(url).catch(err => {
//   //   if(retry === 0) {
//   //     console.error(`Error: ${key}\t${url}`);
//   //     console.error(err);
//   //     return;
//   //   } else {
//   //     dl(retry - 1, url);
//   //   }
//   // });
//   const data = await download(url)
//   fs.writeFileSync(`./emoji/${key}${extention}`, data);
//   console.log(`Done: ${key}${extention}`);
// }

web.emoji.list().then(res => {

  if (cli.flags.download) {
    Object.keys(res.emoji).map( key => {
      const url = res.emoji[key];
      if(url.match(/alias/)) return;

      const extention = url.match(/\.[^\.]+$/);
      // await dl(3, url);
      download(url).then(data => {
        fs.writeFileSync(`./emoji/${key}${extention}`, data);
      }).then(() => {
        console.log(`Downloaded: ${key}${extention}`);
      }).catch(err => {
        if (err.code === 'ENOTFOUND') {
          download(url).then(data => {
            fs.writeFileSync(`./emoji/${key}${extention}`, data);
          }).then(() => {
            console.log(`Retry Downloaded: ${key}${extention}`);
          }).catch(err => {
            console.error(`Error: ${key}\t${url}`);
            console.error(err);
          });
        }
      });
    });
    return;
  }

  console.log(res.emoji);
});
