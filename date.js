// date format
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0! deswegen + 1
let yyyy = today.getFullYear();

export const dateFormatted = yyyy + '_' + mm + '_' + dd;