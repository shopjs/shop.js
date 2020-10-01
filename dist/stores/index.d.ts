import ShopStore, { ILibraryClient } from './ShopStore';
export { default as ShopStore } from './ShopStore';
export * from './ShopStore';
declare const getStore: (cl?: ILibraryClient | undefined, analytics?: any, opts?: {}) => ShopStore;
export default getStore;
