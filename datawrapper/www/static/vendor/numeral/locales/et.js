// numeral.js locale configuration
// locale : Estonian
// author : Illimar Tambek : https://github.com/ragulka
// Note: in Estonian, abbreviations are always separated from numbers with a space

export default {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: ' tuh',
        million: ' mln',
        billion: ' mld',
        trillion: ' trl'
    },
    ordinal: function(number) {
        return '.';
    },
    currency: {
        symbol: '€'
    }
};
