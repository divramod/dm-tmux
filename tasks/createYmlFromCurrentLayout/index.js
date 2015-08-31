// =========== [ REQUIRE ] ===========
var co = require("co");
var dmPrompt = require("dm-prompt").Inquirer;
var dmPath = require("dm-path");
var colors = require("colors");
var fs = require("fs");
require('shelljs/global');

// =========== [ MODULE DEFINE ] ===========
var job = {};

// =========== [ job.start() ] ===========
job.start = co.wrap(function*(directory, fileName) {
    try {
        var directory = directory || process.argv[3] || undefined;
        var fileName = fileName || process.argv[4] || undefined;

        console.log("start createYmlFromCurrentLayout");
        var listWindowsOutput = exec('tmux list-windows', {
            silent: true
        }).output;

        var windows = listWindowsOutput.split(/\r?\n/);
        var tmuxWindows = [];
        for (var i = 0, l = windows.length; i < l; i++) {
            var w = windows[i];
            if (w !== "") {
                var tmuxWindow = {};
                tmuxWindow.number = w.substring(0, w.indexOf(":"));
                tmuxWindow.name = w.substring(w.indexOf(":") + 2, w.indexOf("(") - 2);
                tmuxWindow.layout = w.substring(w.indexOf("layout") + 6, w.lastIndexOf("]"));
                tmuxWindow.paneCount = w.substring(w.indexOf("(") + 1, w.indexOf("panes") - 1);
                tmuxWindows.push(tmuxWindow);
            }
            //console.log(i);
        }
        // =========== [ Errors ] ===========
        var errors = [];

        // =========== [ ask for yml directory ] ===========
        if (!directory) {
            var configFilePath = dmPath.replace("~/.dm-tmux.json");
            var message = "Where do you want to save the yml?";
            if (test("-f", configFilePath)) {
                var config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
                if (config.ymlFilePath) {
                    directory = config.ymlFilePath;
                    message += " [default: " + config.ymlFilePath + "]";
                }
            }
            var directoryAnswer =
                yield dmPrompt({
                    type: "input",
                    name: "directory",
                    message: message
                });
            if (directoryAnswer.directory !== "") {
                directory = directoryAnswer.directory;
            }
        }

        directory = dmPath.replace(directory);
        var directoryOk = false;
        if (directory !== "") {
            if (test("-d", directory)) {
                directoryOk = true;
            } else {
                errors.push("Directory not exitent!");
            }
        } else {
            errors.push("Directory cannot be blank!");
        }

        // =========== [ give yml a name ] ===========
        if (!fileName) {
            var nameAnswer =
                yield dmPrompt({
                    type: "input",
                    name: "name",
                    message: "Give yml a name!"
                });
            fileName = nameAnswer.name;
        }

        var nameOk = false;
        if (fileName !== "") {
            var filePath = directory + "/" + fileName + ".yml";
            if (!test("-f", filePath)) {
                nameOk = true;
            } else {
                errors.push("File existent!")
            }
        } else {
            errors.push("Name cannot be blank!");
        }

        // =========== [ get root path ] ===========
        var rootAnswer =
            yield dmPrompt({
                type: "input",
                name: "root",
                message: "Give a root directory for the project! [default: ~]"
            });
        var root = rootAnswer.root;
        if (root === "") {
            root = "~";
        }
        root = dmPath.replace(root);
        var rootOk = false;
        if (test("-d", root)) {
            rootOk = true;
        } else {
            errors.push("The give root directory " + root.yellow + "doesn't exists!");
        }

        // =========== [ create yml ] ===========
        if (directoryOk && nameOk && rootOk) {

            // =========== [ create yml file ] ===========
            var ymlFileString = getYmlFileString(tmuxWindows, filePath, fileName, root);
            ymlFileString.to(filePath);
            var command = "vim " + filePath;
            var spawn = require('child_process').spawnSync;
            var myProcess = spawn('sh', ['-c', command], {
              stdio: 'inherit'
            });

        } else {
            for (var i = 0, l = errors.length; i < l; i++) {
                var e = errors[i];
                console.log(e.red);
            }
        }

    } catch (e) {
        console.log("Filename: ", __filename, "\n", e.stack);
    }
    return yield Promise.resolve();
}); // job.start()

function getYmlFileString(tmuxWindows, filePath, name, root) {
    var s = [
        "# " + filePath,
        "name: " + name,
        "root: " + root,
        "windows:"
    ];
    for (var i = 0, l = tmuxWindows.length; i < l; i++) {
        var w = tmuxWindows[i];
        s.push("  - prompt:");
        s.push("      layout:" + w.layout);
        s.push("      panes:");
        for (var x = 0, y = w.paneCount; x < y; x++) {
            if (x === 0) {
                s.push("        - vimn");
            } else if (x === 1) {
                s.push("        - ls");
            } else {
                s.push("        - ls -lisa");
            }
        }
    }

    return s.join("\n");
}

// =========== [ MODULE EXPORT ] ===========
module.exports = job;
