import { Commerce, Order, IAddress, IClient, ICoupon, IOrder, IPayment } from 'commerce.js';
export interface IRegion {
    name: string;
    code: string;
}
export interface ICountry extends IRegion {
    subdivisions: IRegion[];
}
export interface LibraryResponse {
    countries: ICountry[];
}
export interface ILibraryClient extends IClient {
    library: {
        shopjs: (opts: any) => Promise<LibraryResponse>;
    };
}
export default class ShopStore {
    lastChecked: undefined;
    countries: ICountry[];
    isLoading: boolean;
    tempOrder?: IOrder;
    step: number;
    commerce: Commerce;
    bootstrapPromise: Promise<any>;
    client: ILibraryClient;
    _payment: IPayment;
    constructor(client: ILibraryClient, analytics: any, raw: any);
    save(): void;
    load(): Promise<void>;
    get countryOptions(): {};
    get stateOptions(): {};
    setCoupon(code?: string): Promise<ICoupon | undefined>;
    setAddress(k: string, v: any): void;
    get address(): IAddress;
    setPayment(k: string, v: any): void;
    get payment(): {
        name: string;
        number: string;
        cvc: string;
        month: string;
        year: string;
    };
    setOrder(k: string, v: any): any;
    get order(): Order;
    setUser(k: string, v: any): void;
    get user(): import("commerce.js").User;
    checkout(): Promise<any>;
    setItem(id: string, quantity: number): Promise<void>;
    addItem(id: string, quantity: number): Promise<void>;
    track(event: string, opts: any): void;
    get count(): number;
}
