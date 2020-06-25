import { ILibraryClient } from './stores';
export interface Options {
    el?: Element;
    termsUrl?: string;
    completionUrl?: string;
    width?: number;
    height?: number;
    locked?: boolean;
    contactIcon?: any;
    contactTitle?: string;
    shippingIcon?: any;
    shippingTitle?: string;
    paymentIcon?: any;
    paymentTitle?: string;
    cartIcon?: any;
    cartTitle?: string;
    showDescription?: boolean;
    showTotals?: boolean;
}
declare const checkout: (client: ILibraryClient, opts?: Options) => void;
export default checkout;
export declare const cart: (client: ILibraryClient, opts?: Options) => void;
export declare const count: (client: ILibraryClient, opts?: Options) => void;
export declare const shopify: (client: ILibraryClient, opts?: Options) => void;
