export default class ProvinceResource {
    constructor(province) {
        this.id = province._id,
        this.code = province.code,
        this.name = province.name
    }
}
