"use strict";

var path = require('path');
var fs = require('fs');

var through = require('through2');
var gutil = require('gulp-util');

module.exports = function(options) {
    options = options || {};

    var startReg = /<!--\s*rev\-hash\s*-->/gim;
    var endReg = /<!--\s*end\s*-->/gim;
    var regSpecialsReg = /([.?*+^$[\]\\(){}|-])/g;
    var htmlCommentReg = /<!--(?:(?:.|\r|\n)*?)-->/gim;

    // The regular expressions for the tags to be extracted.
    // The first group of each expression should be the file path, the second should be the file extension.
    const tagsReg = [
        /<\s*script\s+.*?src\s*=\s*"([^"]+?)\.(js){1}.*".*?><\s*\/\s*script\s*>/gi,  /* <script> for .js files */
        /<\s*link\s+.*?href\s*=\s*"([^"]+?)\.(css){1}.*".*?>/gi,  /* <link> for .css files */
    ];

    var basePath, mainPath, mainName;

    function getTags(content) {
        var tags = [];

        const extractTag = function(match, filepath, extension) {
            let p = filepath.split('-v')[0];

            tags.push({
                html: match,
                path: p,
                extension: extension,
                pathReg: new RegExp(escapeRegSpecials(p + "." + extension), 'g')
            });
        };

        content = content.replace(htmlCommentReg, '');
        tagsReg.forEach(reg => {content.replace(reg, extractTag);});

        return tags;
    }

    function escapeRegSpecials(str) {
        return (str + '').replace(regSpecialsReg, "\\$1");
    }

    return through.obj(function(file, enc, callback) {
        if (file.isNull()) {
            this.push(file); // Do nothing if no contents
            callback();
        } else if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-usemin', 'Streams are not supported!'));
            callback();
        } else {
            basePath = file.base;
            mainPath = path.dirname(file.path);
            mainName = path.basename(file.path);

            var html = [];
            var sections = String(file.contents).split(endReg);

            for (var i = 0, l = sections.length; i < l; ++i) {
                if (sections[i].match(startReg)) {
                    var tag;
                    var section = sections[i].split(startReg);
                    var tags = getTags(section[1]);
                    html.push(section[0]);
                    html.push('<!-- rev-hash -->\r\n');

                    for (var j = 0; j < tags.length; j++) {
                        tag = tags[j];
                        var hash = require('crypto')
                            .createHash('md5')
                            .update(
                                fs.readFileSync(
                                    path.join((options.assetsDir ? options.assetsDir : ''), tag.path + "." + tag.extension), {
                                        encoding: 'utf8'
                                    }))
                            .digest("hex");
                        html.push(tag.html.replace(tag.pathReg, tag.path + '-v' + hash + "." + tag.extension) + '\r\n');
                    }
                    html.push('<!-- end -->');
                } else {
                    html.push(sections[i]);
                }
            }
            file.contents = new Buffer(html.join(''));
            this.push(file);
            return callback();
        }
    });
};