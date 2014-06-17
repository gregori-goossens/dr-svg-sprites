var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var util = require("./util");

module.exports = function (sprite, callback) {

	var config = sprite.config;

	
	handlebars.registerHelper("url", function (filepath, relation) {
		if (typeof relation == "string") {
			relation = path.dirname(relation);
		}
		else {
			//if the path includes filename return dirname
			if (path.basename(config.cssPath).indexOf(".") > -1) {
				relation = path.dirname(config.cssPath);
			}
			else {
				relation = config.cssPath;
			}
		}
		return path.relative(relation, filepath).replace(/\\/g, "/");
	});

	handlebars.registerHelper("unit", function (value/*, modifiers*/) {
		var i = 1;
		while (typeof arguments[i] == "number") {
			value *= arguments[i];
			i++;
		}
		if (config.cssUnit == "rem" || config.cssUnit == "em") {
			value = value / config.cssBaseFontSize;
		}
		return value + ((value === 0) ? "" : config.cssUnit);
	});

	handlebars.registerHelper("prefix", function (items, prefix) {
		return prefix + items.map(function (item) {
			return item.className;
		}).join(", " + prefix);
	});

	handlebars.registerHelper("prefixAll", function (sizes, prefix) {
		return sizes.map(function (size) {
			return handlebars.helpers.prefix.apply(this, [size.items, prefix]);
		}.bind(this)).join(", ");
	});

	fs.readFile(config.template, "utf-8", function (err, template) {
		if (err) {
			throw err;
		}

		var compiler = handlebars.compile(template);
		var source = compiler(sprite);

		util.write(sprite.cssPath, source, function () {
			callback(null);
		});
	});

};