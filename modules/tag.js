var sprintf = require('sprintf-js').sprintf,
    Tag = {
        regex: /^(.*)?(\d+)\.(\d+)\.(\d+)$/,

        versionMap: {
            major: 1,
            minor: 2,
            patch: 3
        },

        hasCorrectFormat: function(tag) {
            return Tag.regex.test(tag);
        },

        bump: function(version, tag) {
            var index = Tag.versionMap[version] + 1;

            parts = Tag.regex.exec(tag);
            parts[index] = (parseInt(parts[index], 10) + 1) + '';
            if(2 === index) {
                parts[index + 2] = '0';
                parts[index + 1] = '0';
            }
            if(3 === index) {
                parts[index + 1] = '0';
            }
            return sprintf('%s%s.%s.%s', parts[1], parts[2], parts[3], parts[4]);
        }
    };

exports.bump             = Tag.bump;
exports.hasCorrectFormat = Tag.hasCorrectFormat;
