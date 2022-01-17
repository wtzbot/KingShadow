/* Codded by @phaticusthiccy
Telegram: t.me/phaticusthiccy
Instagram: www.instagram.com/kyrie.baran
*/

const {MessageType, Mimetype, MessageOptions} = require('@adiwajshing/baileys');
const Asena = require('../events');
const Config = require('../config');
const WhatsAsenaStack = require('whatsasena-npm');
const axios = require('axios')
let wk = Config.WORKTYPE == 'public' ? false : true

var CLR_DESC = ''
var wr = ''
if (Config.LANG == 'TR') CLR_DESC = 'Facebook üzeriden video indirir.', wr = '*Lütfen Geçerli Bir Video Bağlantısı Girin!*'
if (Config.LANG == 'AZ') CLR_DESC = 'Facebookdan video yükləyir.', wr = '*Zəhmət olmasa Etibarlı Video Bağlantısı daxil edin!*'
if (Config.LANG == 'EN') CLR_DESC = 'Downloads videos from Facebook.', wr = '*Please Enter a Valid Video Link!*'
if (Config.LANG == 'PT') CLR_DESC = 'Baixa vídeos do Facebook.', wr = '*Insira um link de vídeo válido!*'
if (Config.LANG == 'RU') CLR_DESC = 'Скачивает видео с Facebook.', wr = '*Пожалуйста, введите действительную ссылку на видео!*'
if (Config.LANG == 'HI') CLR_DESC = 'फेसबुक से वीडियो डाउनलोड करता है।', wr = '*कृपया एक वैध वीडियो लिंक दर्ज करें!*'
if (Config.LANG == 'ES') CLR_DESC = 'Descarga videos de Facebook.', wr = '*¡Ingrese un enlace de video válido!*'
if (Config.LANG == 'ML') CLR_DESC = 'Facebook വീഡിയോകൾ ഡൗൺലോഡ് ചെയ്യുന്നു.', wr = '*സാധുവായ ഒരു വീഡിയോ ലിങ്ക് നൽകുക!*'
if (Config.LANG == 'ID') CLR_DESC = 'Mengunduh video dari Facebook.', wr = '*Silakan Masukkan Tautan Video yang Valid!*'

Asena.addCommand(
  {
    pattern: "fb ?(.*)",
    fromMe: true,
    desc: Lang.FB_DESC,
  },
  async (message, match) => {
    match = !message.reply_message ? match : message.reply_message.text
    if (match === "") return await message.sendMessage(Lang.NEED_REPLY)
    await message.sendMessage(Lang.DOWNLOADING)
    let links = await downVideo(match)
    if (links.length == 0) return await message.sendMessage(Lang.NOT_FOUND)
    let { buffer, size } = await getBuffer(links[0])
    if (size > 100)
      return await message.sendMessage(
        Lang.SIZE.format(size, links[0], links[1])
      )
    return await message.sendMessage(
      buffer,
      { quoted: message.quoted, caption: Lang.CAPTION.format(links[1] || "") },
      MessageType.video
    )
  }
));
