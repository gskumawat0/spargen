module.exports = function Cart(oldCart) {
    this.products = oldCart.products || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    console.log(this);
    this.add = function(product, id) {
        var storedProduct = this.products[id];
        if (!storedProduct) {
            storedProduct = this.products[id] = {
                product : {
                    sellerName: product.sellerName,
                    image: product.image,
                    discounted_price: product.discounted_price,
                    printed_price : product.printed_price,
                    name : product.name
                }, 
                qty: 0, price: 0
            };
        }
        console.log(this.products[id]);
        storedProduct.qty++;
        storedProduct.price = storedProduct.product.discounted_price * storedProduct.qty;
        this.totalQty++;
        this.totalPrice += storedProduct.product.discounted_price;
    };

    this.reduceByOne = function(id) {
        this.products[id].qty--;
        this.products[id].price -= this.products[id].product.discounted_price;
        this.totalQty--;
        this.totalPrice -= this.products[id].product.discounted_price;

        if (this.products[id].qty <= 0) {
            delete this.products[id];
        }
    };

    this.removeProduct = function(id) {
        this.totalQty -= this.products[id].qty;
        this.totalPrice -= this.products[id].price;
        delete this.products[id];
    };
    
    this.generateArray = function() {
        var arr = [];
        for (var id in this.products) {
            arr.push(this.products[id]);
        }
        return arr;
    };
};