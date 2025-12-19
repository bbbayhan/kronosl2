export class OrderLevel {
    public readonly price: number;
    public readonly quantity: number;
    public readonly total?: number;

    constructor(price: number, quantity: number, total?: number) {
        this.price = price;
        this.quantity = quantity;
        this.total = total;
    }

    static create(json: { price: number; quantity: number; total?: number }) {
        return new OrderLevel(json.price, json.quantity, json.total);
    }
}