var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { action, computed, observable, runInAction, } from 'mobx';
import { Commerce, Order, } from 'commerce.js';
import { renderDate, rfc3339 } from '@hanzo/utils';
import akasha from 'akasha';
export default class ShopStore {
    constructor(client, analytics, raw = {}) {
        var _a;
        this.lastChecked = undefined;
        this.countries = [];
        this.isLoading = false;
        this.step = 0;
        this.bootstrapPromise = new Promise(() => { });
        this._payment = {
            account: {
                name: '',
                number: '',
                cvc: '',
                month: '',
                year: '',
            },
        };
        Object.assign(this, raw);
        this.client = client;
        this.commerce = new Commerce(client, undefined, [], [], analytics, raw.analyticsProductTransform);
        if (raw.storeId || this.order.storeId) {
            this.commerce.setStoreId((_a = raw.storeId) !== null && _a !== void 0 ? _a : this.order.storeId);
        }
        if (!this.order.currency) {
            this.order.currency = 'usd';
        }
        this.load();
    }
    save() {
        akasha.set('library.lastChecked', this.lastChecked);
        akasha.set('library.countries', this.countries);
    }
    async setStoreId(storeId) {
        this.commerce.setStoreId(storeId);
        return this.load();
    }
    async load() {
        let resolve, reject;
        this.bootstrapPromise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this.isLoading = true;
        this.countries = akasha.get('library.countries') || [];
        this.lastChecked = renderDate(new Date(), rfc3339);
        try {
            let res = await this.client.library.shopjs({
                hasCountries: !!this.countries && this.countries.length != 0,
                storeId: this.commerce.storeId,
                lastChecked: renderDate(this.lastChecked || '2000-01-01', rfc3339),
            });
            runInAction(() => {
                this.countries = res.countries || this.countries;
                this.order.currency = res.currency;
                this.order.shippingRates = res.shippingRates.geoRates;
                this.order.taxRates = res.taxRates.geoRates;
                this.save();
                this.isLoading = false;
            });
            resolve();
        }
        catch (e) {
            runInAction(() => {
                this.isLoading = false;
            });
            reject(e);
        }
    }
    get countryOptions() {
        let countries = this.countries.slice().sort((a, b) => {
            if (a.code.toUpperCase() == 'US') {
                return -1;
            }
            else if (b.code.toUpperCase() == 'US') {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        let options = {};
        for (let k in countries) {
            let country = countries[k];
            options[country.code.toUpperCase()] = country.name;
        }
        return options;
    }
    get stateOptions() {
        let options = {};
        let countries = this.countries;
        for (let k in countries) {
            let country = countries[k];
            let cCode = country.code.toUpperCase();
            let c = options[cCode];
            if (!c) {
                c = options[cCode] = {};
            }
            let subdivisions = country.subdivisions.slice().sort((a, b) => {
                if (a.name < b.name) {
                    return -1;
                }
                if (a.name > b.name) {
                    return 1;
                }
                return 0;
            });
            for (let k2 in subdivisions) {
                let subdivision = subdivisions[k2];
                c[subdivision.code.toUpperCase()] = subdivision.name;
            }
        }
        return options;
    }
    setCoupon(code) {
        return this.commerce.setCoupon(code);
    }
    setAddress(k, v) {
        this.commerce.order.shippingAddress[k] = v;
    }
    get address() {
        return this.commerce.order.shippingAddress;
    }
    setPayment(k, v) {
        this._payment.account[k] = v;
    }
    get payment() {
        return this._payment.account;
    }
    setOrder(k, v) {
        return this.commerce.order[k] = v;
    }
    get order() {
        return this.commerce.order;
    }
    setUser(k, v) {
        this.commerce.user[k] = v;
    }
    get user() {
        return this.commerce.user;
    }
    async checkout() {
        if (this.isLoading) {
            return;
        }
        this.isLoading = true;
        try {
            let o = await this.commerce.checkout(this._payment);
            this.isLoading = false;
            Order.clear();
            return o;
        }
        catch (e) {
            this.isLoading = false;
            throw e;
        }
    }
    async setItem(id, quantity) {
        if (quantity) {
            this.track('Viewed Checkout Step', { step: 1 });
        }
        await this.commerce.set(id, quantity);
        if (quantity) {
            this.track('Completed Checkout Step', { step: 1 });
        }
    }
    async addItem(id, quantity) {
        if (quantity) {
            this.track('Viewed Checkout Step', { step: 1 });
        }
        let item = await this.commerce.get(id);
        if (item && item.quantity) {
            quantity += item.quantity;
        }
        await this.commerce.set(id, quantity);
        if (quantity) {
            this.track('Completed Checkout Step', { step: 1 });
        }
    }
    track(event, opts) {
        if (this.commerce.analytics) {
            this.commerce.analytics.track(event, opts);
        }
    }
    get count() {
        return this.order.items.reduce((a, b) => a + b.quantity, 0);
    }
}
__decorate([
    observable,
    __metadata("design:type", Object)
], ShopStore.prototype, "lastChecked", void 0);
__decorate([
    observable,
    __metadata("design:type", Array)
], ShopStore.prototype, "countries", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], ShopStore.prototype, "isLoading", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], ShopStore.prototype, "tempOrder", void 0);
__decorate([
    observable,
    __metadata("design:type", Number)
], ShopStore.prototype, "step", void 0);
__decorate([
    observable,
    __metadata("design:type", Commerce)
], ShopStore.prototype, "commerce", void 0);
__decorate([
    observable,
    __metadata("design:type", Promise)
], ShopStore.prototype, "bootstrapPromise", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], ShopStore.prototype, "client", void 0);
__decorate([
    observable,
    __metadata("design:type", Object)
], ShopStore.prototype, "_payment", void 0);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopStore.prototype, "setStoreId", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopStore.prototype, "load", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ShopStore.prototype, "countryOptions", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ShopStore.prototype, "stateOptions", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopStore.prototype, "setCoupon", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopStore.prototype, "setAddress", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ShopStore.prototype, "address", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopStore.prototype, "setPayment", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ShopStore.prototype, "payment", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopStore.prototype, "setOrder", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ShopStore.prototype, "order", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopStore.prototype, "setUser", null);
__decorate([
    computed,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ShopStore.prototype, "user", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ShopStore.prototype, "checkout", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ShopStore.prototype, "setItem", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ShopStore.prototype, "addItem", null);
__decorate([
    action,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ShopStore.prototype, "track", null);
__decorate([
    computed,
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [])
], ShopStore.prototype, "count", null);
