export default class DetailsResource {
    constructor(details) {
        this.id = details._id,
        this.buildingYear = details.buildingYear,
        this.roomAndSaloon = details.roomAndSaloon,
        this.floor = details.floor,
        this.locatedFloor = details.locatedFloor,
        this.bathroom = details.bathroom,
        this.internet = details.internet,
        this.furnished = details.furnished,
        this.balcony = details.balcony,
        this.elevator = details.elevator,
        this.thermalInsulation = details.thermalInsulation,
        this.garage = details.garage,
        this.fittedKitchen = details.fittedKitchen,
        this.fittedBathroom = details.fittedBathroom,
        this.parquet = details.parquet,
        this.heatingType = details.heatingType
    }
}