import DistrictResource from "./districtResource.js";
import ProvinceResource from "./provinceResource.js";

export default class LocationResource {
    constructor(location) {
        this.id = location._id,
        this.address = location.address,
        this.province = location.province ? new ProvinceResource(location.province) : null
        this.district = location.district ? new DistrictResource(location.district) : null
    }
}