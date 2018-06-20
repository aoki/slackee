#!/usr/bin/env node
'use strict';

const fs = require('fs');
const download = require('download');
const meow = require('meow');
const { WebClient } = require('@slack/client');
const Table = require('cli-table2');
const imgcat = require('imgcat');

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

(async () => {

  if (cli.flags.list) {
    const table = new Table({
      head: ['Icon', 'Name', 'URL'],
      chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
        , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
        , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
        , 'right': '' , 'right-mid': '' , 'middle': ' ' },
      style: { 'padding-left': 0, 'padding-right': 0 }
    });
    const emojiListJson = (await web.emoji.list()).emoji;
    const emojiList = Object.keys(emojiListJson).map(key => {
      return [key, emojiListJson[key]];
      // await imgcat(emojiListJson[key]).then(img => {console.log(img)});
    });
    table.push(...emojiList);
    console.log(table.toString());
    // console.log(emojiList);
    process.exit(0);
  }

  web.emoji.list().then(res => {

    if (cli.flags.download) {
      Object.keys(res.emoji).map( key => {
        const url = res.emoji[key];
        if(url.match(/alias/)) return;

        const extention = url.match(/\.[^\.]+$/);
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

})();


