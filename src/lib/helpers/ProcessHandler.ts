import * as _ from "lodash";
import { GeneralUtils } from "./GeneralUtils";

export class ProcessHandler {

    private static instance: ProcessHandler;

    private onExitListeners: Array<Function>;

    /**
     * It is recommended to have only one instance per application. Use getInstance() to get a singleton.
     */
    constructor() {
        this.onExitListeners = [];
        this.registerProcessExitEvents();
    }

    static getInstance() {
        if (this.instance === undefined) {
            this.instance = new ProcessHandler();
        }
        return this.instance;
    }

    registerOnExitListener(callback: Function) {
        if (!_.isFunction(callback)) {
            throw new Error('Passed callback must be a function!');
        }

        this.onExitListeners.push(callback);
        return () => {
            _.remove(this.onExitListeners, function (val) {
                return val === callback;
            });
        };
    }

    getProcessProperties(): Map<string, string> {
        let result = new Map<string, string>();
        process.argv.forEach((arg: string, index) => {
            if (index === 0) {
                result.set('application.process.node', arg);
            }
            if (index === 1) {
                result.set('application.process.entryFile', arg);
            }
            if (index > 1) {
                if (arg.includes('=')) {
                    let [key, value] = arg.split('=');
                    result.set(key.trim(), value.trim());
                } else {
                    result.set(arg, 'true');
                }
            }
        });
        return result;
    }

    getNodeProperties(): Map<string, string> {
        let result = new Map<string, string>();
        process.execArgv.forEach((arg: string) => {
            if (arg.includes('=')) {
                let [key, value] = arg.split('=');
                result.set(key.trim(), value.trim());
            } else {
                result.set(arg, 'true');
            }
        });
        return result;
    }

    getEnvironmentProperties(): Map<string, string> {
        return GeneralUtils.flattenObject(process.env);
    }

    private registerProcessExitEvents() {
        process.on('exit', () => this.onExitListeners.forEach((callback) => callback()));
        process.on('SIGINT', () => process.exit());
    }
}