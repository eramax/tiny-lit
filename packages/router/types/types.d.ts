export interface RouteCallbacks {
    onEnter?(matches: any): any;
    onLeave?(matches: any): any;
    onUpdate?(matches: any): any;
}
export interface RouteComponent extends HTMLElement {
    onRouteUpdate?(matches: any): any;
    onRouteEnter?(matches: any): any;
    onRouteLeave?(): any;
}
export declare type Route = {
    regex: RegExp;
} & RouteCallbacks;
export declare enum RouterEvents {
    Request = "router::request",
    Change = "router::change"
}
export interface Router {
    routes: Map<string, Route>;
    current?: Route;
    on(path: string, callbacks: RouteCallbacks): any;
    off(path: string): any;
    resolve(): any;
    goTo(path: any): any;
}
export declare type RequestRouterEvent = CustomEvent<{
    router?: Router;
}>;
export declare type RouterOptions = {
    interceptLocals?: boolean;
    useHash?: Boolean;
};
export declare type HistoryInterface = {
    path(): string;
    go(path: string): void;
    listen(callback: () => void): Function;
};
