import TypeResource from "./typeResource.js"

export default class DetailsTypeResource {
    constructor(detailsType) {
        this.id = detailsType._id,
        this.name = detailsType.name,
        this.parent = detailsType.parent ? new TypeResource(detailsType.parent) : null
    }
}