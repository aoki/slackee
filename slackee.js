#!/usr/bin/env node
'use strict';

const fs = require('fs');
const download = require('download');
const meow = require('meow');
const { WebClient } = require('@slack/client');
const Table = require('cli-table2');
const Ora = require('ora');

const token = process.env.SLACK_API_TOKEN;
const web = new WebClient(token);

process.on('unhandledRejection', console.dir);

const cli = meow(`
  Usage:
    $ slack-emoji

  Options:
    --list, -l      List emoji on Slack
    --download, -d  Download emoji
    --output, -o    Specify output directory
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
    },
    output: {
      type: 'string',
      alias: 'o',
      default: './emoji'
    }
  }
});

async function listEmoji() {
  const spinner = new Ora().start('Load Emoji');

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
  });
  table.push(...emojiList);
  const list = table.toString();

  spinner.clear();
  console.log(list);

  process.exit(0);
}

function downloadEmoji() {
  const outputDir = cli.flags.output;
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  web.emoji.list().then(res => {

    Object.keys(res.emoji).map(key => {
      const url = res.emoji[key];
      if (url.match(/alias/)) return;

      const extention = url.match(/\.[^\.]+$/);
      download(url).then(data => {
        fs.writeFileSync(`${outputDir}/${key}${extention}`, data);
      }).then(() => {
        console.log(`Downloaded: ${key}${extention}`);
      }).catch(err => {
        if (err.code === 'ENOTFOUND') {
          download(url).then(data => {
            fs.writeFileSync(`${outputDir}/${key}${extention}`, data);
          }).then(() => {
            console.log(`Retry Downloaded: ${key}${extention}`);
          }).catch(err => {
            console.error(`Error: ${key}\t${url}`);
            console.error(err);
          });
        }
      });
    });

  });
}

(async () => {
  if (cli.flags.list) listEmoji();
  if (cli.flags.download) downloadEmoji();
})();


