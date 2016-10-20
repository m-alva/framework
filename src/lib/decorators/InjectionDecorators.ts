import {ComponentUtil} from "./ComponentDecorator";
import { TypeUtils } from "../helpers/TypeUtils";
import { InjectionError } from "../errors/InjectionError";
import { DecoratorType, DecoratorUtil } from "../helpers/DecoratorUtils";
import "reflect-metadata";
import { DecoratorHelper } from "./common/DecoratorHelper";
import { DecoratorMetadata } from "./common/DecoratorMetadata";

export class DependencyData {
    token: Symbol;
    isArray: boolean;

    constructor(token: Symbol, isArray: boolean) {
        this.token = token;
        this.isArray = isArray;
    }
}
export class InjectionDataDecoratorMetadata extends DecoratorMetadata<InjectionDataDecoratorMetadata> {
    dependencies: Map<string, DependencyData>;

    constructor() {
        super();
        this.dependencies = new Map();
    }

    mergeMetadata(injectionData: InjectionDataDecoratorMetadata) {
        injectionData.dependencies.forEach((value, key, map) => {
            this.dependencies.set(key, value);
        }, this);
    }
}

export function Inject(dependencyToken?: Symbol) {
    return function (target: any, fieldName: string) {
        DecoratorUtil.throwOnWrongType(Inject, DecoratorType.PROPERTY, [...arguments]);
        let type = Reflect.getMetadata('design:type', target, fieldName);
        let dependencyData = InjectUtil.createDependencyData(dependencyToken, type, [...arguments]);

        let injectionDataDecoratorMetadata = DecoratorHelper.getOwnMetadata(target, Inject,
            new InjectionDataDecoratorMetadata());
        injectionDataDecoratorMetadata.dependencies.set(fieldName, dependencyData);
        DecoratorHelper.setMetadata(target, Inject, injectionDataDecoratorMetadata);
    };
}
DecoratorHelper.createDecorator(Inject, DecoratorType.PROPERTY);

export function Autowired() {
    return function (target: any, fieldName: string) {
        DecoratorUtil.throwOnWrongType(Autowired, DecoratorType.PROPERTY, [...arguments]);
        return Inject()(target, fieldName);
    };
}


export class ValueDecoratorMetadata extends DecoratorMetadata<ValueDecoratorMetadata> {
    properties: Map<string, string>;

    constructor() {
        super();
        this.properties = new Map();
    }

    mergeMetadata(valueDecoratorMetadata: ValueDecoratorMetadata) {
        valueDecoratorMetadata.properties.forEach((value, key, map) => {
            this.properties.set(key, value);
        }, this);
    }
}
export function Value(propertyKey) {
    return function (target: any, fieldName: string) {
        DecoratorUtil.throwOnWrongType(Value, DecoratorType.PROPERTY, [...arguments]);

        let valueDecoratorMetadata = DecoratorHelper.getOwnMetadata(target, Value,
            new ValueDecoratorMetadata());
        valueDecoratorMetadata.properties.set(fieldName, propertyKey);
        DecoratorHelper.setMetadata(target, Value, valueDecoratorMetadata);
    };
}
DecoratorHelper.createDecorator(Value, DecoratorType.PROPERTY);


export class DynamicInjectionDataDecoratorMetadata extends DecoratorMetadata<DynamicInjectionDataDecoratorMetadata> {
    dynamicDependencies: Map<string, DependencyData>;

    constructor() {
        super();
        this.dynamicDependencies = new Map();
    }

    mergeMetadata(injectionData: DynamicInjectionDataDecoratorMetadata) {
        injectionData.dynamicDependencies.forEach((value, key, map) => {
            this.dynamicDependencies.set(key, value);
        }, this);
    }
}
export function DynamicInject(dependencyToken?: Symbol) {
    return function (target: any, fieldName: string) {
        let type = Reflect.getMetadata('design:type', target, fieldName);
        let dependencyData = InjectUtil.createDependencyData(dependencyToken, type, [...arguments]);

        let dynamicInjectDecoratorMetadata = DecoratorHelper.getOwnMetadata(target, DynamicInject,
            new DynamicInjectionDataDecoratorMetadata());
        dynamicInjectDecoratorMetadata.dynamicDependencies.set(fieldName, dependencyData);
        DecoratorHelper.setMetadata(target, DynamicInject, dynamicInjectDecoratorMetadata);
    };
}
DecoratorHelper.createDecorator(DynamicInject, DecoratorType.PROPERTY);

export class ThreadLocalDecoratorMetadata extends DecoratorMetadata<ThreadLocalDecoratorMetadata> {
    threadLocalDependencies: Map<string, DependencyData>;

    constructor() {
        super();
        this.threadLocalDependencies = new Map();
    }

    mergeMetadata(threadLocalData: ThreadLocalDecoratorMetadata) {
        threadLocalData.threadLocalDependencies.forEach((value, key, map) => {
            this.threadLocalDependencies.set(key, value);
        }, this);
    }
}
export function ThreadLocal() {
    return function (target: any, fieldName: string) {
        let className = target.constructor.name;
        let token = Symbol(`thread-local:${className}#${fieldName}`);

        let threadLocalDecoratorMetadata = DecoratorHelper.getOwnMetadata(target, ThreadLocal,
            new ThreadLocalDecoratorMetadata());
        threadLocalDecoratorMetadata.threadLocalDependencies.set(fieldName, new DependencyData(token, false));
        DecoratorHelper.setMetadata(target, ThreadLocal, threadLocalDecoratorMetadata);
    };
}
DecoratorHelper.createDecorator(ThreadLocal, DecoratorType.PROPERTY);

export class InjectUtil {

    static createDependencyData(token, type, args: Array<any>): DependencyData {
        if (!token) {
            // fallback to field type
            // TODO: ^ should be lazy-loaded #50
            if (ComponentUtil.isComponent(type)) {
                token = ComponentUtil.getClassToken(type);
            } else {
                let subjectName = DecoratorUtil.getSubjectName(args);
                throw new InjectionError(`Cannot inject dependency which is not a @Component! (${subjectName})`);
            }
        }
        // NOTE assumption: if type not declared or any then type is Object and isArray is false
        return new DependencyData(token, TypeUtils.isA(type, Array));
    }
}