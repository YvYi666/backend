const uniqueSlug = require('unique-slug')

module.exports.getSlug=()=>{
    let radomSlug =uniqueSlug()
    return radomSlug
}
// console.log(uniqueSlug());