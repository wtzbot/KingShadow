/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/

const Asena = require('../events');
const Heroku = require('heroku-client');
const Config = require('../config');
const {MessageType} = require('@adiwajshing/baileys');
const got = require('got');
const fs = require('fs');
const Db = require('./sql/plugin');

const Language = require('../language');
const Lang = Language.getString('_plugin');
const NLang = Language.getString('updater');

let msg = Config.LANG == 'TR' || Config.LANG == 'AZ' ? '*Bu Plugin Resmi Olarak Onaylanmıştır!* ✅' : '*This Plugin is Officially Approved!* ✅'
let unmsg = Config.LANG == 'TR' || Config.LANG == 'AZ' ? '*Bu Plugin Resmi Değildir!* ❌' : '*This Plugin isn\'t Officially Approved!* ❌'

const heroku = new Heroku({
    token: Config.HEROKU.API_KEY
});

let baseURI = '/apps/' + Config.HEROKU.APP_NAME;
var LANG = {
            unaffinfo: Config.LANG == 'TR' || Config.LANG == 'AZ' ? '*Yüklenen Pluginin Tehlike Derecesi:* _%' : '*Danger Level of Installed Plugin:* _%',
            harmful: Config.LANG == 'TR' || Config.LANG == 'AZ' ? '*Bu Plugin Zararlı Olduğundan Yüklenemez!*' : '*This Plugin Cannot Be Installed As It Is Harmful!*',
            duplicate: Config.LANG == 'TR' || Config.LANG == 'AZ' ? '*Aynı Plugini 2 Defa Yüklemeyezsiniz!*' : '*You Cannot Install the Same Plugin 2 Times!*',
            limit: Config.LANG == 'TR' || Config.LANG == 'AZ' ? '*Bu Plugin Güvenlik Sınırını Aşıyor!*\n*Zararlılık Yüzdesi:* _%' : '*This Plugin Exceeds Security Limit!*\n*Percentage of Harm:* _%',
            imside: Config.LANG == 'TR' || Config.LANG == 'AZ' ? '*Varolan Pluginleri Tekrar Yükleyemezsin!*' : '*You Cant Reinstall Existing Plugins!*'
};
Asena.addCommand(
    { pattern: "plugin ?(.*)", fromMe: true, desc: Lang.INSTALL_DESC },
    async (message, match) => {
        if (match === "" && match !== "list")
            return await message.sendMessage(Lang.NEED_URL)
        if (match == "list") {
            let mesaj = Lang.INSTALLED_FROM_REMOTE
            let plugins = await PluginDB.findAll()
            if (plugins.length < 1) {
                return await message.sendMessage(Lang.NO_PLUGIN)
            } else {
                plugins.map((plugin) => {
                    mesaj +=
                        "*" + plugin.dataValues.name + "*: " + plugin.dataValues.url + "\n"
                })
                return await message.sendMessage(mesaj)
            }
        }
        try {
            var url = new URL(match)
        } catch {
            return await message.sendMessage(Lang.INVALID_URL)
        }

        if (url.host === "gist.github.com") {
            url.host = "gist.githubusercontent.com"
            url = url.toString() + "/raw"
        } else {
            url = url.toString()
        }

        let response = await got(url)
        if (response.statusCode == 200) {
            let plugin_name = /pattern: ["'](.*)["'],/g.exec(response.body)
            if (plugin_name.length >= 1) {
                plugin_name = plugin_name[1].split(" ")[0]
            } else {
                plugin_name = Math.random().toString(36).substring(8)
            }
            fs.writeFileSync("./plugins/" + plugin_name + ".js", response.body)
            try {
                require("./" + plugin_name)
            } catch (e) {
                await message.sendMessage(Lang.INVALID_PLUGIN + "```" + e + "```")
                return fs.unlinkSync("./plugins/" + plugin_name + ".js")
            }
            await installPlugin(url, plugin_name)
            await message.sendMessage(Lang.INSTALLED.format(plugin_name))
        }
    }
)
Asena.addCommand(
    { pattern: "remove (.*)", fromMe: true, desc: Lang.REMOVE_DESC },
    async (message, match) => {
        if (match === "") return await message.sendMessage(Lang.NEED_PLUGIN)
        let plugin = await PluginDB.findAll({ where: { name: match } })
        if (plugin.length < 1) {
            return await message.sendMessage(Lang.NOT_FOUND_PLUGIN)
        } else {
            await plugin[0].destroy()
            delete require.cache[require.resolve("./" + match + ".js")]
            fs.unlinkSync("./plugins/" + match + ".js")
            return await message.sendMessage(Lang.DELETED)
        }
    }
)
