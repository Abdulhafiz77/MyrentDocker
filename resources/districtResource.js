import ProvinceResource from "./provinceResource.js"

export default class DistrictResource {
    constructor(district) {
        this.id = district._id,
        this.name = district.name,
        this.province = new ProvinceResource(district.province)
    }
}