export default class TypeResource {
    constructor(type) {
        this.id = type._id,
        this.name = type.name
    }
}
