let BaseModel;

function AdHocCommandModel (method, resource, config) {
    BaseModel.call(this, 'ad_hoc_commands');

    this.Constructor = AdHocCommandModel;

    return this.create(method, resource, config);
}

function AdHocCommandModelLoader (_BaseModel_) {
    BaseModel = _BaseModel_;

    return AdHocCommandModel;
}

AdHocCommandModelLoader.$inject = ['BaseModel'];

export default AdHocCommandModelLoader;
