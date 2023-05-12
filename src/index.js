"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const fs_1 = __importDefault(require("fs"));
const variableNameRegex = /(?<=\$\()[a-zA-Z0-9_]+?(?=\))/g;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get input
            const filepath = tl.getInput('filepath', true) || "";
            const variableName = tl.getInput('variableName', true) || "";
            let replaceVariables = tl.getInput('replaceVariables', false) === "true";
            const verbose = tl.getInput('verbose', false) === "true";
            const addNewLine = tl.getInput('addNewLine', false) === "true";
            if (verbose) {
                console.log('VERBOSE LOGGING');
                console.log('----------------');
                console.log(`'filepath': ${filepath}`);
                console.log(`'variableName': ${variableName}`);
                console.log('');
            }
            // Validate file exist
            if (!tl.exist(filepath)) {
                tl.setResult(tl.TaskResult.Failed, 'File not exist');
            }
            else {
                // Read file
                let filecontent = fs_1.default.readFileSync(filepath, 'utf-8');
                let variables = Array.from(new Set(filecontent.match(variableNameRegex) || []));
                if (variables.length = 0) {
                    replaceVariables = false;
                }
                if (verbose) {
                    console.info('=== File Content ===');
                    console.info(filecontent);
                    console.info('====================');
                    console.log(`'filecontent.length': ${filecontent.length}`);
                    console.log('');
                    if (replaceVariables) {
                        console.info(`'Variables in file': ${variables}`);
                        console.log('');
                    }
                }
                try {
                    let processedContent = filecontent;
                    if (replaceVariables) {
                        variables.forEach(varName => {
                            let varValue = tl.getVariable(varName);
                            if (varValue !== null && varValue !== undefined) {
                                let variableRegex = new RegExp("\\$\\(" + varName + "\\)", 'g');
                                processedContent = processedContent.replace(variableRegex, varValue);
                            }
                            else {
                                console.warn(`The variable $(${varName}) not exist in pipeline variables or is out of scope`);
                            }
                        });
                    }
                    if (addNewLine) {
                        processedContent = processedContent + "\n";
                    }
                    tl.setVariable(variableName, processedContent, false);
                    tl.setResult(tl.TaskResult.Succeeded, 'The file content was stored in the variable');
                }
                catch (error) {
                    tl.setResult(tl.TaskResult.Failed, error.message);
                }
            }
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err.message);
        }
    });
}
run();
