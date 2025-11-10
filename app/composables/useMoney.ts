/**
 * Format price to currency defined in managerConfig
 * @param price
 * @returns
 */
export function useFormatPrice(price: number, separator: boolean = true, code: string, currency: string): string {
    const money = new Intl.NumberFormat(code, {
        style: 'currency',
        currency: currency,
        useGrouping: separator,
    });

    return money.format(price);
}
