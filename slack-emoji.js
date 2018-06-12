#!/usr/bin/env node
'use strict';

const Slack = require('slack-node');
const fs = require('fs');
const download = require('download');
const meow = require('meow');

const apiToken = process.env.SLACK_API_TOKEN;
const slack = new Slack(apiToken);

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

slack.api("emoji.list", function (err, res) {

  if (cli.flags.download) {
    Object.keys(res.emoji).forEach( key => {
      const url = res.emoji[key];
      if(url.match(/alias/)) return;

      const extention = url.match(/\.[^\.]+$/);
      download(url).then(data => {
        fs.writeFileSync(`./emoji/${key}${extention}`, data);
      }).then(() => {
        console.log(`Downloaded: ${key}${extention}`);
      });
    });
    return;
  }

  console.log(res.emoji);

});
