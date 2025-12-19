export class KrakenBookEntry {
    public readonly price: number;
    public readonly qty: number;

    constructor(price: number, qty: number) {
        this.price = price;
        this.qty = qty;
    }

    static create(json: { price: number; qty: number }) {
        return new KrakenBookEntry(json.price, json.qty);
    }
}