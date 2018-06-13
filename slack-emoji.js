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

web.emoji.list().then(res => {

  if (cli.flags.download) {
    const tasks = Object.keys(res.emoji).map( key => {
      const url = res.emoji[key];
      if(url.match(/alias/)) return;

      const extention = url.match(/\.[^\.]+$/);
      download(url).then(data => {
        fs.writeFileSync(`./emoji/${key}${extention}`, data);
      }).then(() => {
        console.log(`Downloaded: ${key}${extention}`);
      }).catch(err => {
        console.error(`Error: ${key}\t${url}`);
      });
    });
    return;
  }

  console.log(res.emoji);
});
