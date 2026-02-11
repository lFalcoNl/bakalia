export const getUnitPrice = (product, quantity) => {
    const qty = Number(quantity) || 0

    const price = Number(product.price) || 0
    const wholesalePrice = Number(product.wholesalePrice) || 0
    const minQty = Number(product.wholesaleMinQty) || 0

    if (wholesalePrice > 0 && minQty > 0 && qty >= minQty) {
        return wholesalePrice
    }

    return price
}
