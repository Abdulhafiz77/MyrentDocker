import DetailsTypeResource from "./detailsTypeResource.js";
import LocationResource from "./locationResource.js";
import DetailsResource from "./detailsResource.js";
import TypeResource from "./typeResource.js";
import UserResource from "./userResource.js"

export default class EstateWithoutResource {
    constructor(estate) {
        this.id = estate._id,
        this.images = estate.images,
        this.title = estate.title,
        this.description = estate.description,
        this.price = estate.price,
        this.size = estate.size,
        this.status = estate.status,
        this.category = estate.category,
        this.type = estate.type ? new TypeResource(estate.type) : null,
        this.detailedType = estate.detailedType ? new DetailsTypeResource(estate.detailedType) : null,
        this.details = estate.details ? new DetailsResource(estate.details) : null,
        this.location = estate.location ? new LocationResource(estate.location) : null,
        this.createdAt = estate.createdAt.toDateString();
        this.updatedAt = estate.updatedAt.toDateString();
    }
}